import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
  try {
    console.log('🔍 Verificando modelos disponibles con tu API key...\n');
    
    // Intentar diferentes modelos
    const modelsToTry = [
      'gemini-pro-vision',
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-flash-exp'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ ${modelName} - Disponible`);
      } catch (error) {
        console.log(`❌ ${modelName} - No disponible`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
