/**
 * Identity Controller
 * Handles Azure External ID API Connector requests
 * Returns custom claims for authentication tokens
 */

// Helper function to determine user affiliation based on Azure claims
function determineAffiliation(userContext) {
  // You can use various signals from the userContext to determine affiliation
  // For example: Azure groups, email domain, or custom attributes
  const { email, groups = [], jobTitle } = userContext;
  
  if (email?.includes('admin@')) return 'Administration';
  if (email?.includes('support@')) return 'Support';
  if (jobTitle?.toLowerCase().includes('manager')) return 'Management';
  
  return 'Member'; // Default affiliation
}

// Helper function to determine user roles based on Azure claims
function determineUserRoles(userContext) {
  const roles = ['community.member']; // Base role for all users
  const { email, groups = [] } = userContext;
  
  // Add roles based on email pattern
  if (email?.includes('admin@')) {
    roles.push('enterprise.account.admin');
  }
  
  // Add roles based on Azure AD groups
  if (groups.includes('Administrators')) {
    roles.push('platform.admin');
  }
  
  return roles;
}

// Basic auth middleware
const validateApiConnectorAuth = (req, res, next) => {
  // Get authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header'
    });
  }

  // Extract credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Get credentials from API connector environment
  const EXPECTED_USERNAME = process.env.API_CONNECTOR_USERNAME;
  const EXPECTED_PASSWORD = process.env.API_CONNECTOR_PASSWORD;

  if (!EXPECTED_USERNAME || !EXPECTED_PASSWORD) {
    console.error('API Connector credentials not configured');
    return res.status(500).json({
      error: 'Server Configuration Error',
      message: 'API Connector credentials not properly configured'
    });
  }

  if (username !== EXPECTED_USERNAME || password !== EXPECTED_PASSWORD) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid credentials'
    });
  }

  next();
};

const resolveUserClaims = async (req, res) => {
  try {
    console.log('========================================');
    console.log('🔐 Azure API Connector Called');
    console.log('========================================');
    
    // Log the incoming request details
    const requestId = Date.now().toString();
    console.log(`Request ID: ${requestId}`);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    // Azure sends custom attributes in the request body
    const { 
      email, 
      sub, 
      objectId, 
      displayName, 
      givenName, 
      surname,
      // Custom attributes from Azure (if they exist)
      extension_customerType,
      extension_enterpriseName,
      extension_crmContactId,
      extension_preferredLanguage,
      extension_marketingConsent,
      extension_enterpriseAffiliation
    } = req.body;

    // Log user identification details
    console.log({
      requestId,
      timestamp: new Date().toISOString(),
      event: 'identity_resolution_start',
      user: {
        email,
        userId: sub || objectId,
        displayName
      },
      receivedAttributes: {
        extension_customerType,
        extension_enterpriseName,
        extension_crmContactId,
        extension_preferredLanguage,
        extension_marketingConsent,
        extension_enterpriseAffiliation
      }
    });

    // Use real data from Azure, or calculate defaults if not provided
    const customClaims = {
      extension_crmContactId: extension_crmContactId || objectId || sub,
      extension_customerType: extension_customerType || (email.includes('@enterprise.') ? 'Enterprise' : 'Individual'),
      extension_enterpriseName: extension_enterpriseName || email.split('@')[1]?.split('.')[0] || displayName,
      extension_preferredLanguage: extension_preferredLanguage || req.body.ui_locales || 'en',
      extension_marketingConsent: extension_marketingConsent !== undefined ? extension_marketingConsent : false,
      extension_enterpriseAffiliation: extension_enterpriseAffiliation || determineAffiliation(req.body),
      roles: determineUserRoles(req.body)
    };

    // Log the resolved claims
    console.log({
      requestId,
      timestamp: new Date().toISOString(),
      event: 'identity_resolution_success',
      user: {
        email,
        userId: sub || objectId
      },
      claims: {
        customerType: customClaims.extension_customerType,
        enterpriseName: customClaims.extension_enterpriseName,
        roles: customClaims.roles
      }
    });
    
    console.log('✅ Claims Resolution Completed');
    console.log('========================================');

    // Return in Azure API Connector format
    return res.status(200).json({
      data: {
        "@odata.type": "microsoft.graph.onTokenIssuanceStartResponseData",
        actions: [
          {
            "@odata.type": "microsoft.graph.tokenIssuanceStart.provideClaimsForToken",
            claims: customClaims
          }
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error in resolveUserClaims:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  resolveUserClaims,
  validateApiConnectorAuth
};
