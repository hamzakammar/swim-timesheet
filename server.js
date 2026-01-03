const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Swim Timesheet API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const smsRoutes = require('./routes/sms');
app.use('/sms', smsRoutes);
