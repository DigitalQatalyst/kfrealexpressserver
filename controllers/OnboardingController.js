const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");
// const { generateUUID } = require("../services/generateUuid");

// Power Automate flow endpoint
const FLOW_URL = process.env.onboarding_flow_url;
const FLOW_SECRET = process.env.flow_secret;

const onBoarding = async (req, res) => {
  //   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }
  // const uuid = await generateUUID();
  // return;
  const {
    userId,
    companyName,
    industry,
    companyStage,
    contactName,
    email,
    phone,
    initialCapitalUSD,
    fundingNeedsUSD,
    businessRequirements,
    businessNeeds,
    employeeCount,
    founders,
    foundingYear,
    address,
    city,
    country,
    website,
    businessPitch,
    problemStatement,
    registrationNumber,
    establishmentDate,
    businessSize,
    businessType,
  } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (!email || !companyName || !industry || !contactName) {
    return res.status(400).json({
      error:
        "Missing required fields: Email, CompanyName, Industry, or ContactName",
    });
  }

  // Construct the data object to be sent to Power Automate
  const data = {
    formId,
    userId,
    companyName,
    industry,
    companyStage,
    contactName,
    email,
    phone,
    initialCapitalUSD: Number(initialCapitalUSD), // Convert to number
    fundingNeedsUSD: Number(fundingNeedsUSD), // Convert to number
    businessRequirements,
    businessNeeds,
    employeeCount: Number(employeeCount), // Convert to number
    founders,
    foundingYear: new Date(foundingYear).toISOString().split("T")[0], // Convert to YYYY-MM-DD format
    address,
    city,
    country,
    website,
    businessPitch,
    problemStatement,
    registrationNumber,
    establishmentDate: new Date(establishmentDate).toISOString().split("T")[0], // Convert to YYYY-MM-DD format
    businessSize,
  };

  console.log("📤 sending onboarding request....");

  // return

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
  data.flow_secret = FLOW_SECRET;

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
        "x-api-key": FLOW_SECRET.toLowerCase(),
      },
    });
    console.log("onboarding data has been submitted successfully");

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
  onBoarding,
};
