import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Inicializar Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Convierte una imagen a base64
 */
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  return {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType
    }
  };
}

/**
 * Genera la imagen combinada usando Gemini 2.5 Flash Image (Nano Banana)
 */
async function generateHerenciaPhoto(personPhotoPath, templatePath, outputPath = 'output/resultado.png') {
  try {
    console.log('🚀 Generando con Gemini 2.5 Flash Image (Nano Banana)...');
    
    // Leer dimensiones del marco
    const sharp = (await import('sharp')).default;
    const templateMeta = await sharp(templatePath).metadata();
    const aspectRatio = `${templateMeta.width}:${templateMeta.height}`;
    
    console.log(`📐 Dimensiones del marco: ${templateMeta.width}x${templateMeta.height} (ratio: ${aspectRatio})`);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseModalities: ["image"],
      }
    });
    
    const template = imageToBase64(templatePath);
    const personPhoto = imageToBase64(personPhotoPath);
    
    const prompt = `Inserta la segunda imagen dentro del marco negro de la primera imagen. Asegúrate de que la imagen se vea completa dentro del marco, ajustando su tamaño y perspectiva para que encaje de la mejor manera posible y parezca natural.

REGLAS CRÍTICAS:
1. La imagen de salida DEBE tener EXACTAMENTE las mismas dimensiones que el marco de entrada (${templateMeta.width}x${templateMeta.height} píxeles).
2. NO cambies el tamaño del marco blanco tipo Polaroid.
3. NO expandes ni recortes el fondo rojo/vino.
4. TODOS los logos de patrocinadores en la parte inferior DEBEN estar completos y visibles.
5. El texto "HERENCIA" debe mantenerse intacto.
6. SOLO modifica el área negra central insertando la foto de la persona.

El resultado debe ser una imagen de ${templateMeta.width}x${templateMeta.height} píxeles con el marco original completo y la foto insertada en el área negra.`;

    console.log('🤖 Enviando a Nano Banana...');
    
    const result = await model.generateContent([
      prompt,
      template,
      personPhoto
    ]);
    
    const response = await result.response;
    
    // La respuesta debería contener la imagen generada
    if (response.candidates && response.candidates[0]?.content?.parts) {
      const parts = response.candidates[0].content.parts;
      
      // Buscar la parte que contiene la imagen
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(outputPath, buffer);
          console.log(`✅ Imagen guardada en: ${outputPath}`);
          return { success: true, outputPath };
        }
      }
    }
    
    // Si no hay imagen en la respuesta, mostrar el texto
    const text = response.text();
    console.log('📥 Respuesta:', text);
    
    throw new Error('No se generó imagen en la respuesta');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Exportar funciones
export {
  generateHerenciaPhoto
};
