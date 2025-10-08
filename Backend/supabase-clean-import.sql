-- ========================================
-- SUPABASE IMPORT SCRIPT
-- Clean import for fresh Supabase project
-- Generated from pgAdmin backup
-- ========================================

-- Step 1: Create the update function (Supabase compatible)
CREATE OR REPLACE FUNCTION update_fecha_actualizacion_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create tables with proper structure
CREATE TABLE IF NOT EXISTS public.usuario (
    id BIGSERIAL PRIMARY KEY,
    correo VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    pais_region VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.reglanegocio (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES public.usuario(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL CHECK (status IN ('Activa', 'Inactiva')),
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resumen TEXT NOT NULL,
    archivo_original TEXT,
    regla_estandarizada JSONB,
    input_usuario TEXT,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.simulacion_reglas (
    id BIGSERIAL PRIMARY KEY,
    regla_id BIGINT NOT NULL REFERENCES public.reglanegocio(id) ON DELETE CASCADE,
    tipo_entrada VARCHAR(20) NOT NULL CHECK (tipo_entrada IN ('text', 'file')),
    datos_entrada TEXT NOT NULL,
    archivo_original VARCHAR(255),
    resultado_ia JSONB,
    fecha_simulacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reglanegocio_usuario ON public.reglanegocio(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reglanegocio_status ON public.reglanegocio(status);
CREATE INDEX IF NOT EXISTS idx_simulacion_reglas_regla ON public.simulacion_reglas(regla_id);
CREATE INDEX IF NOT EXISTS idx_simulacion_reglas_fecha ON public.simulacion_reglas(fecha_simulacion);
CREATE INDEX IF NOT EXISTS idx_simulacion_reglas_tipo ON public.simulacion_reglas(tipo_entrada);

-- Step 4: Create trigger for auto-update timestamps
DROP TRIGGER IF EXISTS update_reglanegocio_fecha_actualizacion ON public.reglanegocio;
CREATE TRIGGER update_reglanegocio_fecha_actualizacion
    BEFORE UPDATE ON public.reglanegocio
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion_column();

-- Step 5: Insert your data
-- Insert usuarios
INSERT INTO public.usuario (nombre, correo, contraseña, pais_region, fecha_creacion) VALUES 
('admin', 'admin@test.com', '$2b$10$RA5dkJO1iDQ/hfa0sJSfLO4M0jwSA572SuGMJDA/MH7Tikm8T4Vuy', 'México', '2025-09-29T14:17:15.347127+00:00'),
('test', 'test@banorte.com', '$2b$10$LsdIghrkdp8N9.Se6DZykO/Qv4Kt01L1YX9Onzu6Em81pH.w/K7pq', 'México', '2025-10-06T17:19:49.745613+00:00')
ON CONFLICT (correo) DO NOTHING;

-- Insert business rules (using dynamic user ID lookup)
INSERT INTO public.reglanegocio (usuario_id, status, fecha_creacion, resumen, archivo_original, regla_estandarizada, input_usuario, fecha_actualizacion) VALUES 
((SELECT id FROM public.usuario WHERE correo = 'admin@test.com'), 'Activa', '2025-10-01T20:25:28.52103+00:00', 'Hola, necesito una regla de negocio para cuando se quiere realizar una compra mayor a 10,000 MXN', NULL, 
'{"rules": [{"id": "rule_4_1", "title": "High-Value Transaction Authorization and Limit Check", "actions": ["IF Card type is Debit: Verify sufficient available balance in the associated account.", "IF Card type is Credit: Verify sufficient available credit line.", "Verify transaction does not exceed the customer''s daily spending limit.", "Verify transaction does not exceed the customer''s single transaction limit for the card type.", "IF all checks pass: Authorize transaction.", "IF any check fails: Deny transaction with a specific reason code (e.g., ''Insufficient Funds'', ''Exceeds Daily Limit'', ''Exceeds Credit Line'').", "Log authorization decision, reason code, and associated transaction details."], "category": "risk_management", "priority": "high", "conditions": ["Transaction amount is greater than 10,000 MXN", "Card type is Debit OR Credit"], "description": "This rule ensures that any purchase transaction exceeding 10,000 MXN is subject to immediate authorization checks against available funds/credit and predefined spending limits before approval."}, {"id": "rule_4_2", "title": "High-Value Transaction Fraud Anomaly Detection", "actions": ["Flag transaction for immediate real-time scoring by the Banorte Fraud Detection System (FDS).", "IF FDS fraud score exceeds a pre-defined threshold: Temporarily hold transaction.", "Attempt to contact the cardholder via registered phone/mobile app for immediate transaction verification.", "IF cardholder verifies the transaction as legitimate: Release hold and authorize transaction.", "IF cardholder cannot be reached, verification fails, OR cardholder reports as unauthorized: Deny transaction and initiate card blocking/suspension.", "Notify Banorte fraud investigation team for further review and potential follow-up if suspicious activity is confirmed."], "category": "fraud_detection", "priority": "high", "conditions": ["Transaction amount is greater than 10,000 MXN", "Transaction deviates significantly from customer''s historical spending patterns (e.g., unusual merchant category, geographic location, time of day, or frequency for this amount range)", "Transaction originates from a high-risk IP address or device (for online purchases)", "Transaction occurs shortly after a significant account change (e.g., password reset, address update)", "Multiple high-value transactions (e.g., 2+ transactions > 5,000 MXN) within a short timeframe (e.g., 1 hour)"], "description": "For purchases over 10,000 MXN, this rule triggers enhanced fraud detection analysis to identify patterns that deviate from normal customer behavior or indicate potential fraudulent activity."}, {"id": "rule_4_3", "title": "Customer Notification for Significant Purchases", "actions": ["Send an immediate SMS and/or Banorte Móvil app push notification to the customer.", "Notification content MUST include: Transaction amount, merchant name, date/time, and a clear instruction on how to report an unauthorized transaction (e.g., ''If this transaction is not yours, reply ''FRAUD'' or call Banorte at [phone number]'').", "Log the successful delivery of the notification."], "category": "customer_service", "priority": "medium", "conditions": ["Transaction amount is greater than 10,000 MXN", "Transaction has been successfully authorized (approved by Rule 1 and not flagged/denied by Rule 2)", "Customer has opted-in for real-time transaction alerts via SMS or Banorte Móvil app."], "description": "Upon successful authorization of a purchase greater than 10,000 MXN, this rule ensures the customer receives a real-time notification to enhance security and customer confidence."}, {"id": "rule_4_4", "title": "Internal Reporting for High-Value Transactions and Risk Profiling", "actions": ["Generate an internal alert for the Banorte Risk Management and/or Compliance team.", "Record full transaction details in a dedicated suspicious activity log or watchlist.", "Update the customer''s internal risk score based on the transaction characteristics.", "IF cumulative spending thresholds are met: Initiate a manual review of the customer''s recent account activity for potential structuring or other AML red flags.", "Prepare data for potential regulatory reporting if required by cumulative thresholds or other AML criteria."], "category": "compliance", "priority": "medium", "conditions": ["Transaction amount is greater than 10,000 MXN", "Transaction involves a merchant or country categorized as high-risk by Banorte''s internal policies", "Customer''s account has a heightened internal risk profile (e.g., previous suspicious activity flags, recent KYC updates, or a new account)", "Transaction contributes to a cumulative spending threshold (e.g., total transactions > 50,000 MXN within 24 hours)"], "description": "This rule ensures that high-value transactions are logged and reviewed for compliance with internal risk management policies and potential AML (Anti-Money Laundering) indicators, even if initially authorized."}], "summary": "These business rules address purchase transactions exceeding 10,000 MXN by implementing a multi-layered approach focusing on authorization, fraud detection, customer communication, and internal risk/compliance reporting. They ensure financial security, mitigate fraud risks, enhance customer experience through proactive alerts, and support regulatory compliance for Banorte.", "implementation_notes": "Key considerations for implementation include: Real-time Processing, Integration, Configurable Thresholds, Customer Communication Channels, Audit Trail, Performance and Scalability, Data Enrichment, Machine Learning Integration, Card Type Differentiation, and Regulatory Compliance."}'::jsonb, NULL, '2025-10-07T17:55:37.567706+00:00'),

((SELECT id FROM public.usuario WHERE correo = 'admin@test.com'), 'Activa', '2025-10-02T20:08:38.680842+00:00', 'Necesito una regla para aprobar transacciones mayores a $20,000 MXN', NULL,
'{"rules": [{"id": "rule_5_1", "title": "Regla Generada", "actions": ["Revisar e implementar"], "category": "otro", "priority": "media", "conditions": ["Solicitud del usuario procesada"], "description": "Regla para transacciones mayores a 20,000 MXN que requieren aprobación especial"}], "summary": "Regla de negocio generada desde solicitud del usuario", "implementation_notes": "Revisar la regla generada para verificar precisión y cumplimiento"}'::jsonb, NULL, '2025-10-07T17:55:37.567706+00:00'),

((SELECT id FROM public.usuario WHERE correo = 'admin@test.com'), 'Activa', '2025-10-05T21:28:06.098469+00:00', 'Reglas de gestión de riesgo para transacciones de salida de fondos superiores a $5,000 MXN. Estas requieren una autorización adicional del cliente (biométrica, OTP o llamada) para ser procesadas; de lo contrario, son rechazadas y el cliente es notificado.', NULL,
'{"rules": [{"id": "rule_6_1", "title": "Umbral de Autorización para Transacciones de Alto Valor", "actions": ["La transacción es automáticamente retenida y marcada con el estado ''Pendiente de Autorización Adicional''.", "El sistema inicia un proceso de validación adicional con el titular de la cuenta.", "Si la validación adicional es exitosa y confirmada por el cliente, la transacción es liberada y procesada de inmediato.", "Si la validación adicional falla o no se completa dentro de un plazo definido, la transacción es automáticamente rechazada.", "El cliente es notificado sobre el estado de la transacción.", "Se registra un evento de monitoreo y, en caso de múltiples intentos fallidos de autorización, se genera una alerta para el equipo de Monitoreo de Fraude."], "category": "gestion_riesgo", "priority": "alta", "conditions": ["El monto total de la transacción es estrictamente mayor a $5,000 MXN (Pesos Mexicanos).", "El tipo de transacción implica una salida de fondos de la cuenta del cliente.", "La transacción se origina desde una cuenta de depósito, inversión o crédito de Banorte.", "La transacción no corresponde a un pago de nómina, una transferencia entre cuentas propias del mismo titular o un cargo recurrente previamente autorizado."], "description": "Esta regla establece un umbral monetario para transacciones de salida específicas que requieren una verificación y autorización adicional por parte del cliente o del banco."}], "summary": "Se ha generado una regla de negocio fundamental para Banorte que establece un control de seguridad adicional para transacciones de salida que superen los $5,000 MXN.", "metadata": {"email": "sistema@banorte.com", "empresa": "Prueba", "usuario": "Usuario Sistema"}, "implementation_notes": "Para una implementación efectiva de esta regla, se deben considerar los siguientes puntos de integración tecnológica, canales de autorización, experiencia del cliente, excepciones, tiempos de espera, capacitación interna, y monitoreo y ajuste."}'::jsonb, 'Crear regla de negocio para transacciones superiores a 5000 pesos que requieren autorización adicional', '2025-10-07T19:27:26.324144+00:00');

-- Insert simulations (using dynamic rule ID lookup)
INSERT INTO public.simulacion_reglas (regla_id, tipo_entrada, datos_entrada, archivo_original, resultado_ia, fecha_simulacion) VALUES
((SELECT id FROM public.reglanegocio WHERE resumen LIKE '%$20,000 MXN%' LIMIT 1), 'text', 'Que pasa si la transaccion es menor a $20,000?', NULL,
'{"results": {"risk_level": "medio", "data_quality": "regular", "test_coverage": "parcial", "actions_required": ["Revisar resultados de simulación"], "compliance_status": "parcial", "triggered_conditions": ["Regla evaluada con datos de prueba"]}, "analysis": "Simulación completada para la regla de transacciones mayores a $20,000 MXN. Los datos de prueba han sido procesados y evaluados según los criterios de la regla de negocio.", "edge_cases": ["Datos de prueba con estructura variable"], "recommendations": "Se recomienda revisar la configuración de la regla y ampliar los casos de prueba para obtener una evaluación más completa.", "validation_results": {"failed_tests": 0, "passed_tests": 1, "success_rate": "100%", "total_scenarios": 1}, "implementation_notes": "La simulación se completó exitosamente. Se sugiere validación adicional con datos reales."}'::jsonb, '2025-10-07T18:52:17.785617+00:00');

-- Enable Row Level Security (RLS) - Supabase best practice
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reglanegocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacion_reglas ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you can modify these later)
CREATE POLICY "Users can view their own data" ON public.usuario FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can view their own rules" ON public.reglanegocio FOR SELECT USING (usuario_id = (SELECT id FROM usuario WHERE auth.uid()::text = id::text));
CREATE POLICY "Users can view their own simulations" ON public.simulacion_reglas FOR SELECT USING (regla_id IN (SELECT id FROM reglanegocio WHERE usuario_id = (SELECT id FROM usuario WHERE auth.uid()::text = id::text)));

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database migration completed successfully!';
    RAISE NOTICE 'Tables created: usuario, reglanegocio, simulacion_reglas';
    RAISE NOTICE 'Data imported: 2 usuarios, 3 reglas, 1 simulacion';
    RAISE NOTICE 'Indexes and constraints applied';
    RAISE NOTICE 'Row Level Security enabled';
END $$;