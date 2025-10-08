import axios from "axios";

const AZURE_AD = {
  tenantId: process.env.tenant_id, // e.g., '12345678-1234-1234-1234-1234567890ab'
  clientId: process.env.client_id,
  // e.g., '87654321-4321-4321-4321-0987654321ba'
  clientSecret: process.env.client_secret, // e.g., 'your-secret-value'
  scope: process.env.flow_scope,
};

export async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${AZURE_AD.tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: AZURE_AD.clientId,
    client_secret: AZURE_AD.clientSecret,
    scope: AZURE_AD.scope,
  });
  console.log("🔑 retrieving token...");

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    console.log("token supplied 🔑");
    return response.data.access_token;
  } catch (error) {
    throw new Error(
      "Failed to obtain access token: " +
        (error.response?.data?.error_description || error.message)
    );
  }
}
