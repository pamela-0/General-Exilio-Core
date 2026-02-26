# 🥾 GEAR ASSEMBLY MANUAL: GOKHAN-2026
> **Unit:** Tactical Authentication Hardware
> **Objective:** Physical-Digital Linkage

## 1. Suministros Necesarios
No aceptes sustitutos. La integridad del búnker depende de la calidad del hardware:
* **Chip:** NTAG215 NFC Tag (PVC Coin o Sticker resistente al agua).
* **Adhesivo:** Cinta de grado industrial o pegamento de contacto flexible.
* **Calzado:** Botas tácticas o calzado con lengüeta/plantilla accesible.

## 2. Instalación Física (The Placement)
El chip debe estar posicionado de forma que el sensor NFC de tu smartphone lo detecte a menos de 2cm al realizar la firma:
1.  **Opción A (La Lengüeta):** Adhiere el chip en la parte interior de la lengüeta. Es el punto de acceso más rápido.
2.  **Opción B (La Plantilla):** Coloca el chip bajo la plantilla del talón. Ofrece máxima discreción (Stealth Mode).

## 3. Configuración del Handshake
Una vez instalado el chip, debes vincularlo al código de **General Exilio**:
1.  Escanea el chip con una app de lectura NFC para obtener el **ID ÚNICO (UID)**.
2.  Abre el archivo `src/auth/NFCGatekeeper.js` en tu repositorio.
3.  Reemplaza el valor de `AUTHORIZED_GEAR_UID` con el ID de tu chip.

## 4. Protocolo de Verificación
Ejecuta el siguiente comando para probar la conexión:
```bash
node src/core/ExileWallet.js --verify-hardware
