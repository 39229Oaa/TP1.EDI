/**
 * ARCHIVO: Extraccion.js
 * Módulo EXTRACT (Fase 1 del ETL)
 * Se encarga exclusivamente de la conexión a fuentes externas y recolección de datos brutos.
 */

/**
 * Conecta al archivo de origen y obtiene los datos.
 * @returns {Array<Array>} Matriz 2D con los datos del origen.
 */
function extraerDatos_() {
  console.info(`-> [EXTRACT] Conectando al ID origen: ${CONFIG.origen.spreadsheetId}`);
  
  const ssOrigen = SpreadsheetApp.openById(CONFIG.origen.spreadsheetId);
  const hojaOrigen = ssOrigen.getSheetByName(CONFIG.origen.nombreHoja);
  
  if (!hojaOrigen) {
    throw new Error(`Fallo de Extracción: No se encontró la hoja '${CONFIG.origen.nombreHoja}' en el documento origen.`);
  }
  
  // Extraemos los datos brutos de la hoja
  return hojaOrigen.getDataRange().getValues();
}