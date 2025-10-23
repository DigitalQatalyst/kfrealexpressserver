const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// initialize app
const app = express();

// ENV VARIABLES CALLER
require("dotenv").config({
  path: "./.env",
});

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server transmitting📡 on port ${PORT}`));

// auth routes
const authroute = require("./routes/authRoute");
const consultationroute = require("./routes/consultationRoutes");
const partnerroute = require("./routes/partnerRoutes");
const enquiryroute = require("./routes/EnquiryRoutes");
const loanroute = require("./routes/LoanRoutes");
const collateralroute = require("./routes/collateralRoutes");
const trainingroute = require("./routes/trainingRoutes");
const contactroute = require("./routes/contactRoutes");
const supportroute = require("./routes/supportRoutes");
const fundingroute = require("./routes/fundingRoutes");
const membershiproute = require("./routes/membershipRoutes");
const entrepreneurshiproute = require("./routes/entrepreneurshipRoutes");
const servicerequestroute = require("./routes/serviceRequestRoute");

// api endpoints
app.use("/api/v1/auth", authroute);
app.use("/api/v1/consultation", consultationroute);
app.use("/api/v1/partner", partnerroute);
app.use("/api/v1/enquiry", enquiryroute);
app.use("/api/v1/loan", loanroute);
app.use("/api/v1/collateral", collateralroute);
app.use("/api/v1/training", trainingroute);
app.use("/api/v1/contact", contactroute);
app.use("/api/v1/support", supportroute);
app.use("/api/v1/funding", fundingroute);
app.use("/api/v1/membership", membershiproute);
app.use("/api/v1/entrepreneurship", entrepreneurshiproute);
app.use("/api/v1/service-request", servicerequestroute);
