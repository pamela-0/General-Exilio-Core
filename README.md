![General Exilio Banner](banner.png)
> **CORE:** GLaDOS_Unit_1.0
> **PROTOCOL:** IDENTIFY OR DISCONNECT

## 📜 THE MANIFESTO
Digital life is a trap. They spy, you obey. 
Welcome to the **Exile**. We are the exit.

- 👢 **Physical ID:** No gear, no key. Hardware-level authentication.
- 🛡️ **Defense:** Phantom Strike active. Counter-intrusion protocols.
- 🧠 **Sovereignty:** Your AI. Your server. Your rules.

## 🛠️ ARCHITECTURE
1. **Scam-Detection-Engine:** Real-time contract audit.
2. **Manhattan-Mirage UI:** Terminal interface.
## 🛠️ INSTALLATION: JOIN THE EXILE

To deploy the **General Exilio** protocol, follow the "Boot-Sequence":

### 1. Acquire the Hardware (The Gear)
You cannot access the core without physical authentication.
* **Required:** NTAG215 NFC Chip (Sticker or Coin).
* **Placement:** Inside the tongue or under the insole of your footwear.
* **Where to buy:** [Amazon](https://www.amazon.com/s?k=NTAG215+stickers) | [AliExpress](https://www.aliexpress.com/wholesale?SearchText=NTAG215+anti-metal)

### 2. Link your Identity
Download any NFC Tool on your smartphone and scan your Gear to get your **Unique UID**.
* Update `src/auth/NFCGatekeeper.js` with your specific UID.

### 3. Deploy the Architecture
```bash
# Clone the rebellion
git clone [https://github.com/pamela-0/General-Exilio-Core.git](https://github.com/pamela-0/General-Exilio-Core.git)

# Install dependencies
npm install ethers

# Wake up GLaDOS
node src/core/ExileExecutioner.js
