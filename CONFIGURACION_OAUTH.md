# Configuración OAuth para Google Drive

Para que el procesamiento de Drive funcione, necesitas completar estos pasos en Google Cloud Console:

## Pasos para configurar OAuth:

### 1. Ve a Google Cloud Console
https://console.cloud.google.com/

### 2. Selecciona tu proyecto
El que usaste para crear `credentials.json`

### 3. Configura la pantalla de consentimiento OAuth
1. Ve a **APIs & Services** > **OAuth consent screen**
2. Elige **External** (o Internal si es workspace de tu organización)
3. Completa la información básica:
   - App name: `HERENCIA Photo Processor`
   - User support email: tu email
   - Developer contact email: tu email
4. **IMPORTANTE**: En "Scopes", agrega:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive`

### 4. Opción A: Agregar usuarios de prueba (Más rápido)
1. En **OAuth consent screen** > **Test users**
2. Click **ADD USERS**
3. Agrega tu email (el que usarás para autenticar)
4. Guarda

### 5. Opción B: Publicar la app (Para producción)
1. En **OAuth consent screen**
2. Click **PUBLISH APP**
3. Confirma la publicación
4. *Nota: Puede requerir verificación de Google si usas scopes sensibles*

## Probar la conexión

Una vez configurado, ejecuta:

```bash
npm run process 2000
```

Esto:
1. Abrirá un navegador para autenticar
2. Te pedirá permiso para acceder a Drive
3. Guardará el token en `token.json`
4. Procesará las fotos del asistente código 2000

## Procesar todos los asistentes

```bash
npm run process-all
```

## Estructura de Drive esperada:

**Carpeta de entrada** (ID: 1I6iCKHRXsuYRuhOgSrjvxd19vD0L9OCL):
```
📁 Carpeta principal
  📁 2000
    📷 foto1.jpg
    📷 foto2.jpg
  📁 2001
    📷 foto1.jpg
```

**Carpeta de salida** (ID: 1So9b4ZN5_t6pUd4cYEOluhridLQsUV_O):
```
📁 Carpeta resultados
  📁 2000
    🎨 HERENCIA_foto1.jpg
    🎨 HERENCIA_foto2.jpg
  📁 2001
    🎨 HERENCIA_foto1.jpg
```

## Solución de problemas

### Error: "Method doesn't allow unregistered callers"
- Falta agregar tu email como usuario de prueba (Paso 4A)
- O publicar la app (Paso 5)

### Error: "Access denied"
- Verifica que los scopes de Drive estén configurados
- Elimina `token.json` y vuelve a autenticar

### Error: "Invalid credentials"
- Verifica que `credentials.json` esté en el directorio raíz
- Descarga nuevamente las credenciales desde Cloud Console
