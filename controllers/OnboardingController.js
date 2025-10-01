const express = require('express');
const axios = require('axios');

// Power Automate flow endpoint
const FLOW_URL = 'https://3b095fb55afdedef9492cc6f8add41.4e.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/96e00b17f82a4c26a3702e3d362688e0/triggers/manual/paths/invoke?api-version=1';

// Azure AD configuration (replace with your values)
const AZURE_AD = {
  tenantId: process.env.tenant_id, // e.g., '12345678-1234-1234-1234-1234567890ab'
  clientId: process.env.client_id,
   // e.g., '87654321-4321-4321-4321-0987654321ba'
  clientSecret: process.env.client_secret, // e.g., 'your-secret-value'
  scope: 'https://service.flow.microsoft.com//.default',
};

// Flow secret (if still required by the flow)
const FLOW_SECRET = process.env.flow_secret;

// Function to get Azure AD access token
async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${AZURE_AD.tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: AZURE_AD.clientId,
    client_secret: AZURE_AD.clientSecret,
    scope: AZURE_AD.scope,
  });

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    console.log("token response",response.data)
    return response.data.access_token;
  } catch (error) {
    throw new Error('Failed to obtain access token: ' + (error.response?.data?.error_description || error.message));
  }
}

const onBoarding = async (req, res) => {
//   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }

const {
    CompanyName, Industry, CompanyStage, ContactName, Email, Phone, InitialCapitalUSD, FundingNeedsUSD, 
    BusinessRequirements, BusinessNeeds, EmployeeCount, Founders, FoundingYear, Address, City, Country, 
    Website, BusinessPitch, ProblemStatement, RegistrationNumber, EstablishmentDate, BusinessSize
  } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (!Email || !CompanyName || !Industry || !ContactName) {
    return res.status(400).json({ error: 'Missing required fields: Email, CompanyName, Industry, or ContactName' });
  }

  // Construct the data object to be sent to Power Automate
  const data = {
    CompanyName, 
    Industry, 
    CompanyStage, 
    ContactName, 
    Email, 
    Phone, 
    InitialCapitalUSD: Number(InitialCapitalUSD), // Convert to number
    FundingNeedsUSD: Number(FundingNeedsUSD), // Convert to number
    BusinessRequirements, 
    BusinessNeeds, 
    EmployeeCount: Number(EmployeeCount), // Convert to number
    Founders, 
    FoundingYear: new Date(FoundingYear).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    Address, 
    City, 
    Country, 
    Website, 
    BusinessPitch, 
    ProblemStatement, 
    RegistrationNumber, 
    EstablishmentDate: new Date(EstablishmentDate).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    BusinessSize
  };

  console.log('Sending data to Power Automate:', data);
  
//   console.log("data",data)
//   console.log("my token",data.token)
//   return

  // Validate input
  if (!data) {
    return res.status(400).json({ error: 'Invalid or empty JSON data provided' });
  }

  // Add flow_secret to the body (if required by the flow)
  data.flow_secret = FLOW_SECRET;

//   console.log('Sending data to Power Automate:', data);

  try {
    // get accesstoken from the 
    // Get OAuth access token
    
    const accessToken = await getAccessToken();

    // Send request to Power Automate
    const response = await axios.post(FLOW_URL, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        // Include x-api-key if the flow still checks it
        'x-api-key': FLOW_SECRET.toLowerCase(),
      },
    });

    // Handle successful response
    res.status(200).json({
      message: 'Data successfully sent to Power Automate flow',
      result: response.data,
    });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to send data to Power Automate flow',
      details: error.response ? error.response.data : error.message,
    });
  }
};

module.exports = {
  onBoarding,
};