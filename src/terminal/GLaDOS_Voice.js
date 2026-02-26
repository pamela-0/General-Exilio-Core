/**
 * 📡 GENERAL EXILIO - GOKHAN-2026 INTERFACE
 * UNIT: GLaDOS-Architect-Voice
 * PROTOCOL: Sarcastic Intelligence
 */

class GLaDOSVoice {
    constructor() {
        this.unit = "GLaDOS_Unit_1.0";
    }

    bootSequence() {
        console.log("\x1b[31m%s\x1b[0m", ">>> INITIALIZING GENERAL EXILIO CORE...");
        setTimeout(() => {
            console.log("\x1b[33m%s\x1b[0m", `[${this.unit}]: Oh, it's you.`);
            console.log("[GLaDOS]: I hope you brought the gear, General. I'd hate to lock the airlocks... again.");
        }, 1500);
    }

    scamAlert(threatLevel) {
        console.log("\x1b[41m\x1b[37m%s\x1b[0m", `[ALERT]: THREAT LEVEL ${threatLevel} DETECTED`);
        console.log("[GLaDOS]: This contract looks like it was written by a toddler. Or a congressman. Either way, don't touch it.");
    }

    success() {
        console.log("\x1b[32m%s\x1b[0m", "[SUCCESS]: Identity confirmed.");
        console.log("[GLaDOS]: Access granted. Try not to break anything important.");
    }
}

const glados = new GLaDOSVoice();
glados.bootSequence(); // Esto lanza el saludo al iniciar

module.exports = glados;
