const express = require('express');
const router = express.Router();
const apiConnectorController = require('../controllers/ApiConnectorController');

// API Connector Endpoints for Azure External ID
// These endpoints are called by Azure during sign-up and sign-in flows

// Endpoint 1: Validate user input before account creation
router.post('/signup/validate', apiConnectorController.validateSignUp);

// Endpoint 2: Enrich user profile after account creation (create Contact in Dataverse)
router.post('/signup/enrich', apiConnectorController.enrichSignUp);

// Endpoint 3: Resolve roles before token issuance (fetch Contact from Dataverse)
router.post('/signin/roles', apiConnectorController.resolveRoles);

module.exports = router;
