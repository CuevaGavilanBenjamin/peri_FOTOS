import sharp from 'sharp';

async function analyzeFrame() {
  console.log('🔍 Analizando marco HERENCIA...\n');
  
  const image = sharp('./input/MARCO.jpg');
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  console.log(`📐 Dimensiones: ${info.width}x${info.height}`);
  
  // Detectar borde del marco blanco (buscando el cambio de color rojo a blanco)
  let topWhite = 0;
  let bottomWhite = info.height;
  let leftWhite = 0;
  let rightWhite = info.width;
  
  // Buscar desde arriba el primer píxel blanco
  for (let y = 0; y < info.height; y++) {
    for (let x = info.width / 2; x < info.width / 2 + 10; x++) {
      const idx = (y * info.width + Math.floor(x)) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Si encuentra un píxel blanco (o muy claro)
      if (r > 200 && g > 200 && b > 200) {
        topWhite = y;
        break;
      }
    }
    if (topWhite > 0) break;
  }
  
  // Buscar desde abajo hacia arriba
  for (let y = info.height - 1; y >= 0; y--) {
    for (let x = info.width / 2; x < info.width / 2 + 10; x++) {
      const idx = (y * info.width + Math.floor(x)) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (r > 200 && g > 200 && b > 200) {
        bottomWhite = y;
        break;
      }
    }
    if (bottomWhite < info.height) break;
  }
  
  // Buscar desde la izquierda
  for (let x = 0; x < info.width; x++) {
    for (let y = info.height / 2; y < info.height / 2 + 10; y++) {
      const idx = (Math.floor(y) * info.width + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (r > 200 && g > 200 && b > 200) {
        leftWhite = x;
        break;
      }
    }
    if (leftWhite > 0) break;
  }
  
  // Buscar desde la derecha
  for (let x = info.width - 1; x >= 0; x--) {
    for (let y = info.height / 2; y < info.height / 2 + 10; y++) {
      const idx = (Math.floor(y) * info.width + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (r > 200 && g > 200 && b > 200) {
        rightWhite = x;
        break;
      }
    }
    if (rightWhite < info.width) break;
  }
  
  console.log('📋 BORDES DEL MARCO BLANCO:');
  console.log(`   Top: ${topWhite}px`);
  console.log(`   Bottom: ${bottomWhite}px`);
  console.log(`   Left: ${leftWhite}px`);
  console.log(`   Right: ${rightWhite}px`);
  
  // Ahora buscar el área negra dentro del marco blanco
  let topBlack = topWhite;
  let bottomBlack = bottomWhite;
  let leftBlack = leftWhite;
  let rightBlack = rightWhite;
  
  // Buscar primer píxel negro desde el borde superior del marco blanco
  for (let y = topWhite; y < bottomWhite; y++) {
    for (let x = info.width / 2; x < info.width / 2 + 10; x++) {
      const idx = (y * info.width + Math.floor(x)) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Si encuentra un píxel negro
      if (r < 30 && g < 30 && b < 30) {
        topBlack = y;
        break;
      }
    }
    if (topBlack > topWhite) break;
  }
  
  // Buscar último píxel negro desde abajo
  for (let y = bottomWhite - 1; y >= topBlack; y--) {
    for (let x = info.width / 2; x < info.width / 2 + 10; x++) {
      const idx = (y * info.width + Math.floor(x)) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (r < 30 && g < 30 && b < 30) {
        bottomBlack = y;
        break;
      }
    }
    if (bottomBlack < bottomWhite) break;
  }
  
  // Buscar desde izquierda
  for (let x = leftWhite; x < rightWhite; x++) {
    for (let y = info.height / 2; y < info.height / 2 + 10; y++) {
      const idx = (Math.floor(y) * info.width + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (r < 30 && g < 30 && b < 30) {
        leftBlack = x;
        break;
      }
    }
    if (leftBlack > leftWhite) break;
  }
  
  // Buscar desde derecha
  for (let x = rightWhite - 1; x >= leftBlack; x--) {
    for (let y = info.height / 2; y < info.height / 2 + 10; y++) {
      const idx = (Math.floor(y) * info.width + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (r < 30 && g < 30 && b < 30) {
        rightBlack = x;
        break;
      }
    }
    if (rightBlack < rightWhite) break;
  }
  
  const blackWidth = rightBlack - leftBlack;
  const blackHeight = bottomBlack - topBlack;
  
  console.log('\n🖤 ÁREA NEGRA DETECTADA:');
  console.log(`   Top: ${topBlack}px`);
  console.log(`   Left: ${leftBlack}px`);
  console.log(`   Width: ${blackWidth}px`);
  console.log(`   Height: ${blackHeight}px`);
  
  console.log('\n📝 USA ESTOS VALORES:');
  console.log(`const frameArea = {
  left: ${leftBlack},
  top: ${topBlack},
  width: ${blackWidth},
  height: ${blackHeight}
};`);
}

analyzeFrame().catch(console.error);
