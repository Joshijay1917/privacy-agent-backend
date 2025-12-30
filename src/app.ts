import express, { type Request, type Response } from 'express';
import { chatLimiter } from './utils/chatLimiter.js';

const app = express();

app.set('trust proxy', 1);
app.use(express.json())

import geminiRouter from './routes/gemini.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

app.use("/api/v1/gemini", chatLimiter, geminiRouter)

app.use(errorHandler)

export { app }