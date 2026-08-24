# AgroBC — app Expo

Prototipo navegable en React Native/Expo de AgroBC: buscar cultivo + problema, ver 3 resultados, fabricantes y registro al piloto.

## Cómo correrlo y generar el QR para Expo Go

1. Instala Node.js (si no lo tienes): https://nodejs.org (versión LTS).
2. En esta carpeta, instala dependencias:

   ```bash
   npm install
   ```

3. Arranca el proyecto:

   ```bash
   npx expo start
   ```

4. Expo va a imprimir un **código QR en la terminal** (y abrir una pestaña en tu navegador con el mismo QR). Ese QR lo genera Expo automáticamente — no es algo fijo, cambia cada vez que arrancas el servidor.
5. En tu iPhone, instala **Expo Go** desde el App Store, ábrela y usa su lector de QR integrado (o la app Cámara) para escanear el código. La app cargará ahí mismo.

Tu teléfono y tu computadora deben estar en la misma red Wi-Fi.
