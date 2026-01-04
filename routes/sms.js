const express = require('express');
const router = express.Router();
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const { parseWithGroq } = require('../models/sms_parser');

router.post('/webhook', async (req, res) => {
    console.log('=== Twilio Webhook Received ===');
    console.log('Body:', req.body);
    console.log('From:', req.body.From);
    console.log('Message Body:', req.body.Body);
    
    const twiml = new MessagingResponse();
    const incomingMessage = req.body.Body;
    const fromNumber = req.body.From;
    res.type('text/xml');

    try {
        if (!incomingMessage) {
            twiml.message('Please send a message with your timesheet information.');
            return res.send(twiml.toString());
        }
        
        const todayISO = new Date().toISOString().split('T')[0];
        console.log('Parsing message:', incomingMessage);
        
        const result = await parseWithGroq({ text: incomingMessage, todayISO });
        console.log('Parse result:', result);
        
        let responseMessage = '';
        if (result.confidence > 0.7) {
            const parts = [];
            if (result.hours) parts.push(`${result.hours}h`);
            if (result.dateISO) parts.push(`on ${result.dateISO}`);
            if (result.description) parts.push(`for: ${result.description}`);
            
            responseMessage = `✓ Recorded: ${parts.join(' ')}`;
            if (result.notes) {
                responseMessage += `\n\nNote: ${result.notes}`;
            }
        } else {
            responseMessage = `⚠️ I had trouble understanding your message. ${result.notes || 'Please try again with format like "8h today on API work"'}`;
        }
        
        twiml.message(responseMessage);
        
    } catch (error) {
        console.error('Error processing SMS:', error);
        twiml.message('Sorry, I encountered an error processing your message. Please try again.');
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
});

module.exports = router;