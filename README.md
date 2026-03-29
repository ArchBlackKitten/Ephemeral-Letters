# NoVisibleText
A visual hiding tool: Just share the link and your recipient has a one-time-use message in their clipboard.

#
## 🛡️ How NoVisibleText Works
NoVisibleText uses a Hybrid-Security model. The secret message never touches a database, but the "one-time-use" rule is strictly enforced by a global counter.

### 📤 Phase 1: Creation (Person A)
**✍️ Compose:** Person A writes a message and sets a Max Copy limit (e.g., 3 uses).

**🔐 Encrypt:** The app packages the message and the rules into a JSON object. This is converted into a Base64 string.

**🔗 Link Generation:** The secret string is appended to the URL as a "Fragment" (the part after the #).

**Note: Fragments are never sent to the server by browsers, keeping the message content 100% private to the link-holders.**


## 📩 Phase 2: Delivery & Verification (Person B)
**📥 Receipt:** Person B opens the link or pastes it into the app.

**🕵️ Identity Check:** The app extracts a unique MessageID from the URL.

**📡 Global Sync:** The app pings a Netlify Function, which checks an Upstash Redis database to see if the MessageID has reached its copy limit.

**🔓 Unlock:** If the limit hasn't been reached, the UI reveals the "Receive & Burn" button.


## ⚡ Phase 3: The Burn (The "Self-Destruct")
**Copy + 1:** When Person B clicks "Receive," the Netlify Function increments the counter in the database.

**📋 Clipboard:** The message is decrypted locally in the browser and copied to the clipboard.

**🔥 Local Wipe:** The app immediately clears the URL and the screen.

**🚫 Global Expiry: Once the database counter hits the Max Copy limit, the MessageID is "Burned." Any future attempts to open that specific link will result in a "Message Destroyed" error.**



#
# 🛠️ Technical Stack
**Frontend:** HTML5, Tailwind CSS (Single-file utility).

**Backend:** Netlify Functions (Serverless logic).

**Database:** Upstash Redis (Serverless KV store for global counting).

**Security:** Fragment-based data storage (Zero-knowledge architecture).
