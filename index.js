import { generateHerenciaPhoto } from './imageGenerator.js';
import { composePhotoInFrame } from './imageComposer.js';
import { hybridPhotoProcess } from './hybridProcessor.js';
import { smartCompose } from './smartComposer.js';
import fs from 'fs';
import path from 'path';

// Crear carpeta de salida si no existe
if (!fs.existsSync('output')) {
  fs.mkdirSync('output');
}

// Función para buscar archivos en la carpeta input
function findFiles() {
  const inputDir = './input';
  const files = fs.readdirSync(inputDir);
  
  let personPhoto = null;
  let template = null;
  
  for (const file of files) {
    const filePath = path.join(inputDir, file);
    const ext = path.extname(file).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      if (file.toLowerCase().includes('marco') || file.toLowerCase().includes('herencia') || file.toLowerCase().includes('template')) {
        template = filePath;
        console.log(`📋 Marco encontrado: ${file}`);
      } else {
        personPhoto = filePath;
        console.log(`👤 Foto encontrada: ${file}`);
      }
    }
  }
  
  return { personPhoto, template };
}

async function main() {
  console.log('🎯 Generador de Fotos HERENCIA');
  console.log('================================\n');
  
  // Buscar archivos automáticamente
  const { personPhoto, template } = findFiles();
  
  if (!personPhoto) {
    console.error('❌ No se encuentra la foto de la persona en la carpeta "input"');
    console.log('💡 Coloca tu foto en la carpeta "input/"');
    return;
  }
  
  if (!template) {
    console.error('❌ No se encuentra el marco HERENCIA en la carpeta "input"');
    console.log('💡 Coloca el marco con "marco" o "herencia" en el nombre');
    return;
  }
  
  console.log('');
  
  try {
    // Composición inteligente: Sharp garantiza marco, IA solo ajusta foto
    const timestamp = Date.now();
    const outputPath = `./output/herencia-${timestamp}.png`;
    
    const result = await smartCompose(
      personPhoto,
      template,
      outputPath
    );
    
    console.log('\n✨ ¡Proceso completado exitosamente!');
    console.log('📁 Revisa tu imagen en:', outputPath);
    
  } catch (error) {
    console.error('\n❌ Error en el proceso:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar
main();
