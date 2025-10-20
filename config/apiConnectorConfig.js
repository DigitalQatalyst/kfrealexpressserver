/**
 * API Connector Configuration Loader
 * Loads and validates API Connector specific environment variables
 */

const dotenv = require('dotenv');
const path = require('path');

function loadApiConnectorConfig() {
    // Load API connector specific environment
    const result = dotenv.config({
        path: path.resolve(process.cwd(), '.env.api-connector')
    });

    if (result.error) {
        console.error('Error loading API connector configuration:', result.error);
        process.exit(1);
    }

    // Validate required configuration
    const requiredVars = [
        'API_CONNECTOR_USERNAME',
        'API_CONNECTOR_PASSWORD',
        'API_CONNECTOR_ENDPOINT'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('Missing required API connector configuration:', missingVars);
        process.exit(1);
    }

    console.log('✅ API Connector configuration loaded successfully');
}

module.exports = loadApiConnectorConfig;