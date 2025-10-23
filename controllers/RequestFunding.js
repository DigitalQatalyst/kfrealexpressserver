const express = require("express");
const axios = require("axios");
const { getAccessToken, fetchCRMToken } = require("../services/getFlowTokens");
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
    // return the missing field
    if (!azureId) return res.status(400).json({ error: "azureId is required" });
    if (!name) return res.status(400).json({ error: "name is required" });
    if (!submittedBy)
      return res.status(400).json({ error: "submittedBy is required" });
    if (!emailAddress)
      return res.status(400).json({ error: "emailAddress is required" });
    if (!telephoneNumber)
      return res.status(400).json({ error: "telephoneNumber is required" });
    if (!companyName)
      return res.status(400).json({ error: "companyName is required" });
    if (!companyNumber)
      return res.status(400).json({ error: "companyNumber is required" });
    if (!position)
      return res.status(400).json({ error: "position is required" });
    if (!fundingProgram)
      return res.status(400).json({ error: "fundingProgram is required" });
    if (!projectName)
      return res.status(400).json({ error: "projectName is required" });
    if (!currentInvestment)
      return res.status(400).json({ error: "currentInvestment is required" });
    if (!loanAmount)
      return res.status(400).json({ error: "loanAmount is required" });
    if (!minContribution)
      return res.status(400).json({ error: "minContribution is required" });
    if (!TradeLicence)
      return res.status(400).json({ error: "TradeLicence is required" });
    if (!scoredReport)
      return res.status(400).json({ error: "scoredReport is required" });
    if (!consentAcknowledgement)
      return res
        .status(400)
        .json({ error: "consentAcknowledgement is required" });
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

// get funding requests
const getFundingRequests = async (req, res) => {
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
      `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_requestforfundings`,
      { headers }
    );

    // console.log("account profile", response.data);

    // Return the response data
    res.status(200).json(response.data);

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
  RequestFunding,
  getFundingRequests,
};
