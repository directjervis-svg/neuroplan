/**
 * Validation Schemas
 * 
 * Schemas Zod para validação de input e otimização de prompts.
 * Reduz créditos ao evitar processamento de dados inválidos.
 */

import { z } from 'zod';

/**
 * Schema para criação de ciclo via Barkley Planner
 */
export const createCycleSchema = z.object({
  projectDescription: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição não pode exceder 1000 caracteres')
    .describe('Descrição clara e concisa do projeto'),

  userProfile: z
    .object({
      granularity_level: z
        .enum(['macro', 'meso', 'micro'])
        .describe('Nível de granularidade das tarefas'),
      structuring_style: z
        .enum(['top_down', 'bottom_up'])
        .describe('Estilo de estruturação'),
      cognitive_capacity_minutes: z
        .number()
        .min(30, 'Capacidade mínima: 30 minutos')
        .max(480, 'Capacidade máxima: 480 minutos')
        .describe('Capacidade cognitiva diária em minutos'),
    })
    .describe('Perfil de calibração do usuário'),
});

export type CreateCycleInput = z.infer<typeof createCycleSchema>;

/**
 * Schema para análise de charter
 */
export const charterAnalysisSchema = z.object({
  userInput: z
    .string()
    .min(5, 'Entrada deve ter pelo menos 5 caracteres')
    .max(1000, 'Entrada não pode exceder 1000 caracteres')
    .describe('Descrição do objetivo do projeto'),
});

export type CharterAnalysisInput = z.infer<typeof charterAnalysisSchema>;

/**
 * Schema para geração de WBS
 */
export const wbsGenerationSchema = z.object({
  resultadoFinal: z
    .string()
    .min(5, 'Resultado deve ter pelo menos 5 caracteres')
    .max(1000, 'Resultado não pode exceder 1000 caracteres')
    .describe('Resultado final desejado'),

  historico: z
    .string()
    .max(2000, 'Histórico não pode exceder 2000 caracteres')
    .optional()
    .describe('Histórico opcional do usuário'),

  userProfile: z
    .object({
      granularity_level: z.enum(['macro', 'meso', 'micro']),
      structuring_style: z.enum(['top_down', 'bottom_up']),
      cognitive_capacity_minutes: z.number().min(30).max(480),
    })
    .describe('Perfil de calibração do usuário'),
});

export type WBSGenerationInput = z.infer<typeof wbsGenerationSchema>;

/**
 * Schema para geração de tarefas
 */
export const taskGenerationSchema = z.object({
  deliverable: z
    .object({
      name: z
        .string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome não pode exceder 100 caracteres'),
      description: z
        .string()
        .min(10, 'Descrição deve ter pelo menos 10 caracteres')
        .max(500, 'Descrição não pode exceder 500 caracteres'),
      estimated_effort: z
        .number()
        .min(1, 'Esforço mínimo: 1')
        .max(5, 'Esforço máximo: 5'),
      depends_on: z
        .array(z.number())
        .optional()
        .describe('Índices de dependências'),
    })
    .describe('Entrega a ser decomposta em tarefas'),

  userProfile: z
    .object({
      granularity_level: z.enum(['macro', 'meso', 'micro']),
      structuring_style: z.enum(['top_down', 'bottom_up']),
      cognitive_capacity_minutes: z.number().min(30).max(480),
    })
    .describe('Perfil de calibração do usuário'),
});

export type TaskGenerationInput = z.infer<typeof taskGenerationSchema>;

/**
 * Schema para pergunta ao assistente
 */
export const askAssistantSchema = z.object({
  message: z
    .string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(1000, 'Mensagem não pode exceder 1000 caracteres')
    .describe('Pergunta ou pedido ao assistente'),

  projectId: z
    .number()
    .optional()
    .describe('ID do projeto (opcional, para contexto)'),

  context: z
    .string()
    .max(2000, 'Contexto não pode exceder 2000 caracteres')
    .optional()
    .describe('Contexto adicional (opcional)'),
});

export type AskAssistantInput = z.infer<typeof askAssistantSchema>;

/**
 * Schema para criação de projeto
 */
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título não pode exceder 100 caracteres'),

  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição não pode exceder 1000 caracteres'),

  status: z
    .enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'])
    .default('ACTIVE')
    .describe('Status inicial do projeto'),

  templateId: z
    .string()
    .optional()
    .describe('ID do template (opcional)'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Validar e sanitizar input
 */
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Validação falhou: ${messages.join(', ')}`);
    }
    throw error;
  }
}

/**
 * Obter descrição de campo do schema
 */
export function getFieldDescription(schema: z.ZodSchema, field: string): string | undefined {
  if (schema instanceof z.ZodObject) {
    const fieldSchema = schema.shape[field];
    return fieldSchema?.description;
  }
  return undefined;
}
