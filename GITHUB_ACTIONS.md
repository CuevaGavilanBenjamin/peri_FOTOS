# 🔧 Configuración de GitHub Actions

Este proyecto puede ejecutarse automáticamente cada 2 minutos usando GitHub Actions.

## 📋 Secrets necesarios

Debes configurar estos **Secrets** en GitHub:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click en **New repository secret**
4. Agrega los siguientes secrets:

### GOOGLE_CREDENTIALS
El contenido de tu archivo `credentials.json`:

```bash
cat credentials.json | pbcopy  # Mac
cat credentials.json | clip    # Windows
cat credentials.json           # Linux (copiar manualmente)
```

Pega todo el contenido JSON como secret.

### GOOGLE_TOKEN
El contenido de tu archivo `token.json` (después de autenticar la primera vez localmente):

```bash
cat token.json | pbcopy  # Mac
cat token.json | clip    # Windows
cat token.json           # Linux (copiar manualmente)
```

Pega todo el contenido JSON como secret.

### INPUT_FOLDER_ID
El ID de tu carpeta de entrada en Google Drive:

```
1I6iCKHRXsuYRuhOgSrjvxd19vD0L9OCL
```

### OUTPUT_FOLDER_ID
El ID de tu carpeta de salida en Google Drive:

```
1So9b4ZN5_t6pUd4cYEOluhridLQsUV_O
```

### MARCO_URL (Opcional)
Si quieres almacenar el marco en algún lugar público (ej: GitHub raw, Imgur, etc.):

```
https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/master/input/MARCO.jpg
```

**O** simplemente sube `MARCO.jpg` al repositorio en `input/MARCO.jpg`.

## 🚀 Cómo funciona

### Automático
- El workflow se ejecuta **cada 2 minutos**
- Busca nuevas fotos en las carpetas de Drive
- Procesa las que encuentra
- Las sube procesadas
- Elimina las originales de la carpeta de entrada

### Manual
1. Ve a tu repositorio en GitHub
2. Click en **Actions**
3. Selecciona **Procesar Fotos HERENCIA**
4. Click en **Run workflow** → **Run workflow**

## ⏱️ Cambiar frecuencia

Para cambiar la frecuencia de ejecución, edita `.github/workflows/process-photos.yml`:

```yaml
schedule:
  - cron: '*/2 * * * *'  # Cada 2 minutos
  # - cron: '*/5 * * * *'  # Cada 5 minutos
  # - cron: '*/10 * * * *'  # Cada 10 minutos
  # - cron: '0 * * * *'    # Cada hora
  # - cron: '0 */6 * * *'  # Cada 6 horas
```

## 🔒 Seguridad

- ✅ Los secrets están encriptados por GitHub
- ✅ `credentials.json` y `token.json` solo existen durante la ejecución
- ✅ Se eliminan automáticamente al terminar
- ✅ Nunca se suben al repositorio

## 🐛 Solución de problemas

### Error: "Invalid credentials"
- Verifica que copiaste correctamente el contenido de `credentials.json`
- No debe tener espacios extra ni saltos de línea adicionales

### Error: "Token expired"
- Genera un nuevo `token.json` localmente
- Actualiza el secret `GOOGLE_TOKEN` en GitHub

### El workflow no se ejecuta
- GitHub Actions puede tener un retraso de hasta 5 minutos
- Verifica que el repositorio sea público o tengas GitHub Actions habilitado
- Para repos privados: Settings → Actions → Allow all actions

## 📊 Ver logs

1. Ve a **Actions** en tu repositorio
2. Click en cualquier ejecución
3. Click en **process-photos**
4. Expande los pasos para ver los logs detallados
