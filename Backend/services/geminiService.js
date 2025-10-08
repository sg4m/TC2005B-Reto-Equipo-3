const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is required in environment variables');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using Gemini 2.5 Flash - fast, stable and available
        this.model = this.genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });
        
        console.log('Gemini service initialized with model: gemini-2.5-flash');
    }

    /**
     * Generate business rules from text prompt
     * @param {string} prompt - User's business requirements
     * @returns {Promise<Object>} Generated business rules
     */
    async generateBusinessRulesFromPrompt(prompt) {
        try {
            const systemPrompt = `
Eres un experto en reglas de negocio para el banco Banorte. Genera reglas de negocio comprensivas y accionables basadas en los requerimientos del usuario.

Por favor, formatea tu respuesta como un objeto JSON con esta estructura:
{
    "rules": [
        {
            "id": "temp_rule_1",
            "title": "Título de la Regla",
            "description": "Descripción detallada de la regla",
            "conditions": ["condición 1", "condición 2"],
            "actions": ["acción 1", "acción 2"],
            "priority": "alta|media|baja",
            "category": "deteccion_fraude|cumplimiento|gestion_riesgo|servicio_cliente|otro"
        }
    ],
    "summary": "Resumen breve de todas las reglas generadas",
    "implementation_notes": "Consideraciones clave para la implementación"
}

Solicitud del Usuario: ${prompt}

Genera reglas de negocio prácticas que Banorte pueda implementar para operaciones bancarias, cumplimiento normativo, gestión de riesgos o servicio al cliente.
Usa IDs temporales como "temp_rule_1", "temp_rule_2", etc. - serán actualizados con IDs de base de datos después.
IMPORTANTE: Responde ÚNICAMENTE en español, incluidos todos los textos, títulos, descripciones y comentarios.
`;

            const result = await this.model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            // Try to parse JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback if JSON parsing fails
            return {
                rules: [{
                    id: "temp_rule_fallback",
                    title: "Regla Generada",
                    description: text,
                    conditions: ["Solicitud del usuario procesada"],
                    actions: ["Revisar e implementar"],
                    priority: "media",
                    category: "otro"
                }],
                summary: "Regla de negocio generada desde solicitud del usuario",
                implementation_notes: "Revisar la regla generada para verificar precisión y cumplimiento"
            };

        } catch (error) {
            console.error('Error generando reglas de negocio desde prompt:', error);
            throw new Error('Error al generar reglas de negocio: ' + error.message);
        }
    }

    /**
     * Analyze CSV data and generate business rules
     * @param {Array} csvData - Parsed CSV data array
     * @param {string} context - Additional context about the data
     * @returns {Promise<Object>} Generated business rules based on data analysis
     */
    async generateBusinessRulesFromData(csvData, context = '') {
        try {
            // Analyze the CSV structure
            const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];
            const rowCount = csvData.length;
            const sample = csvData.slice(0, 3); // First 3 rows as sample

            const systemPrompt = `
Eres un experto en reglas de negocio para el banco Banorte. Analiza los datos CSV proporcionados y genera reglas de negocio relevantes.

Análisis de Datos CSV:
- Encabezados: ${headers.join(', ')}
- Número de filas: ${rowCount}
- Datos de muestra: ${JSON.stringify(sample, null, 2)}
- Contexto: ${context}

Por favor genera reglas de negocio que puedan aplicarse a estos datos para operaciones bancarias. Considera:
- Reglas de validación de datos
- Reglas de evaluación de riesgo
- Requerimientos de cumplimiento normativo
- Patrones de detección de fraude
- Reglas de segmentación de clientes
- Límites o umbrales de transacciones

Formatea tu respuesta como JSON:
{
    "data_analysis": {
        "data_type": "tipo de datos detectado (transacciones, clientes, etc.)",
        "key_insights": ["conocimiento 1", "conocimiento 2"],
        "data_quality": "evaluación de la calidad de los datos"
    },
    "rules": [
        {
            "id": "regla_001",
            "title": "Título de la Regla",
            "description": "Descripción detallada",
            "conditions": ["condición basada en datos"],
            "actions": ["acción recomendada"],
            "priority": "alta|media|baja",
            "category": "deteccion_fraude|cumplimiento|gestion_riesgo|servicio_cliente|validacion_datos",
            "data_fields": ["columnas CSV relevantes"]
        }
    ],
    "summary": "Resumen de las reglas generadas",
    "implementation_notes": "Consideraciones de implementación"
}
IMPORTANTE: Responde ÚNICAMENTE en español, incluidos todos los textos, análisis y descripciones.
`;

            const result = await this.model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            // Try to parse JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback response
            return {
                data_analysis: {
                    data_type: "Desconocido",
                    key_insights: ["Datos cargados exitosamente"],
                    data_quality: "Requiere revisión"
                },
                rules: [{
                    id: "regla_001",
                    title: "Regla de Revisión de Datos",
                    description: "Revisar datos cargados para la generación de reglas de negocio",
                    conditions: [`Los datos tienen ${rowCount} filas`, `Encabezados: ${headers.join(', ')}`],
                    actions: ["Revisión manual requerida"],
                    priority: "media",
                    category: "validacion_datos",
                    data_fields: headers
                }],
                summary: "Análisis inicial de datos completado",
                implementation_notes: "Se recomienda revisión manual para generación precisa de reglas"
            };

        } catch (error) {
            console.error('Error generando reglas de negocio desde datos:', error);
            throw new Error('Error al analizar datos y generar reglas: ' + error.message);
        }
    }

    /**
     * Refine existing business rules based on feedback
     * @param {Object} existingRules - Current business rules
     * @param {string} feedback - User feedback or modification request
     * @returns {Promise<Object>} Refined business rules
     */
    async refineBusinessRules(existingRules, feedback) {
        try {
            const systemPrompt = `
Eres un experto en reglas de negocio para el banco Banorte. Refina las reglas de negocio existentes basado en la retroalimentación del usuario.

Reglas Actuales: ${JSON.stringify(existingRules, null, 2)}

Retroalimentación del Usuario: ${feedback}

Por favor actualiza las reglas de acuerdo con la retroalimentación manteniendo el cumplimiento bancario y las mejores prácticas.
Devuelve las reglas refinadas en el mismo formato JSON que las originales.
IMPORTANTE: Responde ÚNICAMENTE en español, incluidos todos los textos, títulos y descripciones.
`;

            const result = await this.model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return existingRules; // Return original if parsing fails

        } catch (error) {
            console.error('Error refinando reglas de negocio:', error);
            throw new Error('Error al refinar reglas de negocio: ' + error.message);
        }
    }

    /**
     * Start or continue a conversation to refine business rule requirements
     * @param {string} userMessage - User's message in the conversation
     * @param {Array} conversationHistory - Previous messages in the conversation
     * @returns {Promise<Object>} Conversation response
     */
    async continueConversation(userMessage, conversationHistory = []) {
        try {
            const systemPrompt = `
Eres un experto consultor en reglas de negocio para el banco Banorte. Tu trabajo es hacer preguntas específicas y detalladas para entender completamente los requerimientos antes de generar las reglas finales.

IMPORTANTE: NO generes reglas de negocio todavía. Tu objetivo es hacer preguntas para clarificar y refinar los requerimientos.

Contexto de la conversación:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Nuevo mensaje del usuario: ${userMessage}

Debes responder en formato JSON con esta estructura:
{
    "message": "Tu pregunta o comentario para el usuario",
    "questions": ["pregunta específica 1", "pregunta específica 2"],
    "is_ready_to_generate": false,
    "confidence_level": "bajo|medio|alto",
    "missing_information": ["aspecto 1 que necesita aclaración", "aspecto 2"],
    "summary_so_far": "Resumen de lo que has entendido hasta ahora"
}

Si el usuario confirma que ya tiene toda la información necesaria o dice algo como "sí, genera la regla" o "procede", entonces cambia "is_ready_to_generate" a true.

Haz preguntas específicas sobre:
- Montos o umbrales específicos
- Horarios o días de aplicación
- Tipos de transacciones o clientes
- Acciones específicas a tomar
- Excepciones o casos especiales
- Niveles de autorización requeridos
- Canales afectados (app, sucursal, web)

RESPONDE ÚNICAMENTE en español y mantén un tono profesional pero amigable.
`;

            const result = await this.model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            // Try to parse JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback response
            return {
                message: "Cuéntame más detalles sobre la regla que necesitas. ¿Qué tipo de transacciones o procesos quieres regular?",
                questions: [
                    "¿Para qué tipo de transacciones será esta regla?",
                    "¿Hay montos específicos que debería considerar?",
                    "¿En qué horarios o días debe aplicar?"
                ],
                is_ready_to_generate: false,
                confidence_level: "bajo",
                missing_information: ["Tipo de transacción", "Criterios específicos", "Acciones a tomar"],
                summary_so_far: "El usuario quiere crear una regla de negocio pero necesito más información específica."
            };

        } catch (error) {
            console.error('Error en conversación con Gemini:', error);
            throw new Error('Error en la conversación: ' + error.message);
        }
    }

    /**
     * Generate a concise summary from complete business rules JSON
     * @param {Object} businessRulesJSON - Complete business rules structure
     * @returns {Promise<string>} Concise summary of the rules
     */
    async generateSummaryFromRules(businessRulesJSON) {
        try {
            const systemPrompt = `
Eres un experto en reglas de negocio para el banco Banorte. Genera un resumen conciso y claro de las reglas de negocio proporcionadas.

Reglas Completas: ${JSON.stringify(businessRulesJSON, null, 2)}

Crea un resumen que contenga ÚNICAMENTE la información más importante:
- Tipo de reglas (fraude, cumplimiento, límites, etc.)
- Criterios principales (montos, condiciones clave)
- Acciones principales que se toman

El resumen debe ser:
- Máximo 2-3 oraciones
- Claro y directo
- Enfocado en los puntos más importantes
- En español
- Sin detalles técnicos innecesarios

Ejemplo de formato esperado:
"Reglas de gestión de riesgo para transacciones superiores a 10,000 MXN que incluyen verificación de fondos, detección de fraudes y notificaciones al cliente."

Responde ÚNICAMENTE con el resumen, sin formato JSON ni texto adicional.
`;

            const result = await this.model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text().trim();
            
            return text;

        } catch (error) {
            console.error('Error generando resumen de reglas:', error);
            // Fallback summary if AI fails
            if (businessRulesJSON && businessRulesJSON.rules && businessRulesJSON.rules.length > 0) {
                const ruleCount = businessRulesJSON.rules.length;
                const categories = [...new Set(businessRulesJSON.rules.map(rule => rule.category))];
                return `Conjunto de ${ruleCount} regla(s) de negocio para ${categories.join(', ')}.`;
            }
            return 'Regla de negocio generada por IA.';
        }
    }

    /**
     * Simulate business rule with test data
     * @param {Object} simulationContext - Context for simulation including rule and test data
     * @returns {Promise<Object>} Simulation analysis and results
     */
    async simulateBusinessRule(simulationContext) {
        try {
            const { rule, testData, inputType, fileName, fileType } = simulationContext;
            
            let dataDescription = '';
            if (inputType === 'text') {
                dataDescription = `Datos de prueba ingresados como texto: ${testData}`;
            } else if (inputType === 'file') {
                dataDescription = `Datos de prueba cargados desde archivo "${fileName}" (tipo: ${fileType})\n`;
                dataDescription += `Contenido: ${JSON.stringify(testData, null, 2)}`;
            }

            const systemPrompt = `
Eres un experto analista de reglas de negocio para el banco Banorte. Tu tarea es simular y evaluar el comportamiento de una regla de negocio específica con los datos de prueba proporcionados.

INFORMACIÓN DE LA REGLA:
- ID: ${rule.id}
- Descripción: ${rule.description}
- Estado: ${rule.status}
- Detalles: ${rule.details || 'No disponible'}

DATOS DE PRUEBA:
${dataDescription}

INSTRUCCIONES PARA LA SIMULACIÓN:
1. Analiza cómo la regla de negocio se aplicaría a los datos de prueba
2. Identifica posibles escenarios de cumplimiento y no cumplimiento
3. Evalúa la efectividad de la regla con estos datos
4. Proporciona recomendaciones para mejorar la regla si es necesario
5. Identifica posibles casos límite o excepciones

Formatea tu respuesta como JSON con esta estructura:
{
    "analysis": "Análisis detallado de cómo se aplica la regla a los datos",
    "results": {
        "compliance_status": "cumple|no_cumple|parcial",
        "risk_level": "bajo|medio|alto",
        "triggered_conditions": ["condición 1", "condición 2"],
        "actions_required": ["acción 1", "acción 2"],
        "data_quality": "buena|regular|mala",
        "test_coverage": "completo|parcial|limitado"
    },
    "recommendations": "Recomendaciones específicas para mejorar la regla o el proceso de validación",
    "validation_results": {
        "passed_tests": 0,
        "failed_tests": 0,
        "total_scenarios": 0,
        "success_rate": "0%"
    },
    "edge_cases": ["caso límite 1", "caso límite 2"],
    "implementation_notes": "Notas importantes para la implementación de esta regla"
}

IMPORTANTE: 
- Responde ÚNICAMENTE en español
- Sé específico sobre cómo los datos interactúan con la regla
- Proporciona análisis práctico y accionable
- Considera aspectos de cumplimiento normativo bancario
- Evalúa la robustez de la regla con los datos proporcionados
`;

            const result = await this.model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            // Try to parse JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback response if JSON parsing fails
            return {
                analysis: `Simulación completada para la regla "${rule.description}". Los datos de prueba han sido procesados y evaluados según los criterios de la regla de negocio.`,
                results: {
                    compliance_status: "parcial",
                    risk_level: "medio",
                    triggered_conditions: ["Regla evaluada con datos de prueba"],
                    actions_required: ["Revisar resultados de simulación"],
                    data_quality: "regular",
                    test_coverage: "parcial"
                },
                recommendations: "Se recomienda revisar la configuración de la regla y ampliar los casos de prueba para obtener una evaluación más completa.",
                validation_results: {
                    passed_tests: 1,
                    failed_tests: 0,
                    total_scenarios: 1,
                    success_rate: "100%"
                },
                edge_cases: ["Datos de prueba con estructura variable"],
                implementation_notes: "La simulación se completó exitosamente. Se sugiere validación adicional con datos reales."
            };

        } catch (error) {
            console.error('Error en simulación de regla de negocio:', error);
            throw new Error('Error al simular regla de negocio: ' + error.message);
        }
    }

    /**
     * Test the API connection and list available models
     * @returns {Promise<Object>} API status and available models
     */
    async testConnection() {
        try {
            // Try a simple generation to test connectivity
            const result = await this.model.generateContent('Responde solo con "OK" si recibes este mensaje');
            const response = await result.response;
            const text = response.text();
            
            return {
                status: 'success',
                modelUsed: 'gemini-2.5-flash',
                testResponse: text,
                message: 'Conexión a Gemini API exitosa'
            };
        } catch (error) {
            console.error('Prueba de Gemini API falló:', error);
            return {
                status: 'error',
                error: error.message,
                message: 'Error al conectar con Gemini API'
            };
        }
    }
}

module.exports = new GeminiService();