const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");
const { generateUUID } = require("../services/generateUuid");

// Power Automate flow endpoint
const FLOW_URL = process.env.cancel_loan_url;
const CancelLoanFlowSecret = process.env.cancel_loan_secret;

const CancelLoan = async (req, res) => {
  console.log("📤 sending loan cancel request....");

  const formid = await generateUUID();

  // Expect these fields to be passed in the body
  const {
    azureId,
    sequenceNumber,
    name,
    submittedBy,
    emailAddress,
    telephoneNumber,
    companyName,
    companyNumber,
    position,
    fundingNumber,
    cancellationDetails,
    consentAcknowledgement,
  } = req.body;

  // Validate required fields
  if (
    !azureId ||
    !sequenceNumber ||
    !name ||
    !submittedBy ||
    !emailAddress ||
    !telephoneNumber ||
    !companyName ||
    !companyNumber ||
    !position ||
    !fundingNumber ||
    !cancellationDetails ||
    !consentAcknowledgement
  ) {
    console.log("Missing required fields");
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  // Construct payload for Power Automate
  const data = {
    azureId,
    formId: formid,
    sequenceNumber: Number(sequenceNumber),
    name,
    submittedBy,
    emailAddress,
    telephoneNumber: Number(telephoneNumber),
    companyName,
    companyNumber,
    position,
    fundingNumber,
    cancellationDetails,
    consentAcknowledgement,
  };

  console.log("Sending loan cancellation data to Power Automate:", data);

  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(FLOW_URL, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "x-api-key": CancelLoanFlowSecret,
      },
    });

    res.status(200).json({
      message:
        "Loan cancellation data successfully sent to Power Automate flow",
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
// export
module.exports = {
  CancelLoan,
};
