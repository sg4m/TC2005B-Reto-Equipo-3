import { useState, useCallback } from 'react';
import { aiService } from '../services/api';

export const useConversation = () => {
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [error, setError] = useState(null);

  // Start a new conversation
  const startConversation = useCallback(async (initialMessage) => {
    setIsProcessing(true);
    setError(null);
    setConversationHistory([]);
    setIsConversationActive(true);

    try {
      // Add user message to history
      const userMessage = {
        role: 'user',
        content: initialMessage,
        timestamp: new Date()
      };

      const result = await aiService.continueConversation(initialMessage, []);
      
      // Add AI response to history
      const aiMessage = {
        role: 'assistant',
        content: result.conversation.message,
        timestamp: new Date(),
        data: result.conversation
      };

      setConversationHistory([userMessage, aiMessage]);
      setCurrentResponse(result.conversation);
      
      return result.conversation;
    } catch (err) {
      setError(err.message);
      setIsConversationActive(false);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Continue existing conversation
  const continueConversation = useCallback(async (userMessage) => {
    if (!isConversationActive) {
      throw new Error('No hay conversación activa');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Add user message to history
      const newUserMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };

      const updatedHistory = [...conversationHistory, newUserMessage];

      const result = await aiService.continueConversation(userMessage, updatedHistory);
      
      // Add AI response to history
      const aiMessage = {
        role: 'assistant',
        content: result.conversation.message,
        timestamp: new Date(),
        data: result.conversation
      };

      const finalHistory = [...updatedHistory, aiMessage];
      setConversationHistory(finalHistory);
      setCurrentResponse(result.conversation);
      
      return result.conversation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [isConversationActive, conversationHistory]);

  // End conversation
  const endConversation = useCallback(() => {
    setIsConversationActive(false);
    setConversationHistory([]);
    setCurrentResponse(null);
    setError(null);
  }, []);

  // Reset conversation state
  const resetConversation = useCallback(() => {
    setIsConversationActive(false);
    setIsProcessing(false);
    setConversationHistory([]);
    setCurrentResponse(null);
    setError(null);
  }, []);

  // Check if ready to generate rule
  const isReadyToGenerate = currentResponse?.is_ready_to_generate || false;

  // Get conversation summary
  const getConversationSummary = useCallback(() => {
    if (!currentResponse) return null;
    
    return {
      summary: currentResponse.summary_so_far,
      confidence: currentResponse.confidence_level,
      missingInfo: currentResponse.missing_information || [],
      questions: currentResponse.questions || []
    };
  }, [currentResponse]);

  return {
    // State
    isConversationActive,
    isProcessing,
    conversationHistory,
    currentResponse,
    error,
    isReadyToGenerate,

    // Actions
    startConversation,
    continueConversation,
    endConversation,
    resetConversation,
    getConversationSummary,
  };
};