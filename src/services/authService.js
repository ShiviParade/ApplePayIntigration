const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config/env');

class AuthService {
    constructor() {
        this.apiKey = config.FISERV_API_KEY;
        this.apiSecret = config.FISERV_API_SECRET;
    }

    generateAuthHeader(requestBody = {}) {
        const timestamp = Date.now().toString();
        const clientRequestId = this.generateRequestId();
        const stringifiedBody = JSON.stringify(requestBody);
        
        // Generate message string as per Fiserv docs
        const message = `${this.apiKey}${clientRequestId}${timestamp}${stringifiedBody}`;
        
        // Create HMAC-SHA256 hash
        const hmac = crypto.createHmac('sha256', this.apiSecret);
        hmac.update(message);
        const messageSignature = hmac.digest('base64');

        return {
            'Content-Type': 'application/json',
            'Client-Request-Id': clientRequestId,
            'Api-Key': this.apiKey,
            'Timestamp': timestamp,
            'Auth-Token-Type': 'HMAC',
            'Authorization': messageSignature
        };
    }

    generateRequestId() {
        return uuidv4();
    }
}

module.exports = new AuthService();