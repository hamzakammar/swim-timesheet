const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const { parseWithGroq } = require("./models/sms_parser");

const app = express();
// Handle both JSON and URL-encoded data (Twilio sends URL-encoded)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Swim Timesheet API is running");
});

app.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    
    const todayISO = new Date().toISOString().split('T')[0];
    const result = await parseWithGroq({ text, todayISO });
    
    res.json(result);
  } catch (error) {
    console.error("Error parsing SMS:", error);
    res.status(500).json({ error: "Failed to parse SMS", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const smsRoutes = require('./routes/sms');
app.use('/sms', smsRoutes);
