import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import axios from "axios";
import rateLimit from 'express-rate-limit';
import notificationRoutes from './routes/notification.js';
import { WebSocketServer } from 'ws';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });
const app = express();

const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

const FASTAPI_URL = "http://localhost:8000";


// Routes
import authRoutes from "./routes/auth.js";
import { verifyToken } from "./middleware/verify.js";
import interviewRoutes from "./routes/interview.js";
import userRoutes from "./routes/user.js";
import gdRoutes from "./routes/gdRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import path from "path";

// app.use(cors());
//cors for both fasAPI_backend and frontend

app.use(cors({
  origin: "https://smart-hire-ruby-eta.vercel.app/",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// FastAPI middleware
app.use('/api/interview', async (req, res, next) => {
  try {
    const url = `${FASTAPI_URL}${req.path}`;
    
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        ...req.headers,
        host: new URL(FASTAPI_URL).host
      }
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('FastAPI proxy error:', error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: error.message });
  }
});

// WebSocket server for real-time notifications
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'auth' && data.token) {
        // Verify JWT token and store client
        jwt.verify(data.token, process.env.JWT_SECRET, (err, decoded) => {
          if (!err) {
            clients.set(decoded.id, ws);
            ws.userId = decoded.id;
            console.log(`User ${decoded.id} connected to WebSocket`);
          }
        });
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log(`User ${ws.user.id} disconnected from WebSocket`);
    }
  });
});

// Function to send notification to specific user
export const sendNotificationToUser = (userId, notification) => {
  const client = clients.get(userId);
  if (client && client.readyState === 1) { // 1 = WebSocket.OPEN
    client.send(JSON.stringify({
      type: 'notification',
      data: notification
    }));
  }
};

app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    dbConnected,
    services: ['resume', 'gd', 'jobs', 'applications', 'admin', 'recommendations'],
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  if (req.path === '/api/health') return next();
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    success: false,
    message: 'Database is not connected. Check MongoDB (Atlas IP whitelist or use local MongoDB).',
  });
});

// Routes
app.use("/interviews", interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/gd', gdRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/profile', profileRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    path: req.path
  });
});

const maskMongoUri = (uri) => uri.replace(/\/\/([^@/]+)@/, '//***@');

const connectDatabase = async () => {
  const candidates = [
    process.env.MONGO_URL,
    process.env.MONGO_URI,
    process.env.MONGO_LOCAL_URL,
    'mongodb://127.0.0.1:27017/smarthire',
    'mongodb://localhost:27017/smarthire',
  ].filter(Boolean);

  const uniqueUris = [...new Set(candidates)];
  let lastError;

  for (const uri of uniqueUris) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`Database connected (${maskMongoUri(uri)})`);
      return;
    } catch (error) {
      lastError = error;
      console.warn(`MongoDB connection failed (${maskMongoUri(uri)}): ${error.message}`);
    }
  }

  throw lastError || new Error('No MongoDB URI configured');
};

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`CORS configured for frontend: ${FRONTEND_ORIGIN}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error(
      'Tip: For Atlas, whitelist your IP at https://cloud.mongodb.com → Network Access.\n' +
      'Or set MONGO_LOCAL_URL=mongodb://127.0.0.1:27017/smarthire in backend/.env (local MongoDB must be running).'
    );
    process.exit(1);
  }
};

startServer();
