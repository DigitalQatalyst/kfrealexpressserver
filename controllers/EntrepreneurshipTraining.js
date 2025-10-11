const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../services/getFlowTokens");

// Power Automate flow endpoint
const FLOW_URL = process.env.entrepreneurshiptraining_url;

// Flow secret (if still required by the flow)
const EntrepreneurshipTrainingSecret =
  process.env.entrepreneurshiptraining_secret;
// console.log("es", EntrepreneurshipTrainingSecret);

// const CreateEntrepreneurshipTraining = async (req, res) => {
//   //   const data = req.body; // Expect JSON like: { "CompanyName": "...", ... }
//   console.log("📤 sending training request....");
//   const { description, time, duration, location, trainer, fees } = req.body; // Expect these fields to be passed in the body

//   // Validate input
//   if (!description || !time || !duration || !location || !trainer || !fees) {
//     return res.status(400).json({
//       error: "Missing required fields",
//     });
//   }
//   //   cnovert fee ro number

//   // Construct the data object to be sent to Power Automate
//   const data = {
//     description,
//     time,
//     duration,
//     location,
//     trainer,
//     fees,
//   };

//   console.log(
//     "Sending entrepreneurship training data to Power Automate:",
//     data
//   );

//   //   console.log("data",data)
//   //   console.log("my token",data.token)
//   //   return

//   // Validate input
//   if (!data) {
//     return res
//       .status(400)
//       .json({ error: "Invalid or empty JSON data provided" });
//   }

//   // Add flow_secret to the body (if required by the flow)
//   data.flow_secret = EntrepreneurshipTrainingSecret;

//   //   console.log('Sending data to Power Automate:', data);

//   try {
//     // get accesstoken from the
//     // Get OAuth access token

//     const accessToken = await getAccessToken();

//     // Send request to Power Automate
//     const response = await axios.post(FLOW_URL, data, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//         // Include x-api-key if the flow still checks it
//         "x-api-key": EntrepreneurshipTrainingSecret,
//       },
//     });

//     // Handle successful response
//     res.status(200).json({
//       message:
//         "Entrepreneurship Training Data successfully sent to Power Automate flow",
//       result: response.data,
//     });
//   } catch (error) {
//     console.error(
//       "Error:",
//       error.response ? error.response.data : error.message
//     );
//     res.status(error.response?.status || 500).json({
//       error: "Failed to send data to Power Automate flow",
//       details: error.response ? error.response.data : error.message,
//     });
//   }
// };

const CreateEntrepreneurshipTraining = async (req, res) => {
  console.log("📤 sending training request....");
  const { description, time, duration, location, trainer, fees } = req.body; // Expect these fields to be passed in the body

  // Validate input
  if (!description || !time || !duration || !location || !trainer || !fees) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  // Convert fees to a number
  const parsedFees = parseFloat(fees); // Convert fees to a floating-point number

  // Check if the parsed fees is a valid number
  if (isNaN(parsedFees)) {
    return res.status(400).json({
      error: "Invalid fee value",
    });
  }

  // Construct the data object to be sent to Power Automate
  const data = {
    description,
    time,
    duration,
    location,
    trainer,
    fees: parsedFees, // Set fees as the parsed number
  };

  console.log(
    "Sending entrepreneurship training data to Power Automate:",
    data
  );

  // Validate input
  if (!data) {
    return res
      .status(400)
      .json({ error: "Invalid or empty JSON data provided" });
  }

  // Add flow_secret to the body (if required by the flow)
  data.flow_secret = EntrepreneurshipTrainingSecret;

  try {
    // Get OAuth access token
    const accessToken = await getAccessToken();

    // Send request to Power Automate
    const response = await axios.post(FLOW_URL, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // Include x-api-key if the flow still checks it
        "x-api-key": EntrepreneurshipTrainingSecret,
      },
    });

    // Handle successful response
    res.status(200).json({
      message:
        "Entrepreneurship Training Data successfully sent to Power Automate flow",
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
  CreateEntrepreneurshipTraining,
};
