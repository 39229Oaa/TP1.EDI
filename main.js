/**
 * ARCHIVO: main.js
 * Módulo Orquestador (Punto de entrada).
 * Controla el ciclo de vida del ETL y el manejo global de errores.
 */

function ejecutarETL() {
  console.info("🚀 Iniciando proceso ETL (Arquitectura Modular)...");
  console.time("TiempoTotalETL"); 
  
  try {
    // === 1. EXTRACT ===
    console.time("Fase-Extract");
    const datosCrudos = extraerDatos_();
    console.timeEnd("Fase-Extract");
    
    if (!datosCrudos || datosCrudos.length <= CONFIG.origen.filaEncabezados) {
      console.warn("⚠️ Operación cancelada: No se encontraron datos suficientes en el origen.");
      return;
    }
    
    // === 2. TRANSFORM ===
    console.time("Fase-Transform");
    const datosTransformados = transformarDatos_(datosCrudos);
    console.timeEnd("Fase-Transform");
    
    // Comprobamos si el arreglo solo contiene el array de encabezados
    if (datosTransformados.length <= 1) { 
      console.warn("⚠️ Ningún registro cumplió con la regla de negocio. Abortando carga para no sobrescribir con un archivo vacío.");
      return;
    }
    
    // === 3. LOAD ===
    console.time("Fase-Load");
    cargarDatos_(datosTransformados);
    console.timeEnd("Fase-Load");
    
    console.info("✅ Proceso ETL completado con éxito.");
    
  } catch (error) {
    // Si la hoja no existe o la columna cambia de nombre y no se encuentra, 
    // el Error subirá hasta aquí y se registrará elegantemente sin romper silenciosamente.
    console.error("❌ ERROR CRÍTICO en la orquestación del ETL:", error.stack);
  } finally {
    console.timeEnd("TiempoTotalETL"); 
  }
}