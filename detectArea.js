import { detectBlackArea } from './imageComposer.js';

async function main() {
  console.log('🔍 Detectando área negra del marco...\n');
  
  const area = await detectBlackArea('./input/MARCO.jpg');
  
  console.log('📐 Área negra detectada:');
  console.log(`   Left: ${area.left}px`);
  console.log(`   Top: ${area.top}px`);
  console.log(`   Width: ${area.width}px`);
  console.log(`   Height: ${area.height}px`);
  console.log('\n📋 Usa estos valores en imageComposer.js:');
  console.log(`const frameArea = {
  left: ${area.left},
  top: ${area.top},
  width: ${area.width},
  height: ${area.height}
};`);
}

main();
