// Trama Service

/**
 * Generate bank payment format (trama) based on XML data.
 * @param {Object} xmlData - Parsed XML data.
 * @returns {string} - Generated trama as a plain text string.
 */
export const generateTrama = (xmlData) => {
  // Debugging log to inspect xmlData structure
  console.debug('Received xmlData:', xmlData);

  // Validate xmlData structure
  if (!xmlData || typeof xmlData !== 'object') {
    throw new Error('El formato de XML no es válido. Se esperaba un objeto JSON.');
  }

  if (!Array.isArray(xmlData.detalles)) {
    console.warn('Detalles no encontrados en xmlData. Se procederá con un array vacío.');
    xmlData.detalles = [];
  }

  // Extract necessary fields from XML data
  const encabezado = {
    tipoRegistro: 'H',
    claveServicio: xmlData.claveServicio || 'NE',
    emisora: xmlData.emisora || '000000',
    fechaProceso: xmlData.fechaProceso || '00000000',
    consecutivo: xmlData.consecutivo || '01',
    totalRegistros: xmlData.totalRegistros || '0',
    importeTotal: xmlData.importeTotal || '0.00',
    cuentaCargo: xmlData.cuentaCargo || '0000000000',
    filler: ''.padEnd(59, ' '),
  };

  const detalles = xmlData.detalles.map((detalle, index) => {
    if (typeof detalle !== 'object') {
      console.warn(`Detalle inválido en posición ${index}. Se procederá con valores vacíos.`);
      detalle = {};
    }

    return {
      tipoRegistro: 'D',
      fechaAplicacion: detalle.fechaAplicacion || '00000000',
      numeroEmpleado: detalle.numeroEmpleado || '000000',
      referenciaServicio: detalle.referenciaServicio || ''.padEnd(40, ' '),
      importe: detalle.importe || '0.00',
      bancoReceptor: detalle.bancoReceptor || '000',
      numeroCuenta: detalle.numeroCuenta || '0000000000',
      tipoMovimiento: detalle.tipoMovimiento || '0',
      accion: detalle.accion || '0',
      ivaOperacion: detalle.ivaOperacion || '0',
      filler: ''.padEnd(8, ' '),
    };
  });

  // Format encabezado
  const encabezadoTrama = Object.values(encabezado).join('');

  // Format detalles
  const detallesTrama = detalles.map((detalle) => Object.values(detalle).join('')).join('\n');

  // Combine encabezado and detalles
  return `${encabezadoTrama}\n${detallesTrama}`;
};