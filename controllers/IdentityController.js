/**
 * Identity Controller
 * Handles Azure External ID API Connector requests
 * Returns custom claims for authentication tokens
 */

const resolveUserClaims = async (req, res) => {
  try {
    console.log('========================================');
    console.log('🔐 Azure API Connector Called');
    console.log('========================================');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    const { email, sub, objectId, displayName, givenName, surname } = req.body;

    console.log('📧 User Email:', email);
    console.log('🆔 User ID:', sub || objectId);

    // TODO: Query your database for real user data
    // Example: const user = await User.findOne({ email });

    // For now, return mock data
    // In production, replace with actual database queries
    const customClaims = {
      // Custom extension attributes
      extension_customerType: "Enterprise",
      extension_enterpriseName: "Test Company LLC",
      extension_crmContactId: objectId || sub,
      extension_preferredLanguage: "en",
      extension_marketingConsent: true,
      extension_enterpriseAffiliation: "Main Office",
      
      // Roles for RBAC
      roles: [
        "enterprise.account.admin",
        "community.member"
      ]
    };

    console.log('✅ Returning Claims:', JSON.stringify(customClaims, null, 2));
    console.log('========================================');

    return res.status(200).json(customClaims);

  } catch (error) {
    console.error('❌ Error in resolveUserClaims:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  resolveUserClaims
};
