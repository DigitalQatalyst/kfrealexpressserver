const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");

// Power Automate flow endpoint
const FLOW_URL = process.env.onboarding_flow_url;
const FLOW_SECRET = process.env.flow_secret;

const onBoarding = async (req, res) => {
  //   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }

  const {
    CompanyName,
    Industry,
    CompanyStage,
    ContactName,
    Email,
    Phone,
    InitialCapitalUSD,
    FundingNeedsUSD,
    BusinessRequirements,
    BusinessNeeds,
    EmployeeCount,
    Founders,
    FoundingYear,
    Address,
    City,
    Country,
    Website,
    BusinessPitch,
    ProblemStatement,
    RegistrationNumber,
    EstablishmentDate,
    BusinessSize,
  } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (!Email || !CompanyName || !Industry || !ContactName) {
    return res.status(400).json({
      error:
        "Missing required fields: Email, CompanyName, Industry, or ContactName",
    });
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
    FoundingYear: new Date(FoundingYear).toISOString().split("T")[0], // Convert to YYYY-MM-DD format
    Address,
    City,
    Country,
    Website,
    BusinessPitch,
    ProblemStatement,
    RegistrationNumber,
    EstablishmentDate: new Date(EstablishmentDate).toISOString().split("T")[0], // Convert to YYYY-MM-DD format
    BusinessSize,
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
