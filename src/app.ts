import express, { type Request, type Response } from 'express';
import { chatLimiter } from './utils/chatLimiter.js';
import cors, { type CorsOptions } from 'cors';

const app = express();

const allowedOrigins = [
  'https://your-frontend-onrender.com', // If you have a web version
  'http://localhost:8081',              // For Expo Go development
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined, 
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Logic here
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-anonymous-id'],
  credentials: true,
};

app.use(cors(corsOptions));
app.set('trust proxy', 1);
app.use(express.json())

import geminiRouter from './routes/gemini.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

app.use("/api/v1/gemini", chatLimiter, geminiRouter)

app.use(errorHandler)

export { app }