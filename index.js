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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// auth routes
const authroute = require("./routes/authRoute");
const consultationroute = require("./routes/consultationRoutes");
const partnerroute = require("./routes/partnerRoutes");
const enquiryroute = require("./routes/EnquiryRoutes");
const loanroute = require("./routes/LoanRoutes");

// api endpoints
app.use("/api/v1/auth", authroute);
app.use("/api/v1/consultation", consultationroute);
app.use("/api/v1/partner", partnerroute);
app.use("/api/v1/enquiry", enquiryroute);
app.use("/api/v1/loan", loanroute);
