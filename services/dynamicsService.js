const axios = require('axios');

class DynamicsService {
  constructor() {
    this.instanceUrl = process.env.DYNAMICS_INSTANCE_URL;
    this.clientId = process.env.DYNAMICS_CLIENT_ID;
    this.clientSecret = process.env.DYNAMICS_CLIENT_SECRET;
    this.tenantId = process.env.DYNAMICS_TENANT_ID;
    this.accessToken = null;
  }

  // Get access token for Dataverse
  async getAccessToken() {
    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: `${this.instanceUrl}/.default`,
        grant_type: 'client_credentials'
      });

      const response = await axios.post(tokenUrl, params);
      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw error;
    }
  }

  // Create Contact in Dataverse
  async createContact(data) {
    try {
      const token = await this.getAccessToken();
      
      const contactData = {
        emailaddress1: data.email,
        fullname: data.displayName,
        new_azureobjectid: data.azureObjectId,
        new_customertype: data.customerType,
        new_enterprisename: data.enterpriseName,
        new_preferredlanguage: data.preferredLanguage,
        new_marketingconsent: data.marketingConsent,
        new_enterpriseaffiliation: data.enterpriseAffiliation
      };

      const response = await axios.post(
        `${this.instanceUrl}/api/data/v9.2/contacts`,
        contactData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get Contact by ID
  async getContactById(contactId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.instanceUrl}/api/data/v9.2/contacts(${contactId})?$select=contactid,emailaddress1,fullname,new_azureobjectid,new_customertype,new_enterprisename,new_preferredlanguage,new_marketingconsent,new_enterpriseaffiliation`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting contact:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get Contact by Azure Object ID
  async getContactByAzureId(azureObjectId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.instanceUrl}/api/data/v9.2/contacts?$filter=new_azureobjectid eq '${azureObjectId}'&$select=contactid,emailaddress1,fullname,new_azureobjectid,new_customertype,new_enterprisename,new_preferredlanguage,new_marketingconsent,new_enterpriseaffiliation`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json'
          }
        }
      );

      return response.data.value.length > 0 ? response.data.value[0] : null;
    } catch (error) {
      console.error('Error getting contact by Azure ID:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new DynamicsService();
