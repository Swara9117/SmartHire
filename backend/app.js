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
app.use(express.json());

const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

app.use(cors());

const FASTAPI_URL = "http://localhost:8000";


// Routes
import authRoutes from "./routes/auth.js";
import { verifyToken } from "./middleware/verify.js";
import interviewRoutes from "./routes/interview.js";
import userRoutes from "./routes/user.js";
import gdRoutes from "./routes/gdRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";

// app.use(cors());
//cors for both fasAPI_backend and frontend

// Configure CORS for your frontend (5173)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
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

// Routes
app.use("/interviews", interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/gd', gdRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/candidate', candidateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    services: ['resume', 'gd'],
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    path: req.path
  });
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database Connected successfully!");
    // server.listen(PORT, () => console.log(`Running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Database connection failed", error.message);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS configured for frontend: http://localhost:5173`);
});
