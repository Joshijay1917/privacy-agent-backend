import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);

export const chatLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    // keyGenerator: (req) => {
    //     const anonId = req.headers['x-anonymous-id'] || 'no-id';
    //     return `${anonId}-${req.ip}`;
    // },
    keyGenerator: (req) => {
        // Custom key using your anonymous ID and the request IP
        const anonId = req.headers['x-anonymous-id'] || 'no-id';
        const ip = req.ip || 'no-ip';
        return `${anonId}-${ip}`;
    },
    handler: (req, res) => {
        res.status(429).json({
            error: "Energy Depleted",
            message: "You've used your 20 free privacy queries for today. Resets in 24h."
        });
    }
})