import express, { type Request, type Response } from 'express';
import { chatLimiter } from './utils/chatLimiter.js';
import cors, { type CorsOptions } from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = [
  'https://your-frontend-onrender.com', // If you have a web version
  'http://localhost:8081',              // For Expo Go development
  'http://localhost:5173',
  'https://privacy-agent-app-download.vercel.app'
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined, 
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
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
app.use(cookieParser())

//Routes
import geminiRouter from './routes/gemini.routes.js';
import userRouter from './routes/user.routes.js';
import { saveInterest } from './controller/interest.controller.js';
import cookieParser from 'cookie-parser';

app.use("/api/v1/gemini", chatLimiter, geminiRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/track-interest", saveInterest)

app.use(errorHandler)

export { app }