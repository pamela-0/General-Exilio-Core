/**
 * 📡 GENERAL EXILIO - GOKHAN-2026 ENGINE
 * UNIT: Scam-Detection-Engine v2.0
 * PROTOCOL: Phantom Strike / Counter-Intrusion
 */

const { ethers } = require("ethers");

// EVM opcodes that are high-risk in unknown contracts.
// Reference: https://www.evm.codes/
const DANGEROUS_OPCODES = {
    0xff: "SELFDESTRUCT",   // Destroys contract, sends all ETH to arbitrary address
    0xf4: "DELEGATECALL",   // Executes external code in this contract's storage context
    0xf0: "CREATE",         // Deploys a new contract dynamically (factory pattern / dropper)
    0xf5: "CREATE2",        // Deterministic CREATE — used in counterfactual drainer deployments
};

// PUSH1 (0x60) through PUSH32 (0x7f) — each pushes N bytes of literal data onto the stack.
// We MUST skip those data bytes during analysis or we'll get false positives
// (e.g., the value 0xff appearing as a PUSH argument is NOT a SELFDESTRUCT opcode).
const PUSH1 = 0x60;
const PUSH32 = 0x7f;

/**
 * Parses EVM bytecode and returns all dangerous opcodes actually found.
 * Correctly skips PUSH data to avoid false positives.
 *
 * @param {string} bytecode - Hex string from provider.getCode(), e.g. "0x6080..."
 * @returns {{ opcode: number, name: string, offset: number }[]}
 */
function disassembleDangerousOpcodes(bytecode) {
    const hex = bytecode.startsWith("0x") ? bytecode.slice(2) : bytecode;
    const bytes = Buffer.from(hex, "hex");
    const findings = [];

    let i = 0;
    while (i < bytes.length) {
        const opcode = bytes[i];

        if (DANGEROUS_OPCODES[opcode]) {
            findings.push({
                opcode,
                name: DANGEROUS_OPCODES[opcode],
                offset: i,
            });
        }

        // If this is a PUSH instruction, skip its inline data bytes.
        // PUSH1 pushes 1 byte, PUSH2 pushes 2, ..., PUSH32 pushes 32.
        if (opcode >= PUSH1 && opcode <= PUSH32) {
            i += opcode - PUSH1 + 1; // skip N data bytes
        }

        i++;
    }

    return findings;
}

class ScamGuard {
    /**
     * @param {string} rpcUrl - e.g. "http://127.0.0.1:8545" for a local Hardhat/Anvil node
     */
    constructor(rpcUrl) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    /**
     * Audits a contract address for known dangerous patterns.
     *
     * @param {string} contractAddress
     * @returns {Promise<{ status: string, threats: string[], details: object[] }>}
     */
    async auditContract(contractAddress) {
        console.log(`[ScamGuard]: Auditing ${contractAddress}...`);

        const bytecode = await this.provider.getCode(contractAddress);

        // Not a contract — plain EOA wallet
        if (!bytecode || bytecode === "0x") {
            return { status: "EOA", threats: [], details: [] };
        }

        // --- Layer 1: Opcode analysis ---
        const dangerousOpcodes = disassembleDangerousOpcodes(bytecode);
        const threats = dangerousOpcodes.map((f) => f.name);

        if (dangerousOpcodes.length > 0) {
            console.warn(`[ScamGuard]: CRITICAL — dangerous opcodes found:`, threats);
            return {
                status: "CRITICAL_DANGER",
                threats,
                details: dangerousOpcodes,
            };
        }

        // --- Layer 2: Heuristic — fresh contract with large bytecode ---
        // getTransactionCount on a contract address returns the nonce (number of internal txs sent).
        // A brand-new contract (nonce=0) with a large bytecode is statistically suspicious.
        const nonce = await this.provider.getTransactionCount(contractAddress);
        const byteSize = (bytecode.length - 2) / 2; // subtract "0x", divide by 2 (hex → bytes)

        if (nonce < 5 && byteSize > 2500) {
            console.warn(`[ScamGuard]: SUSPICIOUS — fresh contract (nonce=${nonce}), bytecode=${byteSize} bytes`);
            return {
                status: "SUSPICIOUS",
                threats: ["FRESH_LARGE_CONTRACT"],
                details: [{ nonce, byteSize }],
            };
        }

        console.log(`[ScamGuard]: ${contractAddress} — no threats detected.`);
        return { status: "SECURE", threats: [], details: [] };
    }
}

module.exports = { ScamGuard, disassembleDangerousOpcodes };
