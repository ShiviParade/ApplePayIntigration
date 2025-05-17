const express = require('express');
const router = express.Router();
const applePayService = require('../src/services/applePayService');
const { check, validationResult } = require('express-validator');

router.post('/charge', [
    check('amount').isNumeric().withMessage('Amount must be a number'),
    check('currency').isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { amount, currency } = req.body;
        
        // Process the payment
        const result = await applePayService.processPayment(amount, currency);
        
        res.json(result);
    } catch (error) {
        console.error('Charge API error:', error);
        res.status(500).json({
            error: 'Payment processing failed',
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;