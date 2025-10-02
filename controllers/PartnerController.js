const express = require('express');
const axios = require('axios');
const { getAccessToken } = require('../services/getFlowTokens');

// Power Automate flow endpoint
const FLOW_URL = process.env.partner_flow_url;



// Flow secret (if still required by the flow)
const PartnerFlowSecret = process.env.partner_flow_secret;



const CreatePartnerShip = async (req, res) => {
//   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }

const {
  Name,Email,ServiceCategory,Message
  } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (!Name || !Email || !ServiceCategory) {
    return res.status(400).json({ error: 'Missing required fields: Name, Email, or ServiceCategory' });
  }

  // Construct the data object to be sent to Power Automate
  const data = {
   Name,Email,ServiceCategory,Message
  };

  console.log('Sending partner data to Power Automate:', data);
  
//   console.log("data",data)
//   console.log("my token",data.token)
//   return

  // Validate input
  if (!data) {
    return res.status(400).json({ error: 'Invalid or empty JSON data provided' });
  }

  // Add flow_secret to the body (if required by the flow)
  data.flow_secret = PartnerFlowSecret;

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
        'x-api-key': PartnerFlowSecret,
      },
    });

    // Handle successful response
    res.status(200).json({
      message: 'Partner Data successfully sent to Power Automate flow',
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
  CreatePartnerShip,
};