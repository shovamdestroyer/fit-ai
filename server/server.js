// server/server.js
// FitAI Coach & SATHI AI — Express Backend Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Assets Serving
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// API Routes
const aiRoutes = require('./routes/ai');
const profileRoutes = require('./routes/profile');

app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'FitAI Coach',
    sathiCompanion: 'online',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  });
});

// SPA fallback for direct navigation
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 FitAI Coach & SATHI AI Server is running!`);
  console.log(`📱 Web App: http://localhost:${PORT}`);
  console.log(`✨ SATHI AI Chatbot: http://localhost:${PORT}/#sathi`);
  console.log(`🔐 Mandatory Auth & RLS Schema: /database/schema.sql`);
  console.log(`====================================================`);
});
