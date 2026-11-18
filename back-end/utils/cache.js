
import { redis } from "../lib/redis.js";

export async function getOrSetCache(key, ttl, fetchData) {
    // If Redis is unavailable, use PostgreSQL normally
    if (!redis) {
        return await fetchData();
    }

    try {
        const cachedData = await redis.get(key);

        if (cachedData !== null) {
            console.log("CACHE HIT:", key);
            return cachedData;
        }
    } catch (error) {
        console.error("REDIS READ ERROR:", error);
    }

    console.log("CACHE MISS:", key);

    const freshData = await fetchData();

    try {
        await redis.set(key, freshData, { ex: ttl });
    } catch (error) {
        console.error("REDIS WRITE ERROR:", error);
    }

    return freshData;
}

// Delete all keys matching a prefix
async function invalidateCache(prefix) {
    if (!redis) return;

    try {
        const keys = await redis.keys(`${prefix}:*`);

        if (keys.length > 0) {
            await redis.del(...keys);
            console.log("CACHE INVALIDATED:", prefix);
        }
    } catch (error) {
        console.error("REDIS INVALIDATION ERROR:", error);
    }
}

export async function invalidateDashboardCache() {
    await invalidateCache("dashboard");
}

export async function invalidateProductCache() {
    await invalidateCache("products");
}

export async function invalidateCategoryCache() {
    await invalidateCache("categories");
}
