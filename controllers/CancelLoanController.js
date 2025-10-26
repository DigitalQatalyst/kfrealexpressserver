const express = require("express");
const axios = require("axios");
const { getAccessToken, fetchCRMToken } = require("../services/getFlowTokens");
const { generateUUID } = require("../services/generateUuid");

// Power Automate flow endpoint
const FLOW_URL = process.env.cancel_loan_url;
const getloanflowurl = process.env.getloanflow_url;
const CancelLoanFlowSecret = process.env.cancel_loan_secret;
const GetLoanFlowSecret = process.env.getloanflow_secret;
const url =
  "https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_cancelloanforms";

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
    serviceName,
    category,
    status,
    serviceProvider,
  } = req.body;

  // Create an array of required fields and their corresponding values
  const requiredFields = {
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
    serviceName,
    category,
    status,
    serviceProvider,
  };

  // Find missing fields
  const missingFields = Object.keys(requiredFields).filter(
    (field) => !requiredFields[field]
  );

  // If any fields are missing, log them and return an error response
  if (missingFields.length > 0) {
    console.log(`Missing required fields: ${missingFields.join(", ")}`);
    return res.status(400).json({
      error: "Missing required fields",
      missingFields: missingFields, // Include the missing fields in the response
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
    serviceName,
    category,
    status,
    serviceProvider,
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

const getCancelLoans = async (req, res) => {
  const token = await fetchCRMToken();
  // const { accountid } = req.body;
  const{id} = req.params
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
      // `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_cancelloanforms`,
      `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_cancelloanforms?$filter=kf_azureid eq ${id}`,
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
        "Error fetching data for specific account:",
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
  CancelLoan,
  getCancelLoans,
};
