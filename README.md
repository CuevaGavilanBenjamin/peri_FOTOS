# Generador de Fotos HERENCIA 📸

Aplicación en Node.js que usa Google AI (Gemini/Imagen 3) para combinar fotos de personas con el marco HERENCIA.

## 🚀 Instalación

```bash
npm install
```

## 📁 Estructura de Carpetas

Crea las siguientes carpetas y coloca tus imágenes:

```
pruebaperi/
├── input/
│   ├── persona.jpg          # Tu foto de la persona
│   └── marco-herencia.png   # El marco HERENCIA
├── output/                  # Aquí se guardará el resultado
├── .env                     # API Key (ya configurado)
├── package.json
├── imageGenerator.js
└── index.js
```

## 🎯 Uso

1. **Coloca tus imágenes** en la carpeta `input/`:
   - `persona.jpg` - La foto de la persona
   - `marco-herencia.png` - El marco HERENCIA

2. **Ejecuta el programa**:
```bash
npm start
```

3. **Resultado**: La imagen combinada se guardará en `output/foto-final.png`

## 🔑 API Key

Ya está configurada en el archivo `.env`:
```
GOOGLE_API_KEY=AIzaSyAVj2ZC8oTGvA892bTuUL-HIlsi3WCfnEw
```

## ⚠️ Nota Importante

**Imagen 3** (el modelo específico de generación de imágenes de Google) está actualmente en **preview limitado**. 

Por ahora, el código usa **Gemini Vision** que puede:
- ✅ Analizar y entender las imágenes
- ✅ Dar instrucciones de cómo combinarlas
- ⚠️ Pero no genera imágenes directamente aún

### Solución Alternativa

Para generar las imágenes ahora, puedes:

1. **Opción 1**: Usar el código con procesamiento local (Sharp/Canvas)
2. **Opción 2**: Esperar acceso completo a Imagen 3
3. **Opción 3**: Usar Google AI Studio web interface

¿Quieres que modifique el código para usar **procesamiento local con Sharp** y generar las imágenes ahora mismo? Esto te permitiría combinar las imágenes sin esperar a Imagen 3. 🎨
