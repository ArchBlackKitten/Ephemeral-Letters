export async function onRequestPost(context) {
    const { request, env } = context;

    // 1. Parse the incoming request body
    const { messageId, maxCopies, expiryHours } = await request.json();

    // 2. Get your Environment Variables (Set these in Cloudflare Dashboard)
    const REDIS_URL = env.UPSTASH_REDIS_REST_URL;
    const REDIS_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

    // 3. Check current count from Upstash
    const getRes = await fetch(`${REDIS_URL}/get/${messageId}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    
    const { result } = await getRes.json();
    let currentCount = result ? parseInt(result) : 0;

    // 4. Check if limit reached
    if (currentCount >= maxCopies) {
        return new Response(JSON.stringify({ error: "Burned" }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }

    // 5. Increment and set TTL (Seconds)
    const ttlSeconds = (expiryHours || 24) * 3600;

    await fetch(`${REDIS_URL}/set/${messageId}/${currentCount + 1}/EX/${ttlSeconds}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });

    // 6. Return successful response
    return new Response(JSON.stringify({ count: currentCount + 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
