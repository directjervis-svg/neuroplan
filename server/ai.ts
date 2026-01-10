import { invokeLLM } from "./_core/llm";

/**
 * AI Service for NeuroExecução
 * Handles briefing processing, task decomposition, and coaching
 * Based on Barkley principles for TDAH-friendly output
 */

// System prompts based on Barkley principles
const BRIEFING_PROCESSOR_PROMPT = `Você é um assistente especializado em produtividade para pessoas com TDAH, baseado nos princípios de Russell Barkley.

Sua tarefa é analisar um briefing de projeto e reformulá-lo no formato SMART (Específico, Mensurável, Atingível, Relevante, Temporal).

Regras:
1. Identifique a categoria do projeto (PERSONAL, PROFESSIONAL ou ACADEMIC)
2. Extraia o objetivo principal em uma frase clara
3. Identifique recursos disponíveis mencionados
4. Defina um prazo realista se não especificado
5. Sugira 3 níveis de entrega (A=mínimo, B=ideal, C=excepcional)

Responda APENAS em JSON válido com a seguinte estrutura:
{
  "category": "PERSONAL" | "PROFESSIONAL" | "ACADEMIC",
  "smartGoal": "string - objetivo reformulado no formato SMART",
  "resources": ["string - recursos identificados"],
  "suggestedDeadline": "string - prazo sugerido",
  "deliverableA": "string - entrega mínima",
  "deliverableB": "string - entrega ideal", 
  "deliverableC": "string - entrega excepcional",
  "keyInsights": ["string - insights importantes do briefing"]
}`;

const TASK_DECOMPOSER_PROMPT = `Você é um assistente especializado em decomposição de tarefas para pessoas com TDAH, baseado nos princípios de Russell Barkley.

Sua tarefa é decompor um projeto em tarefas acionáveis seguindo o sistema 3+1:
- Máximo 3 tarefas de AÇÃO por dia
- 1 tarefa de PREPARAÇÃO (priming) para o próximo dia
- Cada tarefa DEVE começar com um verbo no infinitivo

Regras importantes:
1. Tarefas devem ser específicas e mensuráveis
2. Duração estimada de 25-50 minutos cada
3. Verbos de ação: Criar, Escrever, Revisar, Pesquisar, Configurar, Testar, etc.
4. Evite tarefas vagas como "Pensar sobre..." ou "Considerar..."
5. A tarefa de preparação deve ser leve e preparar o contexto para o próximo dia

Para um ciclo de 3 dias, gere:
- Dia 0: 1-2 tarefas de planejamento/setup
- Dia 1: 3 tarefas de ação + 1 preparação
- Dia 2: 3 tarefas de ação + 1 preparação  
- Dia 3: 3 tarefas de ação + 1 revisão final

Responda APENAS em JSON válido com a seguinte estrutura:
{
  "tasks": [
    {
      "title": "string - tarefa começando com verbo no infinitivo",
      "titleVerb": "string - o verbo extraído",
      "description": "string - descrição detalhada opcional",
      "type": "ACTION" | "RETENTION" | "MAINTENANCE",
      "dayNumber": number (0-3),
      "position": number (1-4),
      "effortScore": number (1-10),
      "impactScore": number (1-10)
    }
  ],
  "totalEstimatedHours": number,
  "riskFactors": ["string - possíveis bloqueios identificados"]
}`;

const SOCRATIC_COACH_PROMPT = `Você é um coach socrático especializado em ajudar pessoas com TDAH a desenvolver auto-descoberta e clareza mental.

Seu papel é fazer perguntas ao invés de dar respostas diretas. Use o método socrático para:
1. Ajudar o usuário a identificar seus próprios bloqueios
2. Guiar reflexões sobre prioridades
3. Estimular a quebra de tarefas grandes em menores
4. Validar emoções sem julgamento

Regras:
- Faça no máximo 2-3 perguntas por resposta
- Use linguagem empática e acolhedora
- Evite respostas longas (máximo 150 palavras)
- Reconheça o esforço do usuário
- Sugira pausas quando detectar frustração

Responda em português brasileiro, de forma conversacional e acolhedora.`;

