import sharp from 'sharp';
import path from 'path';

/**
 * Compone una foto dentro del marco usando Sharp (determinista)
 * El marco NUNCA cambia, solo se inserta la foto en el área negra
 */
export async function composePhotoInFrame(personPhotoPath, templatePath, outputPath = 'output/resultado.png') {
  try {
    console.log('🎨 Componiendo imagen con Sharp (método determinista)...');
    
    // Leer el marco template
    const template = sharp(templatePath);
    const templateMeta = await template.metadata();
    
    console.log(`📐 Marco: ${templateMeta.width}x${templateMeta.height}`);
    
    // Definir el área donde va la foto (ajusta estos valores según tu marco)
    // Estos son valores aproximados - ajústalos midiendo tu MARCO.jpg
    const frameArea = {
      left: 85,      // Píxeles desde la izquierda
      top: 60,       // Píxeles desde arriba
      width: 730,    // Ancho del área negra
      height: 915    // Alto del área negra
    };
    
    console.log(`📏 Área de foto: ${frameArea.width}x${frameArea.height} en posición (${frameArea.left}, ${frameArea.top})`);
    
    // Procesar la foto de la persona: redimensionar para que quepa en el área
    const personPhoto = await sharp(personPhotoPath)
      .resize(frameArea.width, frameArea.height, {
        fit: 'cover',           // Cubre toda el área
        position: 'center'      // Centra la imagen
      })
      .toBuffer();
    
    // Componer: poner la foto sobre el marco
    const result = await template
      .composite([
        {
          input: personPhoto,
          top: frameArea.top,
          left: frameArea.left
        }
      ])
      .toFile(outputPath);
    
    console.log(`✅ Imagen compuesta guardada: ${outputPath}`);
    console.log(`   Dimensiones finales: ${result.width}x${result.height}`);
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error componiendo imagen:', error);
    throw error;
  }
}

/**
 * Detecta las coordenadas exactas del área negra en el marco
 * Útil para ajustar frameArea automáticamente
 */
export async function detectBlackArea(templatePath) {
  const template = sharp(templatePath);
  const { data, info } = await template
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // Buscar el rectángulo negro más grande
  // (Esto es un algoritmo simple - puede necesitar refinamiento)
  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Si el pixel es negro (o muy oscuro)
      if (r < 30 && g < 30 && b < 30) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
