const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is required in environment variables');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    /**
     * Generate business rules from text prompt
     * @param {string} prompt - User's business requirements
     * @returns {Promise<Object>} Generated business rules
     */
    async generateBusinessRulesFromPrompt(prompt) {
        try {
            const systemPrompt = `
You are a business rules expert for Banorte bank. Generate comprehensive, actionable business rules based on the user's requirements.

Please format your response as a JSON object with this structure:
{
    "rules": [
        {
            "id": "temp_rule_1",
            "title": "Rule Title",
            "description": "Detailed description of the rule",
            "conditions": ["condition 1", "condition 2"],
            "actions": ["action 1", "action 2"],
            "priority": "high|medium|low",
            "category": "fraud_detection|compliance|risk_management|customer_service|other"
        }
    ],
    "summary": "Brief summary of all generated rules",
    "implementation_notes": "Key considerations for implementation"
}

User Request: ${prompt}

Generate practical business rules that Banorte can implement for banking operations, compliance, risk management, or customer service.
Use temporary IDs like "temp_rule_1", "temp_rule_2", etc. - they will be updated with database IDs later.
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
                    title: "Generated Rule",
                    description: text,
                    conditions: ["User request processed"],
                    actions: ["Review and implement"],
                    priority: "medium",
                    category: "other"
                }],
                summary: "Business rule generated from user prompt",
                implementation_notes: "Review the generated rule for accuracy and compliance"
            };

        } catch (error) {
            console.error('Error generating business rules from prompt:', error);
            throw new Error('Failed to generate business rules: ' + error.message);
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
You are a business rules expert for Banorte bank. Analyze the provided CSV data and generate relevant business rules.

CSV Data Analysis:
- Headers: ${headers.join(', ')}
- Row count: ${rowCount}
- Sample data: ${JSON.stringify(sample, null, 2)}
- Context: ${context}

Please generate business rules that could be applied to this data for banking operations. Consider:
- Data validation rules
- Risk assessment rules  
- Compliance requirements
- Fraud detection patterns
- Customer segmentation rules
- Transaction limits or thresholds

Format your response as JSON:
{
    "data_analysis": {
        "data_type": "detected data type (transactions, customers, etc.)",
        "key_insights": ["insight 1", "insight 2"],
        "data_quality": "assessment of data quality"
    },
    "rules": [
        {
            "id": "rule_001",
            "title": "Rule Title",
            "description": "Detailed description",
            "conditions": ["condition based on data"],
            "actions": ["recommended action"],
            "priority": "high|medium|low",
            "category": "fraud_detection|compliance|risk_management|customer_service|data_validation",
            "data_fields": ["relevant CSV columns"]
        }
    ],
    "summary": "Summary of generated rules",
    "implementation_notes": "Implementation considerations"
}
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
                    data_type: "Unknown",
                    key_insights: ["Data uploaded successfully"],
                    data_quality: "Needs review"
                },
                rules: [{
                    id: "rule_001",
                    title: "Data Review Rule",
                    description: "Review uploaded data for business rule generation",
                    conditions: [`Data has ${rowCount} rows`, `Headers: ${headers.join(', ')}`],
                    actions: ["Manual review required"],
                    priority: "medium",
                    category: "data_validation",
                    data_fields: headers
                }],
                summary: "Initial data analysis completed",
                implementation_notes: "Manual review recommended for accurate rule generation"
            };

        } catch (error) {
            console.error('Error generating business rules from data:', error);
            throw new Error('Failed to analyze data and generate rules: ' + error.message);
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
You are a business rules expert for Banorte bank. Refine the existing business rules based on user feedback.

Current Rules: ${JSON.stringify(existingRules, null, 2)}

User Feedback: ${feedback}

Please update the rules according to the feedback while maintaining banking compliance and best practices.
Return the refined rules in the same JSON format as the original.
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
            console.error('Error refining business rules:', error);
            throw new Error('Failed to refine business rules: ' + error.message);
        }
    }
}

module.exports = new GeminiService();