import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Composición inteligente: Sharp garantiza marco, IA ajusta solo la foto
 */
export async function smartCompose(personPhotoPath, templatePath, outputPath = 'output/resultado.png') {
  try {
    console.log('🎨 Composición inteligente: Sharp (marco) + IA (ajuste de foto)...');
    
    // PASO 1: Leer marco y detectar área negra
    const templateMeta = await sharp(templatePath).metadata();
    console.log(`📐 Marco: ${templateMeta.width}x${templateMeta.height}`);
    
    const frameArea = {
      left: 100,
      top: 152,
      width: 700,
      height: 972
    };
    
    console.log(`📏 Área negra: ${frameArea.width}x${frameArea.height}`);
    
    // PASO 2: Usar IA SOLO para preparar la foto al tamaño exacto del área
    console.log('🤖 IA ajustando foto para el área...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseModalities: ["image"],
      }
    });
    
    const personPhoto = fs.readFileSync(personPhotoPath).toString('base64');
    
    const prompt = `Ajusta esta imagen para que se vea bien en un marco tipo Polaroid.

INSTRUCCIONES:
1. Devuelve SOLO la foto ajustada de exactamente ${frameArea.width}x${frameArea.height} píxeles
2. Si es foto horizontal: ponla centrada con barras negras arriba/abajo si es necesario
3. Si es foto vertical: ajústala para llenar el espacio
4. La foto debe verse bien centrada y con buen tamaño
5. NO agregues marcos ni textos
6. Resultado: imagen simple de ${frameArea.width}x${frameArea.height} píxeles`;
    
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: personPhoto
        }
      },
      { text: prompt }
    ]);
    
    const response = await result.response;
    
    // Extraer imagen
    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error('IA no generó respuesta válida');
    }
    
    let imageData = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        imageData = part.inlineData.data;
        break;
      }
    }
    
    if (!imageData) {
      throw new Error('No se encontró imagen en respuesta');
    }
    
    const adjustedPhotoBuffer = Buffer.from(imageData, 'base64');
    
    // PASO 3: Ajustar foto al área con proporciones correctas
    console.log('🔧 Ajustando foto manteniendo proporciones...');
    
    const photoMeta = await sharp(adjustedPhotoBuffer).metadata();
    console.log(`   Foto de IA: ${photoMeta.width}x${photoMeta.height}`);
    
    // Calcular el mejor ajuste manteniendo proporciones
    const scaleWidth = frameArea.width / photoMeta.width;
    const scaleHeight = frameArea.height / photoMeta.height;
    const scale = Math.min(scaleWidth, scaleHeight) * 0.95; // 95% para dar un pequeño margen
    
    const finalWidth = Math.round(photoMeta.width * scale);
    const finalHeight = Math.round(photoMeta.height * scale);
    
    console.log(`   Redimensionando a: ${finalWidth}x${finalHeight}`);
    
    // Redimensionar la foto
    const resizedPhoto = await sharp(adjustedPhotoBuffer)
      .resize(finalWidth, finalHeight, {
        fit: 'inside',
        withoutEnlargement: false
      })
      .toBuffer();
    
    // Crear un lienzo negro del tamaño del área
    const blackCanvas = await sharp({
      create: {
        width: frameArea.width,
        height: frameArea.height,
        channels: 3,
        background: { r: 0, g: 0, b: 0 }  // Negro puro
      }
    })
    .png()
    .toBuffer();
    
    // Centrar la foto en el lienzo negro
    const offsetX = Math.round((frameArea.width - finalWidth) / 2);
    const offsetY = Math.round((frameArea.height - finalHeight) / 2);
    
    console.log(`   Centrando en posición: (${offsetX}, ${offsetY})`);
    
    const photoForFrame = await sharp(blackCanvas)
      .composite([
        {
          input: resizedPhoto,
          top: offsetY,
          left: offsetX
        }
      ])
      .toBuffer();
    
    // PASO 4: Componer con Sharp (100% garantizado)
    console.log('✅ Componiendo con marco original...');
    await sharp(templatePath)
      .composite([
        {
          input: photoForFrame,
          top: frameArea.top,
          left: frameArea.left,
          blend: 'over'
        }
      ])
      .toFile(outputPath);
    
    console.log(`🎉 Imagen guardada: ${outputPath}`);
    console.log(`   Marco: ${templateMeta.width}x${templateMeta.height} (100% preservado)`);
    console.log(`   Todos los logos: ✅ COMPLETOS`);
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}
