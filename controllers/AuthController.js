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
  const { azureid } = req.body;

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
      // `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/accounts?$filter=kf_azureid eq \'${azureid}\'`,
      `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/accounts?$filter=kf_azureid eq \'${azureid}\'`,
      // `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/accounts?$filter=accountid eq \'${accountid}\'`,

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
  const { azureid } = req.body;

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
      // `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/contacts(${accountid})`,
      `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/contacts?$filter=kf_azureid eq \'${azureid}\'`,
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

// get user profile
/**
 * GET USER PROFILE (merged Account + Contact)
 * ------------------------------------------------
 * Body: { azureid: "<azure-guid>" }
 * ------------------------------------------------
 * 1. Fetch Account  → $filter=kf_azureid eq '<azureid>'
 * 2. Fetch Contact  → $filter=kf_azureid eq '<azureid>'
 * 3. Combine → account fields + contact fields (contact wins on overlap)
 * 4. Return a tidy JSON object
 */
const getUserProfile = async (req, res) => {
  const { azureid } = req.body;

  // ------------------------------------------------
  // 1. Input validation
  // ------------------------------------------------
  if (!azureid) {
    return res
      .status(400)
      .json({ error: "azureid is required in the request body" });
  }

  // ------------------------------------------------
  // 2. Get a fresh CRM token (pure function)
  // ------------------------------------------------
  let token;
  try {
    token = await fetchToken(); // <-- your pure token helper
  } catch (err) {
    console.error("Token fetch failed:", err);
    return res.status(500).json({ error: "Failed to obtain CRM token" });
  }

  // ------------------------------------------------
  // 3. Common headers for both calls
  // ------------------------------------------------
  const headers = {
    Authorization: token,
    Accept: "application/json",
    "OData-Version": "4.0",
    "OData-MaxVersion": "4.0",
  };

  // ------------------------------------------------
  // 4. Build the two OData URLs (both filter on azureid)
  // ------------------------------------------------
  const accountUrl = `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/accounts?$filter=kf_azureid eq '${azureid}'&$select=*&$expand=primarycontactid($select=contactid,firstname,lastname,emailaddress1,telephone1)`;
  const contactUrl = `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/contacts?$filter=kf_azureid eq '${azureid}'&$select=*`;

  try {
    console.log("Fetching account & contact for azureid:", azureid);

    // ------------------------------------------------
    // 5. Parallel requests (faster + less round-trips)
    // ------------------------------------------------
    const [accountRes, contactRes] = await Promise.all([
      axios.get(accountUrl, { headers }).catch(() => ({ data: { value: [] } })),
      axios.get(contactUrl, { headers }).catch(() => ({ data: { value: [] } })),
    ]);

    const account = accountRes.data.value[0] || null;
    const contact = contactRes.data.value[0] || null;

    // ------------------------------------------------
    // 6. Build merged profile
    // ------------------------------------------------
    const profile = {
      azureid,
      // ---- Account data (base layer) ----
      accountId: account?.accountid ?? null,
      accountName: account?.name ?? null,
      // add any other account fields you need here
      ...(account && { ...account }),

      // ---- Contact data (overlay – overwrites same keys) ----
      ...(contact && {
        contactId: contact.contactid,
        firstName: contact.firstname ?? null,
        lastName: contact.lastname ?? null,
        email: contact.emailaddress1 ?? null,
        phone: contact.telephone1 ?? null,
        // add any other contact fields you need
        ...contact,
      }),

      // ---- Metadata ----
      hasAccount: !!account,
      hasContact: !!contact,
      fetchedAt: new Date().toISOString(),
    };

    // Clean up noisy OData props
    delete profile["@odata.etag"];
    delete profile["@odata.type"];
    delete profile["@odata.context"]; // optional

    console.log("Merged profile ready");
    return res.status(200).json({
      success: true,
      profile,
      message: "User profile retrieved and merged successfully",
    });
  } catch (error) {
    // ------------------------------------------------
    // 7. Unified error handling
    // ------------------------------------------------
    console.error("User-profile error:", error.response?.data || error.message);
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        error: "Failed to fetch profile data",
        details: error.response?.data || error.message,
      });
    }
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

module.exports = {
  getToken,
  getAccountProfile,
  getContactInformation,
  crmSignUp,
  getUserProfile,
};
