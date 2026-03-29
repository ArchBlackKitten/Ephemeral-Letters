const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { messageId, maxCopies, expiryHours } = JSON.parse(event.body);
    const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
    const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

    // 1. Check current count
    const getRes = await fetch(`${REDIS_URL}/get/${messageId}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    const { result } = await getRes.json();
    let currentCount = result ? parseInt(result) : 0;

    // 2. If already burned, block access
    if (currentCount >= maxCopies) {
        return { statusCode: 403, body: JSON.stringify({ error: "Burned" }) };
    }

    // 3. Increment AND set an expiration (e.g., 48 hours)
    // This ensures the key deletes itself from your DB eventually.
    const ttlSeconds = (expiryHours || 24) * 3600;

    await fetch(`${REDIS_URL}/set/${messageId}/${currentCount + 1}/EX/${ttlSeconds}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ count: currentCount + 1 })
    };
};
