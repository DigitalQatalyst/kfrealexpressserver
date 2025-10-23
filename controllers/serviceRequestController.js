const axios = require("axios");
const { fetchCRMToken } = require("../services/getFlowTokens");

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

const getAllServiceRequests = async (req, res) => {
  const token = await fetchCRMToken();
  const { userId } = req.params;

  if (!token) {
    return res.status(400).json({ error: "authToken is required" });
  }

  if (!userId) {
    return res.status(400).json({ error: "userId is required in params" });
  }

  try {
    // Create headers object
    const headers = {
      Authorization: `${token}`,
      Accept: "application/json",
      "Data-Version": "4.0",
      "Data-MaxVersion": "4.0",
    };

    // Define all the endpoints with their descriptive names
    const endpoints = [
      {
        name: "Request for Membership",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_requestformembershipforms?$filter=_owninguser_value eq ${userId}`,
      },
      {
        name: "Amend Existing Loan Details",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_amendexistingloandetailsforms?$filter=_owninguser_value eq ${userId}`,
      },
      {
        name: "Book Consultation for Entrepreneurs",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_consultationguides?$filter=_owninguser_value eq ${userId}`,
      },
      {
        name: "Request to Cancel Loan",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_cancelloanforms?$filter=_owninguser_value eq ${userId}`,
      },
      {
        name: "Issue Support Letter",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_issuesupportletterforms?$filter=_owninguser_value eq ${userId}`,
      },
      {
        name: "Reallocation of Loan Disbursement",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_reallocationofloandisbursementforms?$filter=_owninguser_value eq ${userId}`,
      },
      {
        name: "Disburse an Approved Loan",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_reallocationofloandisbursementforms?$filter=_owninguser_value eq ${userId}`,
      },
      {
        name: "Release Collateral for Funded Project Assets",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_collateraluserguidesforms?$filter=_owninguser_value eq ${userId}`,
      },
      {
        name: "Request for Funding",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_requestforfundings?$filter=_owninguser_value eq ${userId}`,
      },
      {
        name: "Training in Entrepreneurship",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_traininginentrepreneurships?$filter=_owninguser_value eq ${userId}`,
      },
      {
        name: "Facilitate Communication with Stakeholders",
        url: `https://kf-dev-a.crm15.dynamics.com/api/data/v9.2/kf_facilitatecommunicationwithstakeholdersforms?$filter=_owninguser_value eq ${userId}`,
      },
    ];

    // Make simultaneous requests to all endpoints
    const requests = endpoints.map((endpoint) =>
      axios
        .get(endpoint.url, { headers })
        .then((response) => ({
          name: endpoint.name,
          success: true,
          data: response.data,
          count: response.data.value ? response.data.value.length : 0,
        }))
        .catch((error) => ({
          name: endpoint.name,
          success: false,
          error: error.response?.data || error.message,
          count: 0,
        }))
    );

    // Wait for all requests to complete
    const results = await Promise.all(requests);

    // Combine all successful results
    const combinedData = {
      userId: userId,
      totalRequests: results.length,
      successfulRequests: results.filter((r) => r.success).length,
      failedRequests: results.filter((r) => !r.success).length,
      totalRecords: results.reduce((sum, r) => sum + r.count, 0),
      serviceRequests: results,
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching service requests:", error.message);
    return res.status(500).json({
      error: "Failed to fetch service requests",
      details: error.message,
    });
  }
};

module.exports = {
  getRequestMembership,
  getAllServiceRequests,
};
