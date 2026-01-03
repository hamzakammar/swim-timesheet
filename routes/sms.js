const express = require('express');
    const router = express.Router();
    const MessagingResponse = require('twilio').twiml.MessagingResponse;

    router.post('/webhook', (req, res) => {
    const twiml = new MessagingResponse();
    const incomingMessage = req.body.Body;
    
    // Simple echo response for now
    twiml.message(`Received: ${incomingMessage}`);
    
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
    });

    module.exports = router;