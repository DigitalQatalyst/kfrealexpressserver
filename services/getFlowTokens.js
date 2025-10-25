// const axios = require("axios");

// const AZURE_AD = {
//   tenantId: process.env.tenant_id, // e.g., '12345678-1234-1234-1234-1234567890ab'
//   clientId: process.env.client_id,
//   // e.g., '87654321-4321-4321-4321-0987654321ba'
//   clientSecret: process.env.client_secret, // e.g., 'your-secret-value'
//   scope: process.env.flow_scope,
// };

// const getAccessToken = async () => {
//   const tokenUrl = `https://login.microsoftonline.com/${AZURE_AD.tenantId}/oauth2/v2.0/token`;
//   const params = new URLSearchParams({
//     grant_type: "client_credentials",
//     client_id: AZURE_AD.clientId,
//     client_secret: AZURE_AD.clientSecret,
//     scope: AZURE_AD.scope,
//   });
//   console.log("⏳retrieving token...");

//   try {
//     const response = await axios.post(tokenUrl, params, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });
//     console.log("🔑token supplied 🚀✔️");
//     return response.data.access_token;
//   } catch (error) {
//     throw new Error(
//       "Failed to obtain access token: " +
//         (error.response?.data?.error_description || error.message)
//     );
//   }
// };

// const fetchCRMToken = async () => {
//   try {
//     console.log("⏳retrieving crm token...");
//     const url =
//       "https://login.microsoftonline.com/199ebd0d-2986-4f3d-8659-4388c5b2a724/oauth2/v2.0/token";

//     const data = {
//       client_id: process.env.client_id,
//       client_secret: process.env.client_secret,
//       scope: process.env.scope,
//       grant_type: process.env.grant_type,
//     };

//     const config = {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     };

//     const response = await axios.post(url, new URLSearchParams(data), config);
//     console.log("🔑CRM token supplied 🚀✔️");
//     return response.data.access_token;
//   } catch (error) {
//     console.error(
//       "Failed to fetch token:",
//       error.response?.data || error.message
//     );
//     throw new Error("Failed to fetch token");
//   }
// };

// module.exports = { getAccessToken, fetchCRMToken };

const axios = require("axios");

const AZURE_AD = {
  tenantId: process.env.tenant_id, // e.g., '12345678-1234-1234-1234-1234567890ab'
  clientId: process.env.client_id, // e.g., '87654321-4321-4321-4321-0987654321ba'
  clientSecret: process.env.client_secret, // e.g., 'your-secret-value'
  scope: process.env.flow_scope,
};

// In-memory cache for token
let tokenCache = {
  accessToken: null,
  expiry: null,
};

const getAccessToken = async () => {
  // Check if token exists and is not expired
  if (
    tokenCache.accessToken &&
    tokenCache.expiry &&
    new Date() < new Date(tokenCache.expiry)
  ) {
    console.log("🔄 Using cached token");
    return tokenCache.accessToken;
  }

  const tokenUrl = `https://login.microsoftonline.com/${AZURE_AD.tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: AZURE_AD.clientId,
    client_secret: AZURE_AD.clientSecret,
    scope: AZURE_AD.scope,
  });
  console.log("⏳ Retrieving new token...");

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Cache the token and set expiry (subtract 5 minutes to avoid edge cases)
    tokenCache.accessToken = response.data.access_token;
    tokenCache.expiry = new Date(
      Date.now() + (response.data.expires_in - 300) * 1000
    );

    console.log("🔑 New token supplied 🚀✔️");
    return tokenCache.accessToken;
  } catch (error) {
    throw new Error(
      "Failed to obtain access token: " +
        (error.response?.data?.error_description || error.message)
    );
  }
};

const fetchCRMToken = async () => {
  // Reuse the same cache logic for CRM token
  if (
    tokenCache.accessToken &&
    tokenCache.expiry &&
    new Date() < new Date(tokenCache.expiry)
  ) {
    console.log("🔄 Using cached CRM token");
    return tokenCache.accessToken;
  }

  try {
    console.log("⏳ Retrieving new CRM token...");
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

    // Cache the token and set expiry
    tokenCache.accessToken = response.data.access_token;
    tokenCache.expiry = new Date(
      Date.now() + (response.data.expires_in - 300) * 1000
    );

    console.log("🔑 CRM token supplied 🚀✔️");
    return tokenCache.accessToken;
  } catch (error) {
    console.error(
      "Failed to fetch token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch token");
  }
};

module.exports = { getAccessToken, fetchCRMToken };
