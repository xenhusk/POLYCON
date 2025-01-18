require('dotenv').config();
console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log("GCP_BUCKET_NAME:", process.env.GCP_BUCKET_NAME);

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const consultationRoutes = require('./routes/consultation');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/consultation', consultationRoutes);

app.get('/', (req, res) => res.send('POLYCON Backend is Running'));

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
