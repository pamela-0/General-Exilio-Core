/**
 * 📡 GENERAL EXILIO - GOKHAN-2026 AUTH
 * UNIT: NFC-Gatekeeper v1.0
 * PROTOCOL: No Gear, No Key.
 */

const { ethers } = require("ethers");

class NFCGatekeeper {
    constructor(trustedGearUID) {
        // Este es el ID único que viene grabado en el chip de tu bota
        this.authorizedUID = trustedGearUID; 
        this.isGearConnected = false;
    }

    /**
     * @param {string} scannedUID - El ID que el teléfono lee al tocar el zapato.
     */
    verifyPhysicalAccess(scannedUID) {
        console.log("[GLaDOS]: Scanning Physical Gear...");

        if (scannedUID === this.authorizedUID) {
            this.isGearConnected = true;
            console.log("[GLaDOS]: Identity Confirmed. Welcome, General.");
            return true;
        } else {
            this.isGearConnected = false;
            console.error("[CRITICAL]: Unauthorized Hardware Detected. System Lockdown.");
            return false;
        }
    }

    async secureSign(transaction, wallet) {
        if (!this.isGearConnected) {
            throw new Error("[GLaDOS]: Sign-in failed. Boot-link required.");
        }
        
        console.log("[PHANTOM STRIKE]: Signing transaction with physical confirmation...");
        return await wallet.signTransaction(transaction);
    }
}

module.exports = NFCGatekeeper;
