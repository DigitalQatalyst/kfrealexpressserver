const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");
const { generateUUID } = require("../services/generateUuid");

// Power Automate flow endpoint
const FLOW_URL = process.env.collateraluserguide_url;
const CollateralFlowSecret = process.env.collateraluserguide_secret;

const CreateCollateralUserGuide = async (req, res) => {
  console.log("📤 sending collateral user guide request....");

  const {
    azureId,
    name,
    submittedBy,
    emailAddress,
    telephoneNumber,
    companyName,
    companyNumber,
    position,
    assetName,
    assetNumber,
    additionalDetails,
  } = req.body;
  // Expect these fields to be passed in the body

  // Validate required fields
  if (
    !azureId ||
    !name ||
    !submittedBy ||
    !emailAddress ||
    !telephoneNumber ||
    !companyName ||
    !companyNumber ||
    !position ||
    !assetName ||
    !assetNumber ||
    !additionalDetails
  ) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  const formid = await generateUUID();

  // Construct payload for Power Automate
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
    assetName,
    assetNumber,
    additionalDetails,
  };

  console.log("Sending collateral user guide data to Power Automate:", data);

  try {
    const accessToken = await getAccessToken();
    // console.log(accessToken);

    const response = await axios.post(FLOW_URL, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "x-api-key": CollateralFlowSecret,
      },
    });

    res.status(200).json({
      message:
        "Collateral User Guide data successfully sent to Power Automate flow",
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
  CreateCollateralUserGuide,
};
