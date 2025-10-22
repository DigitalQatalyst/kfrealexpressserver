const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");

// ✅ FIXED: Pure function that ONLY returns token (no HTTP responses)
const fetchToken = async () => {
  try {
    console.log("⏳retrieving crm token...");
    const url =
      "https://login.microsoftonline.com/199ebd0d-2986-4f3d-8659-4388c5b2a724/oauth2/v2.0/token";

    const data = {
      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
      scope: process.env.scope,
      grant_type: process.env.grant_type,
    };

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const response = await axios.post(url, new URLSearchParams(data), config);
    console.log("🔑CRM token supplied 🚀✔️");
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Failed to fetch token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch token");
  }
};

const getToken = async (req, res) => {
  try {
    console.log("⏳retrieving crm token...");
    const url =
      "https://login.microsoftonline.com/199ebd0d-2986-4f3d-8659-4388c5b2a724/oauth2/v2.0/token";

    const data = {
      // pass in env variables

      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
      scope: process.env.scope,
      grant_type: process.env.grant_type,
    };

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    // Make the POST request (note: OAuth token requests typically use POST, not GET)
    const response = await axios.post(url, new URLSearchParams(data), config);

    // Send the response back to the client
    // res.json(response.data);
    // set token as cookie
    console.log("🔑CRM token supplied 🚀✔️");

    res
      .cookie("token", response.data.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: response.data.expires_in * 1000,
      })
      .status(200)
      .json({
        message: "Token fetched successfully",
        tokenresponse: response.data,
      });
    return response.data.access_token;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch token" });
  }
};

// get account
const getAccountProfile = async (req, res) => {
  const token = await fetchToken();
  console.log("crm token", token);
  const { accountid } = req.body;

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
      `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/accounts?$filter=accountid eq \'${accountid}\'`,

      { headers }
    );

    console.log("account profile", response.data);

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


const getContactInformation = async (req, res) => {
  const token = await fetchToken();
  const { accountid } = req.body;

  try {
    // Define headers
    const headers = {
      Authorization: `${token}`,
      Accept: "application/json",
      "OData-Version": "4.0",
      "OData-MaxVersion": "4.0",
      Cookie:
        "ARRAffinity=de748f861f5e21be476552c1143548f3836026b3b72f0a814fa5b7cfbebeab19dc748ed02332839cb0efbb9e2898da096c2226348c1e154ec1706e5f470d25ad08DDFFFE324130F20000001712084436; ReqClientId=497f5db0-8672-4508-a3d2-1e6b840925bf; orgId=f1255e28-8de7-ef11-933e-6045bd6a2361",
    };
    // 30d25250-1632-f011-8c4e-6045bd145efe
    // Make the GET request using axios
    const response = await axios.get(
      `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/contacts(${accountid})`,
      { headers }
    );

    // console.log('contact response', response.data);

    // Return the response data
    res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error fetching contact:",
        error.response?.data || error.message
      );
      return res.status(error.response?.status || 500).json({
        error: error.response?.data || error.message,
      });
    } else {
      console.error("Error fetching contact:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }
};

const FLOW_URL = process.env.signup_url;

// Flow secret (if still required by the flow)
const SignUpFlowSecret = process.env.signup_secret;

const crmSignUp = async (req, res) => {
  //   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }
  console.log("📤 sending signup request....");
  const { firstName, lastName, email, phone, enterpriseName, azureId } =
    req.body; // Expect these fields to be passed in the body

  // Validate input
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !enterpriseName ||
    !azureId
  ) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  // Construct the data object to be sent to Power Automate
  const data = {
    firstName,
    lastName,
    email,
    phone,
    enterpriseName,
    azureId,
  };

  console.log("Sending training data to Power Automate:", data);

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
  data.flow_secret = SignUpFlowSecret;

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
        "x-api-key": SignUpFlowSecret,
      },
    });

    // Handle successful response
    res.status(200).json({
      message: "Signup Data successfully sent to Power Automate flow",
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
  getToken,
  getAccountProfile,
  getContactInformation,
  crmSignUp,
};
