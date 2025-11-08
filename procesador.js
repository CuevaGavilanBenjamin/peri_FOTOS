import DriveService from './driveService.js';
import { smartCompose } from './smartComposer.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// IDs de las carpetas de Drive
const INPUT_FOLDER_ID = '1I6iCKHRXsuYRuhOgSrjvxd19vD0L9OCL';  // Carpeta con fotos de entrada
const OUTPUT_FOLDER_ID = '1So9b4ZN5_t6pUd4cYEOluhridLQsUV_O'; // Carpeta para resultados

// Rutas locales
const TEMP_DIR = './temp';
const MARCO_PATH = './input/MARCO.jpg'; // Tu marco HERENCIA

async function procesarAsistente(driveService, codigoAsistente, inputFolderId, outputFolderId) {
  console.log(`\n🎯 Procesando asistente: ${codigoAsistente}`);
  
  // Buscar carpeta del asistente en entrada
  const inputCarpetas = await driveService.listFolders(inputFolderId);
  const carpetaInput = inputCarpetas.find(f => f.name === codigoAsistente);
  
  if (!carpetaInput) {
    console.log(`  ⚠️  No se encontró carpeta para ${codigoAsistente}`);
    return;
  }

  // Listar imágenes del asistente
  const imagenes = await driveService.listImages(carpetaInput.id);
  
  if (imagenes.length === 0) {
    console.log(`  ⚠️  No hay imágenes para procesar`);
    return;
  }

  // Buscar o crear carpeta de salida para este asistente
  const carpetaOutput = await driveService.findOrCreateFolder(codigoAsistente, outputFolderId);

  // Procesar cada imagen
  for (const imagen of imagenes) {
    try {
      console.log(`\n  📸 Procesando: ${imagen.name}`);
      
      // Descargar imagen original
      const tempInput = path.join(TEMP_DIR, `input_${imagen.name}`);
      await driveService.downloadImage(imagen.id, tempInput);
      
      // Generar imagen con marco usando smartCompose
      const tempOutput = path.join(TEMP_DIR, `output_${imagen.name}`);
      await smartCompose(tempInput, MARCO_PATH, tempOutput);
      
      // Subir foto procesada con marco a Drive
      const outputFileName = `HERENCIA_${imagen.name}`;
      await driveService.uploadImage(tempOutput, outputFileName, carpetaOutput.id);
      console.log(`  ✅ Procesada: ${outputFileName}`);
      
      // Subir también la foto original a la carpeta de salida
      const originalFileName = `ORIGINAL_${imagen.name}`;
      await driveService.uploadImage(tempInput, originalFileName, carpetaOutput.id);
      console.log(`  📤 Original copiada: ${originalFileName}`);
      
      // Limpiar archivos temporales
      fs.unlinkSync(tempInput);
      fs.unlinkSync(tempOutput);
      
      console.log(`  ✅ Completado todo para: ${imagen.name}`);
      
    } catch (error) {
      console.error(`  ❌ Error procesando ${imagen.name}:`, error.message);
    }
  }
}

async function procesarTodosLosAsistentes() {
  console.log('🚀 Iniciando procesamiento masivo de asistentes\n');
  console.log('='.repeat(60));
  
  try {
    // Crear directorio temporal
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }

    // Verificar que exista el marco
    if (!fs.existsSync(MARCO_PATH)) {
      throw new Error(`No se encuentra el marco HERENCIA en: ${MARCO_PATH}`);
    }

    // Inicializar servicio de Drive y autenticar
    const driveService = new DriveService();
    await driveService.authenticate();

    // Listar todas las carpetas (códigos de asistentes) en la carpeta de entrada
    const carpetasAsistentes = await driveService.listFolders(INPUT_FOLDER_ID);
    
    console.log(`\n📊 Total de asistentes a procesar: ${carpetasAsistentes.length}\n`);
    console.log('='.repeat(60));

    // Procesar cada asistente
    for (const carpeta of carpetasAsistentes) {
      await procesarAsistente(
        driveService,
        carpeta.name,
        INPUT_FOLDER_ID,
        OUTPUT_FOLDER_ID
      );
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ ¡Procesamiento completado!');
    
  } catch (error) {
    console.error('\n❌ Error en procesamiento:', error.message);
    throw error;
  }
}

async function procesarUnAsistente(codigo) {
  console.log(`🚀 Procesando asistente específico: ${codigo}\n`);
  console.log('='.repeat(60));
  
  try {
    // Crear directorio temporal
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }

    // Verificar marco
    if (!fs.existsSync(MARCO_PATH)) {
      throw new Error(`No se encuentra el marco HERENCIA en: ${MARCO_PATH}`);
    }

    // Inicializar servicio y autenticar
    const driveService = new DriveService();
    await driveService.authenticate();

    // Procesar
    await procesarAsistente(
      driveService,
      codigo,
      INPUT_FOLDER_ID,
      OUTPUT_FOLDER_ID
    );

    console.log('\n' + '='.repeat(60));
    console.log('✨ ¡Completado!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

// Exportar funciones
export {
  procesarTodosLosAsistentes,
  procesarUnAsistente
};
