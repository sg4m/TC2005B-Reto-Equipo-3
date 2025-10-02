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

// Get Gemini model info
router.get('/gemini-info', (req, res) => {
  res.json({
    message: 'Información de Gemini AI',
    model: 'gemini-2.5-flash',
    capabilities: [
      'Generación de reglas de negocio desde texto',
      'Análisis de datos CSV',
      'Refinamiento de reglas existentes',
      'Conversación iterativa para refinar requerimientos'
    ],
    api_key_configured: !!process.env.GEMINI_API_KEY
  });
});

module.exports = router;