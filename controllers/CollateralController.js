const express = require("express");
const axios = require("axios");
const { getAccessToken, fetchCRMToken } = require("../services/getFlowTokens");
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

const getCollateralForms = async (req, res) => {
  const token = await fetchCRMToken();

  // log
  // console.log("req body",token,accountid)
  // return

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
      `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_collateraluserguidesforms`,
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
  CreateCollateralUserGuide,
  getCollateralForms,
};
