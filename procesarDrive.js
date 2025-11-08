import { procesarTodosLosAsistentes, procesarUnAsistente } from './procesador.js';

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);

async function main() {
  if (args.length === 0) {
    // Sin argumentos: procesar todos los asistentes
    await procesarTodosLosAsistentes();
  } else {
    // Con argumento: procesar un asistente específico
    const codigo = args[0];
    await procesarUnAsistente(codigo);
  }
}

main();
