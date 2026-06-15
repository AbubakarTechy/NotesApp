require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads folder statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Root route check
app.get('/', (req, res) => {
  res.json({ message: 'UCPian API is running smoothly.' });
});

// Error handling middleware (e.g. for Multer PDF validations)
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message || 'An error occurred during request processing.' });
  }
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ucpian';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected successfully to:', MONGODB_URI.split('@').slice(-1)[0]); // print clean URI without credentials
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Local PDF uploads served at http://localhost:${PORT}/uploads/`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:');
    console.error(err.message);
    console.log('\n--- Troubleshooting ---');
    console.log('1. Make sure MongoDB is running locally on your computer (mongod).');
    console.log('2. Or provide a valid MONGODB_URI in a server/.env file.');
    console.log('-----------------------\n');
    
    // Fallback starting of server even if MongoDB connection fails so that front-end developers can see structure
    app.listen(PORT, () => {
      console.log(`Server started in offline-DB mode on port ${PORT} (MongoDB connection failed).`);
    });
  });
