export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 1. Get data from the frontend
        const body = await request.json();
        const { messageId, maxCopies, expiryHours } = body;

        // 2. Access variables (No quotes needed in Dashboard!)
        const REDIS_URL = env.UPSTASH_REDIS_REST_URL;
        const REDIS_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

        if (!REDIS_URL || !REDIS_TOKEN) {
            return new Response(JSON.stringify({ error: "Config Missing" }), { status: 500 });
        }

        // 3. Talk to Upstash Redis
        const getRes = await fetch(`${REDIS_URL}/get/${messageId}`, {
            headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
        });
        
        const getData = await getRes.json();
        let currentCount = getData.result ? parseInt(getData.result) : 0;

        // 4. Check if burned
        if (currentCount >= maxCopies) {
            return new Response(JSON.stringify({ error: "Burned" }), { status: 403 });
        }

        // 5. Increment and set Expiry
        const ttlSeconds = (expiryHours || 24) * 3600;
        const setRes = await fetch(`${REDIS_URL}/set/${messageId}/${currentCount + 1}/EX/${ttlSeconds}`, {
            headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
        });

        return new Response(JSON.stringify({ count: currentCount + 1 }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Server Error: " + err.message }), { status: 500 });
    }
}
