# ⚡ Inicio Rápido - GitHub Actions

## 1️⃣ Configurar Secrets (una sola vez)

Ve a: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Valor |
|-------------|-------|
| `GOOGLE_CREDENTIALS` | Contenido completo de `credentials.json` |
| `GOOGLE_TOKEN` | Contenido completo de `token.json` |
| `INPUT_FOLDER_ID` | ID de la carpeta de entrada en Drive |
| `OUTPUT_FOLDER_ID` | ID de la carpeta de salida en Drive |

## 2️⃣ Subir marco al repositorio

```bash
# Asegúrate de tener MARCO.jpg en input/
git add input/MARCO.jpg
git commit -m "📸 Agregar marco HERENCIA"
git push
```

## 3️⃣ Activar el workflow

El workflow ya está configurado en `.github/workflows/process-photos.yml`

- ✅ Se ejecuta **cada 2 minutos** automáticamente
- ✅ Puedes ejecutarlo **manualmente** desde la pestaña Actions

## 4️⃣ Ejecutar manualmente

1. Ve a la pestaña **Actions**
2. Selecciona **Procesar Fotos HERENCIA**
3. Click en **Run workflow**
4. Click en **Run workflow** (verde)

## 5️⃣ Ver resultados

1. Click en la ejecución que acaba de iniciar
2. Click en **process-photos**
3. Expande los pasos para ver logs

## 🎯 Flujo de trabajo

```
Cada 2 minutos:
  ↓
🔍 Buscar fotos nuevas en Drive (carpetas 2000, 2001, etc.)
  ↓
📥 Descargar fotos
  ↓
🎨 Procesar con marco HERENCIA
  ↓
📤 Subir HERENCIA_foto.jpg
  ↓
📤 Subir ORIGINAL_foto.jpg
  ↓
🗑️ Eliminar fotos de carpeta de entrada
  ↓
✅ Listo! Esperar 2 minutos...
```

## ⚠️ Importante

- El marco `MARCO.jpg` debe estar en `input/` del repositorio
- O configurar `MARCO_URL` como secret apuntando a una URL pública
- Los archivos `credentials.json` y `token.json` **NUNCA** se suben al repo (están en `.gitignore`)

## 🔄 Actualizar token expirado

Si el token expira:

1. Ejecuta localmente: `npm run process-all`
2. Copia el nuevo `token.json` generado
3. Actualiza el secret `GOOGLE_TOKEN` en GitHub

## 📊 Monitoreo

GitHub Actions tiene límites:
- **Repos públicos**: Ilimitado
- **Repos privados**: 2000 minutos/mes (gratis)

Con ejecución cada 2 minutos = ~720 ejecuciones/día = ~21,600 ejecuciones/mes

Cada ejecución toma ~30-60 segundos = ~500-1000 minutos/mes ✅
