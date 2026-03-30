# 🔥 Ephemeral Letters
### Zero-Knowledge, Single-Use Correspondence

**Ephemeral Letters** is a privacy-focused tool designed to securely share messages that exist only until they are read. By leveraging a hybrid-security model, it ensures that your content remains private while strictly enforcing "one-time-use" rules through a global "burn" mechanism.

> **Disclaimer:**
> This tool facilitates the delivery of private messages. Once a message is received, the recipient's actions and decisions regarding that information are beyond the control of this software. Use this tool at your own risk.

~
~
~
# [Link to try out](https://ephemeral-letters.pages.dev/)

---

## 🛡️ How It Works
The app uses a **Hybrid-Security Model**. While the secret message itself is never stored in a database, the "burn" rules are enforced globally to prevent link reuse or unauthorized recovery.

### 📤 Phase 1: Creation (Sender)
1.  **Compose:** The sender writes a message and sets a **Max Copy** limit (e.g., 1 or 3 uses).
2.  **Encrypt:** * **Vault Mode:** Uses AES-GCM (military-grade) encryption.
    * **Ghost Mode:** Uses a manual "Twirl" (Shift Cipher) where the sender defines a numeric offset (e.g., +5).
3.  **Link Generation:** The encrypted payload is appended to the URL as a **Fragment** (the part after the `#`).

> **Note:** URL Fragments are handled exclusively by the browser and are **never** sent to the server. This ensures the message content remains 100% private to the link-holders.

---

### 📩 Phase 2: Delivery & Verification (Recipient)
1.  **Receipt:** The recipient opens the link or pastes the payload into the app.
2.  **Identity Check:** The app extracts a unique `MessageID` from the URL fragment.
3.  **Global Sync:** The app pings a **Cloudflare Worker**, which checks an **Upstash Redis** database to verify if the `MessageID` has reached its copy limit.
4.  **Unlock:** * If using **Ghost Mode**, the recipient must manually enter the "counter-twirl" (e.g., -5) to reveal the text.
    * If the limit is intact, the UI reveals the "Receive & Burn" button.

---

### ⚡ Phase 3: The Burn (Self-Destruct)
1.  **Counter Increment:** When the recipient clicks "Receive," the Cloudflare Worker increments the counter in the Redis database.
2.  **Decryption:** The message is decrypted locally in the recipient's browser.
3.  **Clipboard & Wipe:** The text is copied to the clipboard, and the app immediately clears the URL and the screen.
4.  **Global Expiry:** Once the database counter hits the **Max Copy** limit, the `MessageID` is "Burned." Any future attempts to access that link will return a "Message Destroyed" error.

---

## 🔒 Edge-Security & Privacy
By using **Cloudflare** as the delivery layer, Ephemeral Letters gains three critical security advantages:

* **DDoS Protection:** The "Burn" function cannot be spammed by bots to guess keys or exhaust the database.
* **Encrypted Transit:** All metadata checks occur over TLS 1.3, ensuring that even the usage-count check is invisible to middle-men.
* **Zero-Persistence:** Cloudflare Workers are "stateless"—they execute the logic in RAM and immediately vanish, leaving no traces of the request on a physical hard drive.

---

## 🛠️ Technical Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | HTML5 / Tailwind CSS | Single-file, zero-dependency UI. |
| **Serverless** | Cloudflare Workers | Handles logic for checking/incrementing use counts. |
| **Database** | Upstash Redis | Serverless Key-Value store for global "burn" tracking. |
| **Architecture** | Zero-Knowledge | Uses URL Fragments to keep data out of server logs. |

*“Security is not a product, but a process.”*
