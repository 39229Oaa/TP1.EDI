/**
 * ARCHIVO: Transform.gs
 * Módulo TRANSFORM (Fase 2 del ETL)
 * Contiene la lógica de mapeo estructural (Schema Mapping),
 * filtrado, limpieza y columnas calculadas.
 */

/**
 * Convierte un texto a formato título.
 * Ejemplo: " la matanza " -> "La Matanza"
 */
function formatearTitulo_(texto) {

  const palabrasMinusculas = ['de', 'del', 'la', 'las', 'los', 'y'];

  return String(texto || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(function(palabra, indice) {

      if (indice > 0 && palabrasMinusculas.includes(palabra)) {
        return palabra;
      }

      return palabra.charAt(0).toUpperCase() + palabra.slice(1);

    })
    .join(' ');
}

function transformarDatos_(datos) {

  console.info('-> [TRANSFORM] Iniciando motor de mapeo y limpieza...');

  const datosProcesados = [];
  const configMapeo = CONFIG.transformacion.mapeoColumnas;

  // 1. OBTENCIÓN Y SANITIZACIÓN DE ENCABEZADOS ORIGEN
  const indiceEncabezados = CONFIG.origen.filaEncabezados - 1;
  const encabezadosOriginales = datos[indiceEncabezados];

  if (!encabezadosOriginales) {
    throw new Error('No se encontraron encabezados en la fila configurada.');
  }

  const encabezadosSaneados = encabezadosOriginales.map(function(h) {
    return String(h).trim().toUpperCase();
  });

  // 2. CREACIÓN DEL MAPA DE ÍNDICES
  const mapaEstructural = configMapeo.map(function(colDef) {

    const variantesSaneadas = colDef.nombresOrigen.map(function(nombre) {
      return String(nombre).trim().toUpperCase();
    });

    const indiceEnOrigen = encabezadosSaneados.findIndex(function(encabezado) {
      return variantesSaneadas.includes(encabezado);
    });

    if (indiceEnOrigen === -1 && colDef.obligatorio) {

      throw new Error(
        "ESQUEMA INVÁLIDO: Falta columna requerida destino '" +
        colDef.nombreDestino +
        "'. Buscamos variantes: [" +
        colDef.nombresOrigen.join(', ') +
        ']'
      );
    }

    return {
      destino: colDef.nombreDestino,
      indiceOrigen: indiceEnOrigen
    };

  });

  // 3. CONSTRUCCIÓN DE NUEVOS ENCABEZADOS
  const nuevosEncabezados = mapaEstructural.map(function(mapa) {
    return mapa.destino;
  });

  nuevosEncabezados.push('TOTAL ALUMNOS');
  nuevosEncabezados.push('FECHA DE PROCESAMIENTO');

  datosProcesados.push(nuevosEncabezados);

  // Índices necesarios
  const indiceSector = nuevosEncabezados.indexOf('SECTOR');
  const indiceAmbito = nuevosEncabezados.indexOf('ÁMBITO GEOGRÁFICO');
  const indiceMunicipio = nuevosEncabezados.indexOf('MUNICIPIO');
  const indiceVarones = nuevosEncabezados.indexOf('CANTIDAD VARONES');
  const indiceMujeres = nuevosEncabezados.indexOf('CANTIDAD MUJERES');

  // 4. PROCESAMIENTO Y FILTRADO
  let registrosSuperaronFiltro = 0;

  for (let i = CONFIG.origen.filaEncabezados; i < datos.length; i++) {

    const filaOrigen = datos[i];

    if (!filaOrigen || filaOrigen.length === 0) {
      continue;
    }

    const filaTransformada = mapaEstructural.map(function(mapa) {

      if (mapa.indiceOrigen === -1) {
        return '';
      }

      const valor = filaOrigen[mapa.indiceOrigen];

      return valor != null ? valor : '';

    });

    // LIMPIEZA DE MUNICIPIO
    if (indiceMunicipio !== -1) {

      filaTransformada[indiceMunicipio] =
        formatearTitulo_(filaTransformada[indiceMunicipio]);
    }

    // FILTRO COMPUESTO
    const sector = String(filaTransformada[indiceSector] || '')
      .trim()
      .toUpperCase();

    const ambito = String(filaTransformada[indiceAmbito] || '')
      .trim()
      .toUpperCase();

    const cumpleRegla =
      (sector === 'ESTATAL' ||
       sector === 'PÚBLICO' ||
       sector === 'PUBLICO') &&
      ambito === 'RURAL';

    if (cumpleRegla) {

      // Reemplazar vacíos por 0 y convertir a número
      filaTransformada[indiceVarones] =
        parseFloat(
          String(filaTransformada[indiceVarones] || '0')
            .trim()
            .replace(',', '.')
        ) || 0;

      filaTransformada[indiceMujeres] =
        parseFloat(
          String(filaTransformada[indiceMujeres] || '0')
            .trim()
            .replace(',', '.')
        ) || 0;

      // Cálculo de TOTAL ALUMNOS
      const totalAlumnos =
        filaTransformada[indiceVarones] +
        filaTransformada[indiceMujeres];

      filaTransformada.push(totalAlumnos);

      // Auditoría de fila
      filaTransformada.push(new Date());

      datosProcesados.push(filaTransformada);

      registrosSuperaronFiltro++;
    }
  }

  console.info(
    '-> [TRANSFORM] Registros finales procesados: ' +
    registrosSuperaronFiltro
  );

  return datosProcesados;
}