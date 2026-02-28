![General Exilio Banner](banner.png)
# GENERAL EXILIO | GOKHAN-2026
> **CORE:** GLaDOS_Unit_1.0
> **PROTOCOL:** IDENTIFY OR DISCONNECT

## THE MANIFESTO
Digital life is a trap. They spy, you obey.
Welcome to the **Exile**. We are the exit.

- **Physical ID:** No gear, no key. Hardware-level authentication.
- **Defense:** Phantom Strike active. Counter-intrusion protocols.
- **Sovereignty:** Your AI. Your server. Your rules.

---

## ARCHITECTURE

### 1. ScamGuard (`src/ScamGuard.js`)
Real-time EVM contract auditor. Detects dangerous opcodes by parsing bytecode
correctly — skipping PUSH data to avoid false positives.

| Opcode | Mnemonic | Risk |
|--------|----------|------|
| `0xff` | `SELFDESTRUCT` | Drains ETH to arbitrary address |
| `0xf4` | `DELEGATECALL` | Executes external code in this contract's storage |
| `0xf0` | `CREATE` | Dynamic contract deployment (dropper pattern) |
| `0xf5` | `CREATE2` | Deterministic drainer deployment |

Fresh contracts (nonce < 5) with large bytecode (> 2500 bytes) are flagged
as `SUSPICIOUS` and blocked pending manual review.

### 2. ExileExecutioner (`src/core/ExileExecutioner.js`)
Transaction gateway. A transaction is sent **only** if it clears two
independent gates in sequence:

```
NFC UID check (Gate 1) → ScamGuard audit (Gate 2) → wallet.sendTransaction()
```

If either gate fails, an error is thrown and nothing is sent. Uses ethers.js v6.

### 3. GOKHAN Sentinel (`gokhan_sentinel.js`)
Background process that monitors the physical NFC reader. When the gear is
detected or removed, it dispatches a named action from a hardened whitelist.

`exec()` has been fully removed. Actions are predefined JS functions; OS-level
calls use `execFile()` with hardcoded argument arrays — no shell is ever
invoked, making command injection structurally impossible.

**Whitelisted actions:**

| Action | Trigger | Effect |
|--------|---------|--------|
| `open_vault` | Gear detected | Appends `VAULT_OPEN` entry to `status.log` |
| `lock_terminal` | Gear removed | Locks the workstation (cross-platform) |
| `sync_wallet` | (extensible) | Triggers in-process wallet sync |

Any attempt to dispatch an unknown action is rejected and logged as an
`INTRUSION_ATTEMPT` in `status.log`.

### 4. NFCGatekeeper (`src/src/auth/src/auth/NFCGatekeeper.js`)
Compares the UID scanned at signing time against the enrolled chip UID.
Returns `false` on mismatch — the Executioner throws before any signing occurs.

### 5. Manhattan Mirage (`src/ui/ManhattanMirage.html`)
Terminal-style UI for interaction with the core.

---

## INSTALLATION

### 1. Acquire the hardware

Physical authentication is required to operate the core.

- **Required:** NTAG215 or NTAG216 NFC chip (sticker or coin form factor)
- **Placement:** Inside the tongue or under the insole of your footwear
- **Reader:** Any PC/SC-compatible USB NFC reader supported by `nfc-pcsc`

### 2. Enroll your chip UID

Scan your gear with any NFC tool on your smartphone to obtain its **Unique UID**,
then pass it to `ExileExecutioner` and `NFCGatekeeper` at initialization:

```js
const ExileExecutioner = require('./src/core/ExileExecutioner');

const executor = new ExileExecutioner(
    "04:A3:2B:1C",          // Your chip's UID
    "http://127.0.0.1:8545" // Your Ethereum RPC endpoint
);
```

> The UID is never passed to a shell. It is compared in-process only.

### 3. Install dependencies

```bash
npm install
```

The only runtime dependency is `ethers` (v6) and `nfc-pcsc` for the Sentinel.

### 4. Start the Sentinel

```bash
node gokhan_sentinel.js
```

### 5. Send a transaction

```js
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet   = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);

const tx = {
    to:    "0xTargetContractAddress",
    value: ethers.parseEther("0.1"),
};

// scannedUID must match the enrolled chip UID or the call throws.
const txResponse = await executor.executeSafeTrade(tx, wallet, "04:A3:2B:1C");
await txResponse.wait(); // wait for on-chain confirmation
```

---

## SECURITY MODEL

Two independent checks must pass before any transaction is broadcast:

1. **Physical gate** — The UID scanned at signing time must match the enrolled
   chip. Proximity enforcement (<2cm) is handled by the NFC reader hardware.

2. **Intelligence gate** — ScamGuard disassembles the target contract's bytecode
   and rejects it if dangerous opcodes are found or if heuristics flag it as
   suspicious.

Neither gate can be bypassed by the other. Both must return clean.
