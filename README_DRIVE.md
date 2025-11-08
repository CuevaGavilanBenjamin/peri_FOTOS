# Generador de Fotos HERENCIA con Google Drive 📸

Sistema automatizado que procesa fotos de asistentes desde Google Drive, les aplica el marco HERENCIA usando IA, y guarda los resultados en Drive.

## 🚀 Instalación

```bash
npm install
```

## 📋 Configuración

### 1. Google Drive API

**IMPORTANTE:** Para usar Google Drive API necesitas:

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un proyecto
3. Habilitar **Google Drive API**
4. Crear credenciales:
   - **Opción A:** API Key (más simple, solo lectura pública)
   - **Opción B:** OAuth 2.0 (recomendado, acceso completo)

### 2. Configurar `.env`

```env
GOOGLE_API_KEY=tu_api_key_aqui
INPUT_FOLDER_ID=1I6iCKHRXsuYRuhOgSrjvxd19vD0L9OCL
OUTPUT_FOLDER_ID=1So9b4ZN5_t6pUd4cYEOluhridLQsUV_O
```

### 3. Estructura de carpetas en Drive

**Carpeta de entrada** (`INPUT_FOLDER_ID`):
```
📁 Fotos Asistentes
  📁 2000/
    📷 foto1.jpg
    📷 foto2.jpg
  📁 2001/
    📷 foto1.jpg
```

**Carpeta de salida** (`OUTPUT_FOLDER_ID`):
```
📁 Resultados
  📁 2000/
    📷 HERENCIA_foto1.jpg
    📷 HERENCIA_foto2.jpg
  📁 2001/
    📷 HERENCIA_foto1.jpg
```

## 🎯 Uso

### Procesar TODOS los asistentes
```bash
npm run process-all
```

### Procesar un asistente específico
```bash
npm run process 2000
```

## 🔧 Desarrollo Local

### Generar una foto individual
```bash
npm start
```
Coloca tus imágenes en `input/` y ejecuta.

## 🌐 GitHub + Webhooks

### Opción 1: GitHub Actions (Recomendado)

Crea `.github/workflows/process-photos.yml`:

```yaml
name: Procesar Fotos HERENCIA

on:
  workflow_dispatch:
    inputs:
      codigo:
        description: 'Código del asistente (vacío = todos)'
        required: false
  schedule:
    - cron: '0 */6 * * *'  # Cada 6 horas

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Process photos
        env:
          GOOGLE_API_KEY: \${{ secrets.GOOGLE_API_KEY }}
        run: |
          if [ -z "\${{ github.event.inputs.codigo }}" ]; then
            npm run process-all
          else
            npm run process \${{ github.event.inputs.codigo }}
          fi
```

### Opción 2: Webhook + Servidor Express

```bash
npm install express
```

Crea `server.js` para recibir webhooks.

## 📊 API Key vs OAuth 2.0

| Característica | API Key | OAuth 2.0 |
|----------------|---------|-----------|
| Configuración  | Simple  | Compleja  |
| Permisos       | Limitados | Completos |
| Archivos       | Solo públicos | Privados también |
| Recomendado    | Testing | Producción |

## ⚠️ Notas Importantes

1. **Permisos de Drive:** Las carpetas deben ser accesibles con tu API Key o cuenta OAuth
2. **Límites:** Google Drive API tiene límites de uso
3. **Marco HERENCIA:** Debe estar en `input/MARCO.jpg`

## 🔐 Seguridad

- Nunca subas `.env` a GitHub
- Usa GitHub Secrets para las API Keys
- Configura permisos mínimos necesarios en Drive

## 📞 Comandos Disponibles

```bash
npm start           # Procesar una foto local
npm run process-all # Procesar todos los asistentes de Drive
npm run process 2000 # Procesar asistente específico
```
