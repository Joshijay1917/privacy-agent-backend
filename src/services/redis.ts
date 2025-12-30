import { createClient } from "redis";

export const RedisClient = createClient({
    url: `redis://Jay`
})