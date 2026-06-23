
/**
 * ARCHIVO: Config.js
 * Módulo de configuración.
 * Centraliza las variables de entorno y los parámetros fijos del ETL.
 */

function obtenerConfiguracion() {
  const props = PropertiesService.getScriptProperties();

  return {
    origen: {
      spreadsheetId: props.getProperty('ORIGEN_ID') || '16OdhpEFEzMM-TVS5nuN0l6JGTWyeK5bX0NFoTbUcvr0',
      nombreHoja: 'DatosCrudos',
      filaEncabezados: 1
    },

    destino: {
      spreadsheetId: props.getProperty('DESTINO_ID') || '1APq6A3XyspzcYBpJc2ooOmxR1G-fCTlnTgf7TwvIUJc',
      nombreHoja: 'DatosProcesados'
    },

    transformacion: {
      // El filtro se implementa directamente en Transform.js
      filtro: {},

      // MOTOR DE MAPEO (Schema Mapping)
      mapeoColumnas: [
        {
          nombresOrigen: ['cod_provincia', 'provincia', 'prov', 'codigo_prov'],
          nombreDestino: 'CÓDIGO PROVINCIA',
          obligatorio: true
        },
        {
          nombresOrigen: ['departamento', 'depto', 'dpto', 'departamentos'],
          nombreDestino: 'MUNICIPIO',
          obligatorio: true
        },
        {
          nombresOrigen: ['sector', 'sec', 'estado', 'est'],
          nombreDestino: 'SECTOR',
          obligatorio: true
        },
        {
          nombresOrigen: ['ambito', 'amb', 'ámbito', 'zona'],
          nombreDestino: 'ÁMBITO GEOGRÁFICO',
          obligatorio: true
        },
        {
          nombresOrigen: ['ap02_Varón'],
          nombreDestino: 'CANTIDAD VARONES',
          obligatorio: true
        },
        {
          nombresOrigen: ['ap02_Mujer'],
          nombreDestino: 'CANTIDAD MUJERES',
          obligatorio: true
        }
      ]
    }
  };
}

const CONFIG = obtenerConfiguracion();