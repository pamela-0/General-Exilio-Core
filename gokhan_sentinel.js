// GOKHAN SENTINEL v1.0 - Protocolo de Vigilancia Proximidad
const nfc = require('nfc-pcsc'); // La librería que "siente" el chip
const { exec } = require('child_process'); // Para ejecutar órdenes de sistema

const nfcReader = new nfc.NFC();
let gearPresent = false;

console.log("📡 GOKHAN SENTINEL: Iniciando vigilancia de Capa 0...");

nfcReader.on('reader', reader => {
    console.log(`✅ Lector detectado: ${reader.name}. Esperando bota táctica...`);

    reader.on('card', card => {
        // AQUÍ ES DONDE SUCEDE LA MAGIA
        console.log(`🥾 BOTA DETECTADA (UID: ${card.uid}). Acceso concedido.`);
        gearPresent = true;
        
        // Acción: Desencriptar carpeta o activar interfaz
        exec('echo "Acceso Abierto" > status.log'); 
    });

    reader.on('card.off', card => {
        console.log("⚠️ ALERTA: BOTA FUERA DE RANGO. EJECUTANDO BLOQUEO TÁCTICO.");
        gearPresent = false;

        // ACCIÓN DE EMERGENCIA: 
        // Aquí mandamos la orden de cerrar procesos, borrar caché o bloquear pantalla.
        exec('gnome-screensaver-command -l'); // Ejemplo: Bloquea la pantalla en Linux
        // exec('rundll32.exe user32.dll,LockWorkStation'); // Ejemplo: Bloquea Windows
    });

    reader.on('error', err => {
        console.error(`❌ Error en el lector ${reader.name}:`, err);
    });
});

// Verificación de seguridad constante (Heartbeat)
setInterval(() => {
    if (!gearPresent) {
        // Si no hay bota, asegúrate de que todo esté sellado
        console.log("🔒 Vigilante: Perímetro seguro. Sin rastro del General.");
    }
}, 5000);
