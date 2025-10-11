const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");

// Power Automate flow endpoint
const FLOW_URL = process.env.collateraluserguide_url;
const CollateralFlowSecret = process.env.collateraluserguide_secret;

const CreateCollateralUserGuide = async (req, res) => {
  console.log("📤 sending collateral user guide request....");

  const {
    Name,
    Nameofpersonmakingthesubmission,
    EmailAddress,
    Contacttelephonenumber,
    Companyname,
    Companynumber,
    Position,
    AssetName,
    AssetNumber,
    AdditionalDetails,
  } = req.body; // Expect these fields to be passed in the body

  // Validate required fields
  if (
    !Name ||
    !Nameofpersonmakingthesubmission ||
    !EmailAddress ||
    !Contacttelephonenumber ||
    !Companyname ||
    !Companynumber ||
    !Position ||
    !AssetName ||
    !AssetNumber ||
    !AdditionalDetails
  ) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  // Construct payload for Power Automate
  const data = {
    Name,
    Nameofpersonmakingthesubmission,
    EmailAddress,
    Contacttelephonenumber,
    Companyname,
    Companynumber,
    Position,
    AssetName,
    AssetNumber,
    AdditionalDetails,
  };

  console.log("Sending collateral user guide data to Power Automate:", data);

  try {
    const accessToken = await getAccessToken();
    console.log(accessToken);

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
