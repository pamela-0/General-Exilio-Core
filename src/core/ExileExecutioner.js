/**
 * 📡 GENERAL EXILIO - THE EXECUTIONER
 * PROTOCOL: GOKHAN-UNTOUCHABLE
 * DESCRIPTION: Prevents transaction signing unless:
 *   1. Physical NFC gear UID is verified.
 *   2. ScamGuard clears the target contract as safe.
 */

const glados = require("../terminal/GLaDOS_Voice");
const NFCGatekeeper = require("../src/auth/src/auth/NFCGatekeeper");
const { ScamGuard } = require("../ScamGuard");

class ExileExecutioner {
    /**
     * @param {string} trustedGearUID - The authorized NFC chip UID (e.g. "04:A3:2B:1C")
     * @param {string} rpcUrl         - Ethereum RPC endpoint (e.g. "http://127.0.0.1:8545")
     */
    constructor(trustedGearUID, rpcUrl) {
        this.gatekeeper = new NFCGatekeeper(trustedGearUID);
        this.scamGuard  = new ScamGuard(rpcUrl);
    }

    /**
     * Executes a transaction only after passing two independent security gates.
     *
     * @param {object}        transaction - ethers.js v6 tx object: { to, value, data, gasLimit? }
     * @param {ethers.Wallet} wallet      - ethers.js v6 Wallet already connected to a provider
     * @param {string}        scannedUID  - UID read from the NFC reader at the moment of signing
     *
     * @returns {Promise<ethers.TransactionResponse>}
     * @throws  {Error} on any failed gate — transaction is never sent
     */
    async executeSafeTrade(transaction, wallet, scannedUID) {

        // ── GATE 1: Physical verification ────────────────────────────────────────
        // Compares the scanned UID against the pre-enrolled chip UID.
        //
        // TODO (hardware integration): when nfc-pcsc is active, the card event also
        // provides `card.atr` and reader signal data. Add a proximity check here
        // using the reader's RFU bits or RSSI to enforce the <2cm range requirement
        // before calling verifyPhysicalAccess().
        if (!this.gatekeeper.verifyPhysicalAccess(scannedUID)) {
            glados.scamAlert("CRITICAL: PHYSICAL KEY MISSING");
            throw new Error("ACCESS_DENIED: NFC gear UID mismatch. No transaction sent.");
        }

        // ── GATE 2: Contract intelligence (ScamGuard opcode audit) ───────────────
        const targetAddress = transaction.to;

        // Contract deployments have no `to`. Block until manual review workflow exists.
        if (!targetAddress) {
            throw new Error(
                "BLOCKED: Contract-deployment transactions have no target to audit. " +
                "Authorize manually."
            );
        }

        console.log(`[ExileExecutioner]: ScamGuard auditing ${targetAddress}...`);

        const report = await this.scamGuard.auditContract(targetAddress);

        if (report.status === "CRITICAL_DANGER") {
            glados.scamAlert(`HIGH: DANGEROUS OPCODES — ${report.threats.join(", ")}`);
            // Log full details for the operator without exposing them in the thrown error.
            console.error("[ExileExecutioner]: Audit report:", report.details);
            throw new Error(
                `BLOCKED: Contract contains dangerous opcodes [${report.threats.join(", ")}]. ` +
                "No transaction sent."
            );
        }

        if (report.status === "SUSPICIOUS") {
            glados.scamAlert(`MEDIUM: SUSPICIOUS CONTRACT — ${report.threats.join(", ")}`);
            console.warn("[ExileExecutioner]: Audit report:", report.details);
            throw new Error(
                `BLOCKED: Contract flagged as suspicious [${report.threats.join(", ")}]. ` +
                "Requires manual review before proceeding."
            );
        }

        // ── Both gates passed ─────────────────────────────────────────────────────
        glados.success();
        console.log("[ExileExecutioner]: Sending transaction via ethers.js v6...");

        // ethers.js v6: wallet.sendTransaction() accepts a standard tx object.
        // The wallet must be connected to a provider (e.g. wallet.connect(provider)).
        // Returns a TransactionResponse; call .wait() on it to get the receipt.
        const txResponse = await wallet.sendTransaction(transaction);
        console.log(`[ExileExecutioner]: Transaction broadcast. Hash: ${txResponse.hash}`);

        return txResponse;
    }
}

module.exports = ExileExecutioner;
