/**
 * 🛰️ GENERAL EXILIO | THE EXILE WALLET
 * PROTOCOL: GOKHAN-HARDWARE-ENFORCED
 * NO GEAR, NO KEY.
 */

const { ethers } = require("ethers");
const glados = require("../terminal/GLaDOS_Voice");

class ExileWallet {
    constructor(nfcGatekeeper) {
        this.gatekeeper = nfcGatekeeper; // Vinculado a tu chip de la bota
        this.wallet = null;
    }

    // Genera una billetera que nace protegida
    async createSovereignWallet() {
        const newWallet = ethers.Wallet.createRandom();
        console.log("\x1b[32m%s\x1b[0m", "[SUCCESS]: Sovereign Wallet Generated.");
        console.log(`[ADDRESS]: ${newWallet.address}`);
        console.log("[GLaDOS]: I've generated your keys. Don't lose them, I won't help you find them.");
        this.wallet = newWallet;
        return newWallet;
    }

    // EL FILTRO DE SEGURIDAD ÚNICO:
    async signTransaction(transaction, scannedGearUID) {
        console.log("[SYSTEM]: Requesting hardware handshake...");

        // Aquí es donde el código busca el pulso de la bota
        if (!this.gatekeeper.verify(scannedGearUID)) {
            glados.scamAlert("CRITICAL: GEAR NOT DETECTED");
            throw new Error("TRANSACTION_ABORTED: You need to be in your boots to spend money, General.");
        }

        console.log("[GLaDOS]: Gear detected. I suppose I'll let you spend your credits.");
        return await this.wallet.signTransaction(transaction);
    }
}

module.exports = ExileWallet;
