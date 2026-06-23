/**
 * ARCHIVO: Load.js
 * Módulo LOAD (Fase 3 del ETL)
 * Se encarga de la escritura idempotente y por lotes hacia el destino final.
 */

/**
 * Conecta al archivo destino y escribe los datos mediante una transacción Bulk.
 * @param {Array<Array>} datos Datos transformados y filtrados.
 */
function cargarDatos_(datos) {

  console.info('-> [LOAD] Inyectando datos en ID destino: ' + CONFIG.destino.spreadsheetId);

  const ssDestino = SpreadsheetApp.openById(CONFIG.destino.spreadsheetId);
  const hojaDestino = ssDestino.getSheetByName(CONFIG.destino.nombreHoja);

  if (!hojaDestino) {
    throw new Error(
      "Fallo de Carga: No se encontró la hoja '" +
      CONFIG.destino.nombreHoja +
      "' en el documento destino."
    );
  }

  // Limpieza previa manteniendo el formato y diseño visual
  hojaDestino.clearContents();

  const numFilas = datos.length;
  const numColumnas = datos[0].length;

  // Inserción en un solo bloque (idempotente)
  const rangoDestino = hojaDestino.getRange(1, 1, numFilas, numColumnas);
  rangoDestino.setValues(datos);

  // Formato de la columna TOTAL ALUMNOS
  const indiceTotalAlumnos = datos[0].indexOf('TOTAL ALUMNOS') + 1;

  if (indiceTotalAlumnos > 0 && numFilas > 1) {
    hojaDestino
      .getRange(2, indiceTotalAlumnos, numFilas - 1, 1)
      .setNumberFormat('0');
  }

  // Formato de la columna FECHA DE PROCESAMIENTO
  const indiceFecha = datos[0].indexOf('FECHA DE PROCESAMIENTO') + 1;

  if (indiceFecha > 0 && numFilas > 1) {
    hojaDestino
      .getRange(2, indiceFecha, numFilas - 1, 1)
      .setNumberFormat('dd/mm/yyyy hh:mm:ss');
  }

  console.info(
    '-> [LOAD] Carga exitosa. Se escribieron ' +
    numFilas +
    ' filas y ' +
    numColumnas +
    ' columnas.'
  );
}