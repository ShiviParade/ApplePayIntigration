const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config/env');
const authService = require('./authService');
const crypto = require('crypto');

class ApplePayService {
    constructor() {
        // Fix double slash in URL
        this.baseUrl = config.API_ENDPOINTS[config.API_ENVIRONMENT].replace(/\/+$/, '');
        
        // Create axios instance with default config
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Host': 'connect-cert.fiservapis.com'
            }
        });
    }

    generateApplicationDataHash(applicationData) {
        // Create SHA-256 hash of the raw application data
        const hash = crypto.createHash('sha256');
        hash.update(applicationData);
        
        // Base64 encode the resulting hash
        return hash.digest('base64');
    }

    async logTransaction(requestData, responseData = null, error = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            requestId: requestData.headers?.['Client-Request-Id'] || null,
            request: requestData,
            response: responseData,
            error: error ? {
                message: error.message,
                details: error.response?.data || null
            } : null
        };

        const logDir = path.join(__dirname, '../../logs');
        const logFile = path.join(logDir, 'transactions.log');

        try {
            await fs.mkdir(logDir, { recursive: true });
            await fs.appendFile(logFile, JSON.stringify(logEntry, null, 2) + '\n---\n', 'utf8');
        } catch (error) {
            console.error('Error writing to log file:', error);
        }
    }

    async processPayment(amount, currency = 'USD') {
        const requestData = { url: `${this.baseUrl}/payments/v1/charges` };

        try {
            const applePayData = JSON.parse(
                await fs.readFile('ApplepaySampleData.json', 'utf8')
            );

            const applicationData = "TEST";
            const applicationDataHash = this.generateApplicationDataHash(applicationData);

            const payload = {               
                amount: {
                    total: amount,
                    currency: currency                   
                },                           
                source: {
                    sourceType: "ApplePay",                    
                    data: applePayData.data,
                    header: {
                        applicationDataHash: "94ee059335e587e501cc4bf90613e0814f00a7b08bc7c648fd865a2af6a22cc2",
                        ephemeralPublicKey: applePayData.header.ephemeralPublicKey,
                        publicKeyHash: applePayData.header.publicKeyHash,
                        transactionId: applePayData.header.transactionId
                    },
                    signature: applePayData.signature,
                    version: applePayData.version,
                    applicationData: Buffer.from(applicationData).toString('base64'), // Base64 encode the raw application data
                    applePayMerchantId: config.APPLE_PAY_MERCHANT_ID,
                },
                
                transactionDetails: {
                    captureFlag: true,
                    createToken: false
                },
                merchantDetails: {
                    merchantId: config.FISERV_MERCHANT_ID,
                    terminalId: config.FISERV_TERMINAL_ID
                }
            };

            const headers = {
                ...authService.generateAuthHeader(payload),
                'Host': 'connect-cert.fiservapis.com'
            };
            requestData.headers = headers;
            requestData.payload = payload;

            const response = await this.axiosInstance.post(
                '/payments/v1/charges',
                payload,
                { headers }
            );

            await this.logTransaction(requestData, response.data);
            return response.data;

        } catch (error) {
            await this.logTransaction(requestData, null, error);
            console.error('Payment processing error:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new ApplePayService();