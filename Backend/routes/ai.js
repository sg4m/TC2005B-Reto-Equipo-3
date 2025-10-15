const express = require('express');
const geminiService = require('../services/geminiService');
const router = express.Router();

// Test Gemini AI connection
router.post('/test-gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt es requerido para la prueba' 
      });
    }

    const result = await geminiService.generateBusinessRulesFromPrompt(prompt);
    
    res.json({
      message: 'Gemini AI funcionando correctamente',
      prompt: prompt,
      ai_response: result
    });

  } catch (error) {
    console.error('Error testing Gemini:', error);
    res.status(500).json({ 
      error: 'Error con Gemini AI: ' + error.message 
    });
  }
});

// Test Gemini API connectivity
router.get('/test-connection', async (req, res) => {
  try {
    const result = await geminiService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

// Continue conversation with Gemini
router.post('/continue-conversation', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Mensaje es requerido para continuar la conversación' 
      });
    }

    const result = await geminiService.continueConversation(message, conversationHistory || []);
    
    res.json({
      success: true,
      conversation: result
    });

  } catch (error) {
    console.error('Error in conversation:', error);
    res.status(500).json({ 
      error: 'Error en la conversación: ' + error.message 
    });
  }
});

// Process payment file with ISO 20022 PAIN.001 mapping rules
router.post('/process-payment-mapping', async (req, res) => {
  try {
    const { fileContent, fileType, fileName } = req.body;
    
    if (!fileContent) {
      return res.status(400).json({ 
        error: 'Contenido del archivo es requerido' 
      });
    }

    if (!fileType || !['txt', 'xml'].includes(fileType.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Tipo de archivo debe ser TXT o XML' 
      });
    }

    console.log(`Procesando archivo de pago: ${fileName || 'sin nombre'} (${fileType})`);
    
    const result = await geminiService.processPaymentMapping(fileContent, fileType);
    
    res.json({
      success: true,
      fileName: fileName || 'archivo_pago',
      fileType: fileType,
      mapping_result: result
    });

  } catch (error) {
    console.error('Error processing payment mapping:', error);
    res.status(500).json({ 
      error: 'Error al procesar mapeo de pagos: ' + error.message 
    });
  }
});

// Get Gemini model info
router.get('/gemini-info', (req, res) => {
  res.json({
    message: 'Información de Gemini AI',
    model: 'gemini-2.5-flash',
    capabilities: [
      'Generación de reglas de negocio desde texto',
      'Análisis de datos CSV',
      'Refinamiento de reglas existentes',
      'Conversación iterativa para refinar requerimientos',
      'Procesamiento de archivos de pago con mapeo ISO 20022 PAIN.001'
    ],
    api_key_configured: !!process.env.GEMINI_API_KEY
  });
});

module.exports = router;