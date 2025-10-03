const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");

// Power Automate flow endpoint
const FLOW_URL = process.env.consultation_flow_url;

// Flow secret (if still required by the flow)
// const FLOW_SECRET = process.env.flow_secret;
const ConsultationFlowSecret = process.env.consultation_flow_secret;

// Function to get Azure AD access token

const BookConsultation = async (req, res) => {
  //   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }

  const { Name, Nameofpersonmakingthesubmission, EmailAddress1 } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (!Name || !Nameofpersonmakingthesubmission || !EmailAddress1) {
    return res.status(400).json({
      error:
        "Missing required fields: Name, Nameofpersonmakingthesubmission, EmailAddress1",
    });
  }

  // Construct the data object to be sent to Power Automate
  const data = {
    Name,
    Nameofpersonmakingthesubmission,
    EmailAddress1,
  };

  console.log("Sending data to Power Automate:", data);

  //   console.log("data",data)
  //   console.log("my token",data.token)
  //   return

  // Validate input
  if (!data) {
    return res
      .status(400)
      .json({ error: "Invalid or empty JSON data provided" });
  }

  // Add flow_secret to the body (if required by the flow)
  data.flow_secret = ConsultationFlowSecret;

  //   console.log('Sending data to Power Automate:', data);

  try {
    // get accesstoken from the
    // Get OAuth access token

    const accessToken = await getAccessToken();
    console.log("📤 sending consultation request....");

    // Send request to Power Automate
    const response = await axios.post(FLOW_URL, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // Include x-api-key if the flow still checks it
        "x-api-key": ConsultationFlowSecret.toLowerCase(),
      },
    });

    // Handle successful response
    res.status(200).json({
      message: "Data successfully sent to Power Automate flow",
      result: response.data,
    });
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Failed to send data to Power Automate flow",
      details: error.response ? error.response.data : error.message,
    });
  }
};

module.exports = {
  BookConsultation,
};
