const express = require('express');
const router = express.Router();
const { resolveUserClaims } = require('../controllers/IdentityController');

/**
 * POST /api/v1/identity/resolve-claims
 * Azure External ID API Connector endpoint
 * Called during user sign-in to enrich tokens with custom claims
 */
router.post('/resolve-claims', resolveUserClaims);

module.exports = router;
