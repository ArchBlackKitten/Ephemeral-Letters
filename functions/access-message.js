export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { messageId, maxCopies, expiryHours } = body;

        const REDIS_URL = env.UPSTASH_REDIS_REST_URL;
        const REDIS_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

        if (!REDIS_URL || !REDIS_TOKEN) {
            return new Response(JSON.stringify({ error: "Config Missing" }), { status: 500 });
        }

        // 3. GET current count
        const getRes = await fetch(`${REDIS_URL}/get/${messageId}`, {
            headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
        });
        
        const getData = await getRes.json();
        let currentCount = (getData.result !== null && getData.result !== undefined) ? parseInt(getData.result) : 0;

        // 4. Check if burned
        if (currentCount >= maxCopies) {
            return new Response(JSON.stringify({ error: "Burned" }), { status: 403 });
        }

        // 5. SET new count with Expiry
        const ttlSeconds = (expiryHours || 24) * 3600;
        
        // Note: We use the REST path /set/key/value/EX/seconds
        const setRes = await fetch(`${REDIS_URL}/set/${messageId}/${currentCount + 1}/EX/${ttlSeconds}`, {
            method: 'GET', // Upstash REST allows GET for this path-style command
            headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
        });

        // Check if Upstash actually saved it
        if (!setRes.ok) {
            throw new Error("Failed to update database");
        }

        return new Response(JSON.stringify({ count: currentCount + 1 }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Server Error: " + err.message }), { status: 500 });
    }
}
