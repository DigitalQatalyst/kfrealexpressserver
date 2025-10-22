const express = require("express");
const axios = require("axios");
const { getAccessToken, fetchCRMToken } = require("../services/getFlowTokens");

// Power Automate flow endpoint
const FLOW_URL = process.env.contactus_flow_url;

// Flow secret (if still required by the flow)
const ContactFlowSecret = process.env.contactus_flow_secret;

// log secret

const CreateContact = async (req, res) => {
  //   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }

  const { name, email, message } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  // Construct the data object to be sent to Power Automate
  const data = {
    name,
    email,
    message,
  };

  console.log("📤 sending contact request....", data);

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
  data.flow_secret = ContactFlowSecret;
  // console.log("lower", ContactFlowSecret.toLowerCase());

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
        "x-api-key": ContactFlowSecret,
      },
    });

    // Handle successful response
    res.status(200).json({
      message: "Contact Data successfully sent to Power Automate flow",
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

const getStakeholderCommunications = async (req, res) => {
  const token = await fetchCRMToken();

  if (!token) {
    return res
      .status(400)
      .json({ error: "authToken is required in the request body" });
  }

  try {
    // Create headers object
    const headers = {
      Authorization: `${token}`,
      Accept: "application/json",
      "Data-Version": "4.0",
      "Data-MaxVersion": "4.0",
    };

    // Make the GET request using axios
    const response = await axios.get(
      // `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/accounts?$filter=accountid eq \'${accountid}\'`,
      `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_reallocationofloandisbursementforms`,
      { headers }
    );

    // console.log("account profile", response.data);

    // Return the response data
    res.status(200).json(response.data);

    const contact = response?.data?.value[0]?._primarycontactid_value;
    // console.log('contact', contact);

    return;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error fetching data for reallocated disbursed loans:",
        error.response?.data || error.message
      );
      return res.status(error.response?.status || 500).json({
        error: error.response?.data || error.message,
      });
    } else {
      console.error("Error fetching data for specific account:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }
};

module.exports = {
  CreateContact,
  getStakeholderCommunications,
};
