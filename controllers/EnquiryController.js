const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");

// Power Automate flow endpoint
const FLOW_URL = process.env.enquiry_flow_url;

// Flow secret (if still required by the flow)
const EnquiryFlowSecret = process.env.enquiry_flow_secret;

const CreateEnquiry = async (req, res) => {
  //   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }

  const { FirstName, LastName, Email, Phone, EnquiryType, Message } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (!FirstName || !Email || !EnquiryType || !LastName || !Phone || !Message) {
    return res
      .status(400)
      .json({
        error:
          "Missing required fields: FirstName, Email, EnquiryType, LastName, or Phone",
      });
  }

  // Construct the data object to be sent to Power Automate
  const data = {
    FirstName,
    LastName,
    Email,
    Phone,
    EnquiryType,
    Message,
  };

  console.log("Sending enquiry data to Power Automate:", data);

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
  data.flow_secret = EnquiryFlowSecret;

  //   console.log('Sending data to Power Automate:', data);

  try {
    // get accesstoken from the
    // Get OAuth access token

    const accessToken = await getAccessToken();

    // Send request to Power Automate
    const response = await axios.post(FLOW_URL, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // Include x-api-key if the flow still checks it
        "x-api-key": EnquiryFlowSecret,
      },
    });

    // Handle successful response
    res.status(200).json({
      message: "Enquiry Data successfully sent to Power Automate flow",
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
  CreateEnquiry,
};
