import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Procesa imagen con enfoque híbrido: IA inserta + Sharp valida
 * 1. IA inserta la foto en el marco de forma inteligente
 * 2. Sharp verifica y ajusta si es necesario
 * 3. Sharp garantiza dimensiones exactas del marco original
 */
export async function hybridPhotoProcess(personPhotoPath, templatePath, outputPath = 'output/resultado.png') {
  try {
    console.log('🔄 Procesamiento híbrido: IA (composición) + Sharp (validación)...');
    
    // PASO 1: Leer dimensiones del marco
    const templateMeta = await sharp(templatePath).metadata();
    console.log(`📐 Marco original: ${templateMeta.width}x${templateMeta.height}`);
    
    // PASO 2: Usar IA para insertar la foto de forma inteligente
    console.log('🤖 IA insertando foto en el marco...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        temperature: 0.1,  // MUY bajo para máxima consistencia y preservación del marco
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseModalities: ["image"],
      }
    });
    
    const template = fs.readFileSync(templatePath).toString('base64');
    const personPhoto = fs.readFileSync(personPhotoPath).toString('base64');
    
    const prompt = `Inserta la segunda imagen dentro del área negra del marco Polaroid (primera imagen).

REGLAS ABSOLUTAS - NO NEGOCIABLES:
1. El resultado DEBE ser EXACTAMENTE ${templateMeta.width}x${templateMeta.height} píxeles
2. PRESERVA COMPLETAMENTE el marco original:
   - Borde blanco tipo Polaroid: INTACTO
   - Texto "HERENCIA": INTACTO
   - TODOS los logos de patrocinadores en la parte inferior: COMPLETAMENTE VISIBLES (All Skin, Money House, ULIKE, PERI, Polystel, BQP, NIMPHA, EPSON, OmegaLife, UNI, fix, etc.)
   - Fondo rojo/vino: MISMO TAMAÑO
3. SOLO modifica el área negra rectangular del centro
4. Para el tamaño de la foto dentro del área negra:
   - Fotos verticales: llenar el alto del área negra
   - Fotos horizontales/anchas: llenar el ancho pero DEJAR espacio negro arriba/abajo si es necesario
   - CENTRA la foto perfectamente
   - Mejor dejar un poco de espacio negro que cortar los logos de abajo
5. VERIFICA que la imagen final tenga TODOS los logos visibles en la parte inferior

CRÍTICO: Si los logos no están completos, la imagen es INVÁLIDA.
Devuelve una imagen de exactamente ${templateMeta.width}x${templateMeta.height} píxeles con TODOS los logos visibles.`;
    
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: template
        }
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: personPhoto
        }
      },
      { text: prompt }
    ]);
    
    const response = await result.response;
    
    // PASO 3: Extraer imagen generada por IA
    console.log('📥 Extrayendo imagen generada...');
    
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('IA no generó ninguna imagen');
    }
    
    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new Error('Respuesta de IA sin contenido');
    }
    
    let imageData = null;
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
        imageData = part.inlineData.data;
        break;
      }
    }
    
    if (!imageData) {
      throw new Error('No se encontró imagen en la respuesta de IA');
    }
    
    const imageBuffer = Buffer.from(imageData, 'base64');
    
    // PASO 4: Validar con Sharp y ajustar si es necesario
    console.log('✅ Validando dimensiones con Sharp...');
    const aiImage = sharp(imageBuffer);
    const aiMeta = await aiImage.metadata();
    
    console.log(`   IA generó: ${aiMeta.width}x${aiMeta.height}`);
    
    // Si la IA generó dimensiones incorrectas, forzar el tamaño correcto
    if (aiMeta.width !== templateMeta.width || aiMeta.height !== templateMeta.height) {
      console.log(`⚠️  Ajustando a dimensiones correctas: ${templateMeta.width}x${templateMeta.height}`);
      await aiImage
        .resize(templateMeta.width, templateMeta.height, {
          fit: 'cover',
          position: 'center'
        })
        .toFile(outputPath);
    } else {
      console.log('✅ Dimensiones correctas, guardando...');
      await aiImage.toFile(outputPath);
    }
    
    console.log(`🎉 Imagen final guardada: ${outputPath}`);
    console.log(`   Dimensiones: ${templateMeta.width}x${templateMeta.height}`);
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error en procesamiento híbrido:', error);
    throw error;
  }
}
