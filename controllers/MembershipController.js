const express = require("express");
const axios = require("axios");
const { getAccessToken, fetchCRMToken } = require("../services/getFlowTokens");
const { generateUUID } = require("../services/generateUuid");

// Power Automate flow endpoint
const FLOW_URL = process.env.membershiprequest_url;

// Flow secret (if still required by the flow)
const MembershipRequestFlowSecret = process.env.membershiprequest_secret;

const RequestMembership = async (req, res) => {
  //   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }
  console.log("📤 sending training request....");
  const { azureId, name, submittedBy, emailAddress1 } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (!azureId || !name || !submittedBy || !emailAddress1) {
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
    emailAddress1,
  };

  console.log("Sending membership request data to Power Automate:", data);

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
  data.flow_secret = MembershipRequestFlowSecret;

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
        "x-api-key": MembershipRequestFlowSecret,
      },
    });

    // Handle successful response
    res.status(200).json({
      message:
        "membership request Data successfully sent to Power Automate flow",
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

const getRequestMembership = async (req, res) => {
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

    const id = "3cb92daf-2c5e-f011-bec2-6045bd145efe";

    // Make the GET request using axios
    const response = await axios.get(
      // `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/accounts?$filter=accountid eq \'${accountid}\'`,
      // `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_requestformembershipforms`,
      `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_requestformembershipforms?$filter=_owninguser_value eq ${id}`,
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
  RequestMembership,
  getRequestMembership,
};
