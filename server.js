require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3005;

// Connect MongoDB
connectDB();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Outset Studio Backend API is running' });
});

app.listen(PORT, () => {
  console.log(`Outset Studio Backend running on http://localhost:${PORT}`);
});
