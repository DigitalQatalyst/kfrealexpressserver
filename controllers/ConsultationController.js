const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");

// Power Automate flow endpoint
const FLOW_URL = process.env.consultation_flow_url;

// Flow secret (if still required by the flow)
// const FLOW_SECRET = process.env.flow_secret;
const ConsultationFlowSecret = process.env.consultation_flow_secret;

// Function to get Azure AD access token

const BookConsultation = async (req, res) => {
  //   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }

  const {
    Name,
    Nameofpersonmakingthesubmission,
    EmailAddress1,
    MobileNumber,
    Position,
    Companyname,
    Compannynumber,
    ConsultationType,
    ConsultationName,
    Isthisanexistingbusiness,
    Doyouownthebusiness,
    Doyouworkinthisbusiness,
    Pleaseselect3advicesyouwouldliketoreceive,
    OtherAdvices,
  } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (
    !Name ||
    !Nameofpersonmakingthesubmission ||
    !EmailAddress1 ||
    !MobileNumber ||
    !Position ||
    !Companyname ||
    !Compannynumber ||
    !ConsultationType ||
    !ConsultationName ||
    !Isthisanexistingbusiness ||
    !Doyouownthebusiness ||
    !Doyouworkinthisbusiness ||
    !Pleaseselect3advicesyouwouldliketoreceive ||
    !OtherAdvices
  ) {
    return res.status(400).json({
      // error: "Missing required fields",
      // log the missing exact missing fields
      error: "Missing required fields",
      missingFields: [
        !Name ? "Name" : "",
        !Nameofpersonmakingthesubmission
          ? "Nameofpersonmakingthesubmission"
          : "",
        !EmailAddress1 ? "EmailAddress1" : "",
        !MobileNumber ? "MobileNumber" : "",
        !Position ? "Position" : "",
        !Companyname ? "Companyname" : "",
        !Compannynumber ? "Compannynumber" : "",
        !ConsultationType ? "ConsultationType" : "",
        !ConsultationName ? "ConsultationName" : "",
        !Isthisanexistingbusiness ? "Isthisanexistingbusiness" : "",
        !Doyouownthebusiness ? "Doyouownthebusiness" : "",
        !Doyouworkinthisbusiness ? "Doyouworkinthisbusiness" : "",
        !Pleaseselect3advicesyouwouldliketoreceive
          ? "Pleaseselect3advicesyouwouldliketoreceive"
          : "",
        !OtherAdvices ? "OtherAdvices" : "",
      ],
    });
  }

  // Construct the data object to be sent to Power Automate
  const data = {
    Name,
    Nameofpersonmakingthesubmission,
    EmailAddress1,
    MobileNumber,
    Position,
    Companyname,
    Compannynumber,
    ConsultationType,
    ConsultationName,
    Isthisanexistingbusiness,
    Doyouownthebusiness,
    Doyouworkinthisbusiness,
    Pleaseselect3advicesyouwouldliketoreceive,
    OtherAdvices,
  };

  console.log("Sending consultation data to Power Automate:", data);

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
  data.flow_secret = ConsultationFlowSecret;

  //   console.log('Sending data to Power Automate:', data);

  try {
    // get accesstoken from the
    // Get OAuth access token

    const accessToken = await getAccessToken();
    console.log("📤 sending consultation request....");

    // Send request to Power Automate
    const response = await axios.post(FLOW_URL, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // Include x-api-key if the flow still checks it
        "x-api-key": ConsultationFlowSecret.toLowerCase(),
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

const getBookConsultation = async (req, res) => {
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
      `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_consultationguides`,
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
  BookConsultation,
  getBookConsultation,
};
