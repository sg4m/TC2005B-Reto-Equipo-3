import { useState, useCallback } from 'react';
import { rulesService } from '../services/api';

export const useBusinessRules = (usuarioId = 1) => { // Default user ID for demo
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState(null);
  const [movements, setMovements] = useState([]);

  // Generate new business rule
  const generateRule = useCallback(async (data) => {
    setIsGenerating(true);
    setError(null);
    setCurrentRule(null);
    setAiResponse(null);

    try {
      const ruleData = {
        usuario_id: usuarioId,
        descripcion: data.descripcion || data.prompt_texto,
        prompt_texto: data.prompt_texto,
        archivo: data.archivo
      };

      const result = await rulesService.generateRule(ruleData);
      
      setCurrentRule(result.regla);
      setAiResponse(result.ai_response);
      
      // Refresh movements after generating new rule
      await loadMovements();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [usuarioId]);

  // Load user movements
  const loadMovements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await rulesService.getUserMovements(usuarioId);
      setMovements(result.movements || []);
      return result;
    } catch (err) {
      setError(err.message);
      setMovements([]);
    } finally {
      setIsLoading(false);
    }
  }, [usuarioId]);

  // Refine existing rule
  const refineRule = useCallback(async (ruleId, feedback) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await rulesService.refineRule(ruleId, feedback);
      setCurrentRule(result.regla);
      setAiResponse(result.refined_response);
      
      // Refresh movements
      await loadMovements();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [loadMovements]);

  // Update rule status
  const updateRuleStatus = useCallback(async (ruleId, estado) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await rulesService.updateRuleStatus(ruleId, estado);
      
      // Update current rule if it's the same
      if (currentRule && currentRule.id === ruleId) {
        setCurrentRule(result.regla);
      }
      
      // Refresh movements
      await loadMovements();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentRule, loadMovements]);

  // Clear current state
  const clearState = useCallback(() => {
    setCurrentRule(null);
    setAiResponse(null);
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    isGenerating,
    currentRule,
    aiResponse,
    error,
    movements,
    
    // Actions
    generateRule,
    loadMovements,
    refineRule,
    updateRuleStatus,
    clearState,
  };
};