module.exports = {
    FISERV_API_KEY: process.env.FISERV_API_KEY || '[ERROR] Fiserv API Key is required. Please set FISERV_API_KEY in your environment',
    FISERV_API_SECRET: process.env.FISERV_API_SECRET || '[ERROR] Fiserv API Secret is required. Please set FISERV_API_SECRET in your environment',
    FISERV_MERCHANT_ID: process.env.FISERV_MERCHANT_ID || '[ERROR] Fiserv Merchant ID is required. Please set FISERV_MERCHANT_ID in your environment',
    FISERV_TERMINAL_ID: process.env.FISERV_TERMINAL_ID || '[ERROR] Fiserv Terminal ID is required. Please set FISERV_TERMINAL_ID in your environment',
    APPLE_PAY_MERCHANT_ID: process.env.APPLE_PAY_MERCHANT_ID || '[ERROR] Apple Pay Merchant ID is required. Please set APPLE_PAY_MERCHANT_ID in your environment',
    API_ENVIRONMENT: process.env.API_ENVIRONMENT || 'sandbox',
    API_ENDPOINTS: {
        sandbox: 'https://connect-cert.fiservapis.com/ch/',
        production: 'https://api.fiservapps.com'
    },
    API_HOST: process.env.API_HOST || 'connect-cert.fiservapis.com',
};