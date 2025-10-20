const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");
const { generateUUID } = require("../services/generateUuid");

// Power Automate flow endpoint
const FLOW_URL = process.env.requestfunding_url;

// Flow secret (if still required by the flow)
const RequestFundingLoanFlowSecret = process.env.requestfunding_secret;

const RequestFunding = async (req, res) => {
  //   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }
  console.log("📤 sending funding request cancel request....");
  const {
    azureId,
    name,
    submittedBy,
    emailAddress,
    telephoneNumber,
    companyName,
    companyNumber,
    position,
    fundingProgram,
    projectName,
    currentInvestment,
    loanAmount,
    minContribution,
    TradeLicence,
    scoredReport,
    consentAcknowledgement,
  } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (
    !azureId ||
    !name ||
    !submittedBy ||
    !emailAddress ||
    !telephoneNumber ||
    !companyName ||
    !companyNumber ||
    !position ||
    !fundingProgram ||
    !projectName ||
    !currentInvestment ||
    !loanAmount ||
    !minContribution ||
    !TradeLicence ||
    !scoredReport ||
    !consentAcknowledgement
  ) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  const formid = await generateUUID();

  // Construct the data object to be sent to Power Automate
  const data = {
    azureId,
    formId: formid,
    name,
    submittedBy,
    emailAddress,
    telephoneNumber,
    companyName,
    companyNumber,
    position,
    fundingProgram,
    projectName,
    currentInvestment: Number(currentInvestment),
    loanAmount: Number(loanAmount),
    minContribution: Number(minContribution),
    TradeLicence,
    scoredReport,
    consentAcknowledgement,
  };

  console.log("Sending funding request data to Power Automate:", data);

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
  data.flow_secret = RequestFundingLoanFlowSecret;

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
        "x-api-key": RequestFundingLoanFlowSecret,
      },
    });

    // Handle successful response
    res.status(200).json({
      message: "Funding request Data successfully sent to Power Automate flow",
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
  RequestFunding,
};
