import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { authenticate } from '@google-cloud/local-auth';

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Lee las credenciales guardadas previamente
 */
async function loadSavedCredentials() {
  try {
    const content = fs.readFileSync(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Guarda las credenciales para usarlas después
 */
async function saveCredentials(client) {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  fs.writeFileSync(TOKEN_PATH, payload);
}

/**
 * Autentica con Google Drive
 */
async function authorize() {
  let client = await loadSavedCredentials();
  if (client) {
    return client;
  }
  
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  
  if (client.credentials) {
    await saveCredentials(client);
  }
  
  return client;
}

/**
 * Servicio para trabajar con Google Drive usando OAuth 2.0
 */
class DriveService {
  constructor() {
    this.authClient = null;
    this.drive = null;
  }

  /**
   * Inicializa la autenticación
   */
  async authenticate() {
    console.log('🔐 Autenticando con Google Drive...');
    this.authClient = await authorize();
    this.drive = google.drive({ version: 'v3', auth: this.authClient });
    console.log('✅ Autenticación exitosa\n');
  }

  /**
   * Lista las carpetas (códigos de asistentes) dentro de una carpeta
   */
  async listFolders(parentFolderId) {
    try {
      console.log(`📂 Listando carpetas en: ${parentFolderId}`);
      
      const response = await this.drive.files.list({
        q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        orderBy: 'name'
      });

      const folders = response.data.files || [];
      console.log(`✅ Encontradas ${folders.length} carpetas`);
      
      return folders;
      
    } catch (error) {
      console.error('❌ Error al listar carpetas:', error.message);
      throw error;
    }
  }

  /**
   * Lista las imágenes dentro de una carpeta
   */
  async listImages(folderId) {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
        fields: 'files(id, name, mimeType)',
        orderBy: 'name'
      });

      const images = response.data.files || [];
      console.log(`  📷 ${images.length} imágenes en carpeta`);
      
      return images;
      
    } catch (error) {
      console.error('❌ Error al listar imágenes:', error.message);
      throw error;
    }
  }

  /**
   * Descarga una imagen de Drive
   */
  async downloadImage(fileId, destinationPath) {
    try {
      const response = await this.drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      fs.writeFileSync(destinationPath, Buffer.from(response.data));
      console.log(`  ⬇️  Descargada: ${path.basename(destinationPath)}`);
      
      return destinationPath;
      
    } catch (error) {
      console.error('❌ Error al descargar imagen:', error.message);
      throw error;
    }
  }

  /**
   * Sube una imagen a Drive
   */
  async uploadImage(imagePath, fileName, parentFolderId) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [parentFolderId]
      };

      const media = {
        mimeType: 'image/png',
        body: fs.createReadStream(imagePath)
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink'
      });

      console.log(`  ⬆️  Subida: ${response.data.name}`);
      console.log(`  🔗 Link: ${response.data.webViewLink}`);
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Error al subir imagen:', error.message);
      throw error;
    }
  }

  /**
   * Busca o crea una carpeta por nombre
   */
  async findOrCreateFolder(folderName, parentFolderId) {
    try {
      // Buscar si ya existe
      const response = await this.drive.files.list({
        q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)'
      });

      if (response.data.files.length > 0) {
        console.log(`  📁 Carpeta encontrada: ${folderName}`);
        return response.data.files[0];
      }

      // Crear carpeta si no existe
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId]
      };

      const folder = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name'
      });

      console.log(`  ✨ Carpeta creada: ${folderName}`);
      return folder.data;
      
    } catch (error) {
      console.error('❌ Error al buscar/crear carpeta:', error.message);
      throw error;
    }
  }

  /**
   * Elimina un archivo de Drive (lo mueve a la papelera)
   */
  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Error al eliminar archivo:', error.message);
      throw error;
    }
  }
}

export default DriveService;
