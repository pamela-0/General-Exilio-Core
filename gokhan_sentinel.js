// GOKHAN SENTINEL v2.0 - Protocolo de Vigilancia Proximidad
// SECURITY: exec() has been fully removed. All NFC events dispatch to a
// predefined function table. No external input ever reaches a shell.

const nfc  = require("nfc-pcsc");
const fs   = require("fs");
const path = require("path");

// execFile (NOT exec) is used only for OS-level actions.
// execFile does NOT invoke a shell — it calls the binary directly with a
// fixed argument array, making shell injection structurally impossible.
const { execFile } = require("child_process");

const STATUS_LOG = path.join(__dirname, "status.log");

// ── Hardened action implementations ──────────────────────────────────────────
// These are the ONLY side-effects the Sentinel is allowed to produce.
// Each function is pure JS or uses execFile with fully hardcoded arguments.
// User/hardware data (e.g. card.uid) is NEVER passed into any of these calls.

function open_vault() {
    const entry = `[${new Date().toISOString()}] VAULT_OPEN\n`;
    fs.appendFileSync(STATUS_LOG, entry);
    console.log("[Sentinel]: Vault opened. Status logged.");
}

function lock_terminal() {
    console.log("[Sentinel]: Locking workstation...");

    if (process.platform === "win32") {
        // Args are a hardcoded array — no shell, no interpolation.
        execFile("rundll32.exe", ["user32.dll,LockWorkStation"], onExecError);
    } else if (process.platform === "linux") {
        execFile("loginctl", ["lock-session"], onExecError);
    } else if (process.platform === "darwin") {
        execFile("pmset", ["displaysleepnow"], onExecError);
    } else {
        console.warn("[Sentinel]: lock_terminal — unsupported platform, skipping.");
    }
}

function sync_wallet() {
    // Triggers in-process wallet synchronization.
    // TODO: replace console.log with a direct call to ExileWallet's sync method.
    console.log("[Sentinel]: Wallet sync triggered.");
}

// Callback for execFile — captures errors without crashing the process.
function onExecError(err) {
    if (err) console.error("[Sentinel]: execFile error:", err.message);
}

// ── Whitelist dispatch table ──────────────────────────────────────────────────
// This object is the single source of truth for allowed actions.
// Adding a new capability requires an explicit entry here — nothing else.

const ACTION_MAP = Object.freeze({
    open_vault,
    lock_terminal,
    sync_wallet,
});

/**
 * Dispatches a named action. If the name is not in ACTION_MAP, the call is
 * rejected and the attempt is logged as a security event.
 *
 * @param {string} actionName - Must be an exact key of ACTION_MAP.
 * @param {object} context    - Metadata for the audit log (e.g. reader name).
 *                              Never used as a command argument.
 */
function dispatch(actionName, context) {
    // Object.hasOwn prevents prototype-chain attacks (e.g. "constructor", "__proto__").
    if (!Object.hasOwn(ACTION_MAP, actionName)) {
        logIntrusionAttempt(actionName, context);
        return;
    }
    ACTION_MAP[actionName]();
}

function logIntrusionAttempt(attempted, context) {
    const entry = {
        timestamp: new Date().toISOString(),
        event:     "INTRUSION_ATTEMPT",
        attempted,
        context,
    };
    console.error("[SENTINEL SECURITY]: Unauthorized action blocked:", entry);
    fs.appendFileSync(STATUS_LOG, JSON.stringify(entry) + "\n");
}

// ── NFC reader wiring ─────────────────────────────────────────────────────────

const nfcReader = new nfc.NFC();
let gearPresent = false;

console.log("[Sentinel]: Iniciando vigilancia de Capa 0...");

nfcReader.on("reader", reader => {
    console.log(`[Sentinel]: Lector detectado: ${reader.name}. Esperando gear...`);

    reader.on("card", card => {
        // card.uid is logged for audit purposes only.
        // It is NOT passed to dispatch() or any shell command.
        console.log(`[Sentinel]: Gear detectado (UID: ${card.uid}).`);
        gearPresent = true;

        dispatch("open_vault",   { reader: reader.name });
    });

    reader.on("card.off", card => {
        console.log("[Sentinel]: Gear fuera de rango. Ejecutando bloqueo tactico.");
        gearPresent = false;

        dispatch("lock_terminal", { reader: reader.name });
    });

    reader.on("error", err => {
        console.error(`[Sentinel]: Error en lector ${reader.name}:`, err.message);
    });
});

// ── Heartbeat ─────────────────────────────────────────────────────────────────

setInterval(() => {
    if (!gearPresent) {
        console.log("[Sentinel]: Perimetro seguro. Gear no detectado.");
    }
}, 5000);
