const dynamicsService = require('../services/dynamicsService');

// Helper function to resolve roles based on customer type
function resolveUserRoles(customerType) {
  switch (customerType) {
    case 'enterprise':
      return ['contributor', 'creator'];
    case 'partner':
      return ['creator'];
    case 'media':
      return ['viewer'];
    case 'community':
      return ['viewer'];
    default:
      return ['viewer'];
  }
}

// Endpoint 1: Validate user input before sign-up
exports.validateSignUp = async (req, res) => {
  try {
    console.log('=== VALIDATE SIGN-UP REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { extension_customerType, extension_enterpriseName } = req.body;

    // Validate: Enterprise customers must have enterprise name
    if (extension_customerType === 'enterprise' && !extension_enterpriseName) {
      console.log('Validation failed: Enterprise name required');
      return res.status(400).json({
        version: '1.0.0',
        action: 'ValidationError',
        userMessage: 'Enterprise name is required for enterprise customers',
        status: 400
      });
    }

    // Validation passed
    console.log('Validation successful');
    return res.json({
      version: '1.0.0',
      action: 'Continue',
      userMessage: 'Validation successful'
    });
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      version: '1.0.0',
      action: 'ValidationError',
      userMessage: 'Validation failed',
      status: 500
    });
  }
};

// Endpoint 2: Enrich user profile after sign-up (create Contact in Dataverse)
exports.enrichSignUp = async (req, res) => {
  try {
    console.log('=== ENRICH SIGN-UP REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      email,
      displayName,
      objectId,
      extension_customerType,
      extension_enterpriseName,
      extension_preferredLanguage,
      extension_marketingConsent,
      extension_enterpriseAffiliation
    } = req.body;

    console.log(`Creating Contact in Dataverse for: ${email}`);

    // Create Contact in Dataverse
    const contact = await dynamicsService.createContact({
      email,
      displayName,
      azureObjectId: objectId,
      customerType: extension_customerType,
      enterpriseName: extension_enterpriseName,
      preferredLanguage: extension_preferredLanguage,
      marketingConsent: extension_marketingConsent,
      enterpriseAffiliation: extension_enterpriseAffiliation
    });

    console.log('Contact created with ID:', contact.contactid);

    // Return crmContactId to Azure
    const response = {
      version: '1.0.0',
      action: 'Continue',
      extension_crmContactId: contact.contactid
    };

    console.log('Response to Azure:', JSON.stringify(response, null, 2));
    return res.json(response);
  } catch (error) {
    console.error('Enrich error:', error);
    return res.status(500).json({
      version: '1.0.0',
      action: 'ShowBlockPage',
      userMessage: 'Failed to create user profile. Please try again.',
      status: 500
    });
  }
};

// Endpoint 3: Resolve roles before token issuance (fetch Contact from Dataverse)
exports.resolveRoles = async (req, res) => {
  try {
    console.log('=== RESOLVE ROLES REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { extension_crmContactId, objectId, email } = req.body;

    console.log(`Fetching Contact from Dataverse: ${extension_crmContactId || objectId || email}`);

    // Fetch Contact from Dataverse
    let contact;
    if (extension_crmContactId) {
      contact = await dynamicsService.getContactById(extension_crmContactId);
    } else if (objectId) {
      contact = await dynamicsService.getContactByAzureId(objectId);
    }

    if (!contact) {
      console.log('Contact not found');
      return res.status(404).json({
        version: '1.0.0',
        action: 'ShowBlockPage',
        userMessage: 'User profile not found',
        status: 404
      });
    }

    // Resolve roles based on customer type
    const roles = resolveUserRoles(contact.new_customertype);

    console.log(`Contact found: ${contact.emailaddress1}`);
    console.log(`Roles assigned: ${roles.join(', ')}`);

    // Return all custom attributes + roles to Azure
    const response = {
      version: '1.0.0',
      action: 'Continue',
      extension_customerType: contact.new_customertype,
      extension_enterpriseName: contact.new_enterprisename,
      extension_preferredLanguage: contact.new_preferredlanguage,
      extension_marketingConsent: contact.new_marketingconsent,
      extension_enterpriseAffiliation: contact.new_enterpriseaffiliation,
      roles: roles
    };

    console.log('Response to Azure:', JSON.stringify(response, null, 2));
    return res.json(response);
  } catch (error) {
    console.error('Role resolution error:', error);
    // Return default role on error to allow sign-in
    return res.json({
      version: '1.0.0',
      action: 'Continue',
      roles: ['viewer']
    });
  }
};