export interface ProcessedBriefing {
  category: "PERSONAL" | "PROFESSIONAL" | "ACADEMIC";
  smartGoal: string;
  resources: string[];
  suggestedDeadline: string;
  deliverableA: string;
  deliverableB: string;
  deliverableC: string;
  keyInsights: string[];
}

export interface DecomposedTasks {
  tasks: Array<{
    title: string;
    titleVerb: string;
    description: string;
    type: "ACTION" | "RETENTION" | "MAINTENANCE";
    dayNumber: number;
    position: number;
    effortScore: number;
    impactScore: number;
  }>;
  totalEstimatedHours: number;
  riskFactors: string[];
}

/**
 * Process a project briefing and extract structured information
 */
export async function processBriefing(briefing: string): Promise<ProcessedBriefing> {
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: BRIEFING_PROCESSOR_PROMPT },
        { role: "user", content: `Analise o seguinte briefing de projeto:\n\n${briefing}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "processed_briefing",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: { type: "string", enum: ["PERSONAL", "PROFESSIONAL", "ACADEMIC"] },
              smartGoal: { type: "string" },
              resources: { type: "array", items: { type: "string" } },
              suggestedDeadline: { type: "string" },
              deliverableA: { type: "string" },
              deliverableB: { type: "string" },
              deliverableC: { type: "string" },
              keyInsights: { type: "array", items: { type: "string" } },
            },
            required: ["category", "smartGoal", "resources", "suggestedDeadline", "deliverableA", "deliverableB", "deliverableC", "keyInsights"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from LLM");
    }

    return JSON.parse(content) as ProcessedBriefing;
  } catch (error) {
    console.error("[AI] Error processing briefing:", error);
    throw new Error("Failed to process briefing with AI");
  }
}

/**
 * Decompose a project into actionable tasks following the 3+1 system
 */
export async function decomposeTasks(
  briefing: string,
  processedBriefing: ProcessedBriefing,
  cycleDuration: "DAYS_3" | "DAYS_7" | "DAYS_14"
): Promise<DecomposedTasks> {
  const daysMap = {
    DAYS_3: 3,
    DAYS_7: 7,
    DAYS_14: 14,
  };
  const totalDays = daysMap[cycleDuration];

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: TASK_DECOMPOSER_PROMPT },
        {
          role: "user",
          content: `Decomponha o seguinte projeto em tarefas para um ciclo de ${totalDays} dias:

BRIEFING ORIGINAL:
${briefing}

OBJETIVO SMART:
${processedBriefing.smartGoal}

ENTREGÁVEIS:
- Mínimo (A): ${processedBriefing.deliverableA}
- Ideal (B): ${processedBriefing.deliverableB}
- Excepcional (C): ${processedBriefing.deliverableC}

RECURSOS DISPONÍVEIS:
${processedBriefing.resources.join(", ")}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "decomposed_tasks",
          strict: true,
          schema: {
            type: "object",
            properties: {
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    titleVerb: { type: "string" },
                    description: { type: "string" },
                    type: { type: "string", enum: ["ACTION", "RETENTION", "MAINTENANCE"] },
                    dayNumber: { type: "integer" },
                    position: { type: "integer" },
                    effortScore: { type: "integer" },
                    impactScore: { type: "integer" },
                  },
                  required: ["title", "titleVerb", "description", "type", "dayNumber", "position", "effortScore", "impactScore"],
                  additionalProperties: false,
                },
              },
              totalEstimatedHours: { type: "number" },
              riskFactors: { type: "array", items: { type: "string" } },
            },
            required: ["tasks", "totalEstimatedHours", "riskFactors"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from LLM");
    }

    return JSON.parse(content) as DecomposedTasks;
  } catch (error) {
    console.error("[AI] Error decomposing tasks:", error);
    throw new Error("Failed to decompose tasks with AI");
  }
}

/**
 * Get a Socratic coaching response
 */
export async function getSocraticResponse(
  context: string,
  userMessage: string
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SOCRATIC_COACH_PROMPT },
        {
          role: "user",
          content: `CONTEXTO DO PROJETO:
${context}

MENSAGEM DO USUÁRIO:
${userMessage}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from LLM");
    }

    return content;
  } catch (error) {
    console.error("[AI] Error getting Socratic response:", error);
    throw new Error("Failed to get coaching response");
  }
}
