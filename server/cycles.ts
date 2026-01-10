import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { 
  projectCycles, 
  cycleTasks, 
  whereILeftOff, 
  projectContext,
  projects,
  aiInteractionLog
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

/**
 * Cycles Router - Manages 3-day execution cycles (Barkley-aligned)
 */
export const cyclesRouter = router({
  
  // Get active cycle for current user
  getActive: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    
    const cycles = await db
      .select()
      .from(projectCycles)
      .where(
        and(
          eq(projectCycles.userId, ctx.user.id),
          eq(projectCycles.status, "DAY_1")
        )
      )
      .limit(1);
    
    if (cycles.length === 0) {
      // Try to find any non-completed cycle
      const anyCycle = await db
        .select()
        .from(projectCycles)
        .where(eq(projectCycles.userId, ctx.user.id))
        .orderBy(desc(projectCycles.createdAt))
        .limit(1);
      
      return anyCycle[0] || null;
    }
    
    return cycles[0];
  }),
  
  // Get today's tasks for active cycle
  getTodayTasks: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    // Get active cycle
    const cycles = await db
      .select()
      .from(projectCycles)
      .where(eq(projectCycles.userId, ctx.user.id))
      .orderBy(desc(projectCycles.createdAt))
      .limit(1);
    
    if (cycles.length === 0) return [];
    
    const cycle = cycles[0];
    const currentDay = cycle.currentDay || 1;
    
    // Get tasks for current day
    const tasks = await db
      .select()
      .from(cycleTasks)
      .where(
        and(
          eq(cycleTasks.cycleId, cycle.id),
          eq(cycleTasks.dayNumber, currentDay)
        )
      )
      .orderBy(cycleTasks.priority);
    
    return tasks;
  }),
  
  // Get "Where I Left Off" for yesterday
  getWhereILeftOff: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    
    const records = await db
      .select()
      .from(whereILeftOff)
      .where(
        and(
          eq(whereILeftOff.userId, ctx.user.id),
          eq(whereILeftOff.isActive, true)
        )
      )
      .orderBy(desc(whereILeftOff.createdAt))
      .limit(1);
    
    return records[0] || null;
  }),
  
  // Update "Where I Left Off"
  updateWhereILeftOff: protectedProcedure
    .input(z.object({
      cycleId: z.number(),
      content: z.string().min(1),
      nextAction: z.string().optional(),
      blockers: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get cycle to determine day number
      const cycles = await db
        .select()
        .from(projectCycles)
        .where(eq(projectCycles.id, input.cycleId))
        .limit(1);
      
      if (cycles.length === 0) throw new Error("Cycle not found");
      
      const cycle = cycles[0];
      
      // Deactivate previous records for this cycle/day
      await db
        .update(whereILeftOff)
        .set({ isActive: false })
        .where(
          and(
            eq(whereILeftOff.cycleId, input.cycleId),
            eq(whereILeftOff.dayNumber, cycle.currentDay || 1)
          )
        );
      
      // Insert new record
      await db.insert(whereILeftOff).values({
        cycleId: input.cycleId,
        projectId: cycle.projectId,
        userId: ctx.user.id,
        dayNumber: cycle.currentDay || 1,
        content: input.content,
        nextAction: input.nextAction || null,
        blockers: input.blockers || null,
        isActive: true,
      });
      
      return { success: true };
    }),
  
  // Get project context for assistant panel
  getProjectContext: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const contexts = await db
        .select()
        .from(projectContext)
        .where(eq(projectContext.projectId, input.projectId))
        .limit(1);
      
      return contexts[0] || null;
    }),
  
  // Start a task
  startTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(cycleTasks)
        .set({ status: "IN_PROGRESS" })
        .where(eq(cycleTasks.id, input.taskId));
      
      return { success: true };
    }),
  
  // Complete a task
  completeTask: protectedProcedure
    .input(z.object({ 
      taskId: z.number(),
      actualMinutes: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(cycleTasks)
        .set({ 
          status: "COMPLETED",
          completedAt: new Date(),
          actualMinutes: input.actualMinutes || null,
        })
        .where(eq(cycleTasks.id, input.taskId));
      
      return { success: true, xpEarned: 50 };
    }),
  
  // Create a new 3-day cycle
  createCycle: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      tasks: z.array(z.object({
        dayNumber: z.number().min(1).max(3),
        priority: z.enum(["A", "B", "C"]),
        title: z.string(),
        description: z.string().optional(),
        estimatedMinutes: z.number().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get cycle number
      const existingCycles = await db
        .select()
        .from(projectCycles)
        .where(eq(projectCycles.projectId, input.projectId));
      
      const cycleNumber = existingCycles.length + 1;
      
      // Create cycle
      const now = new Date();
      const day2 = new Date(now);
      day2.setDate(day2.getDate() + 1);
      const day3 = new Date(now);
      day3.setDate(day3.getDate() + 2);
      
      const result = await db.insert(projectCycles).values({
        projectId: input.projectId,
        userId: ctx.user.id,
        cycleNumber,
        day1Date: now,
        day2Date: day2,
        day3Date: day3,
        status: "DAY_1",
        currentDay: 1,
      });
      
      const cycleId = Number(result[0].insertId);
      
      // Create tasks
      for (const task of input.tasks) {
        await db.insert(cycleTasks).values({
          cycleId,
          projectId: input.projectId,
          dayNumber: task.dayNumber,
          priority: task.priority,
          title: task.title,
          description: task.description || null,
          estimatedMinutes: task.estimatedMinutes || 30,
          status: "PENDING",
        });
      }
      
      return { cycleId, cycleNumber };
    }),
  
  // Generate cycle with AI (Planner Barkley) - Full cycle generation
  generateWithAI: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      briefing: z.string(),
      createCycle: z.boolean().optional().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const startTime = Date.now();
      
      const prompt = `Você é o **Planner Barkley**, um assistente de execução neuroadaptado especializado em ajudar pessoas com TDAH a transformar ideias em ações concretas.

Sua missão é criar um ciclo de 3 dias com tarefas organizadas pelo sistema A-B-C de prioridades.

## REGRAS DO SISTEMA A-B-C:

**Tarefa A (Mínimo Aceitável):**
- É a tarefa OBRIGATÓRIA do dia
- Deve ser completável em ~30 minutos
- Representa o mínimo para considerar o dia produtivo
- Foco em ação imediata, sem dependências complexas

**Tarefa B (Ideal):**
- Expande ou complementa a Tarefa A
- Leva ~45 minutos
- Representa um dia de boa produtividade
- Pode ter alguma complexidade adicional

**Tarefa C (Excepcional):**
- Bônus para dias muito produtivos
- ~30 minutos
- Opcional, mas recompensadora
- Pode ser criativa ou de refinamento

## PRINCÍPIOS BARKLEY:
1. **Externalização**: Cada tarefa deve ser auto-explicativa
2. **Fragmentação**: Dividir em passos pequenos e concretos
3. **Proximidade temporal**: Tarefas devem ter resultado visível no mesmo dia
4. **Redução de atrito**: Verbos de ação no início (Criar, Escrever, Revisar, Enviar)

## BRIEFING DO PROJETO:
${input.briefing}

## INSTRUÇÕES:
- Crie EXATAMENTE 9 tarefas (3 por dia, A-B-C cada)
- Seja ESPECÍFICO e CONCRETO
- Evite tarefas vagas como "Pesquisar sobre X"
- Prefira "Listar 5 fontes sobre X" ou "Escrever 200 palavras sobre Y"

Responda APENAS com JSON válido:
{
  "projectSummary": "Resumo do projeto em 1-2 frases",
  "tasks": [
    {"dayNumber": 1, "priority": "A", "title": "...", "description": "...", "estimatedMinutes": 30, "checklist": ["Passo 1", "Passo 2"]},
    {"dayNumber": 1, "priority": "B", "title": "...", "description": "...", "estimatedMinutes": 45, "checklist": ["Passo 1", "Passo 2", "Passo 3"]},
    {"dayNumber": 1, "priority": "C", "title": "...", "description": "...", "estimatedMinutes": 30, "checklist": ["Passo 1", "Passo 2"]},
    {"dayNumber": 2, "priority": "A", "title": "...", "description": "...", "estimatedMinutes": 30, "checklist": []},
    {"dayNumber": 2, "priority": "B", "title": "...", "description": "...", "estimatedMinutes": 45, "checklist": []},
    {"dayNumber": 2, "priority": "C", "title": "...", "description": "...", "estimatedMinutes": 30, "checklist": []},
    {"dayNumber": 3, "priority": "A", "title": "...", "description": "...", "estimatedMinutes": 30, "checklist": []},
    {"dayNumber": 3, "priority": "B", "title": "...", "description": "...", "estimatedMinutes": 45, "checklist": []},
    {"dayNumber": 3, "priority": "C", "title": "...", "description": "...", "estimatedMinutes": 30, "checklist": []}
  ]
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um assistente que responde apenas em JSON válido." },
            { role: "user", content: prompt },
          ],
        });
        
        const rawContent = response.choices[0]?.message?.content || "{}";
        const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
        const parsed = JSON.parse(content);
        
        // Log AI interaction
        await db.insert(aiInteractionLog).values({
          userId: ctx.user.id,
          projectId: input.projectId,
          actionType: "PLANNER_BARKLEY",
          inputPrompt: prompt,
          outputResponse: typeof content === 'string' ? content : JSON.stringify(content),
          tokensInput: response.usage?.prompt_tokens || 0,
          tokensOutput: response.usage?.completion_tokens || 0,
          latencyMs: Date.now() - startTime,
          success: true,
        });
        
        // If createCycle is true, create the cycle with the generated tasks
        if (input.createCycle && parsed.tasks && parsed.tasks.length > 0) {
          // Get cycle number
          const existingCycles = await db
            .select()
            .from(projectCycles)
            .where(eq(projectCycles.projectId, input.projectId));
          
          const cycleNumber = existingCycles.length + 1;
          
          // Create cycle
          const now = new Date();
          const day2 = new Date(now);
          day2.setDate(day2.getDate() + 1);
          const day3 = new Date(now);
          day3.setDate(day3.getDate() + 2);
          
          const result = await db.insert(projectCycles).values({
            projectId: input.projectId,
            userId: ctx.user.id,
            cycleNumber,
            day1Date: now,
            day2Date: day2,
            day3Date: day3,
            status: "DAY_1",
            currentDay: 1,
          });
          
          const cycleId = Number(result[0].insertId);
          
          // Create tasks with checklist
          for (const task of parsed.tasks) {
            await db.insert(cycleTasks).values({
              cycleId,
              projectId: input.projectId,
              dayNumber: task.dayNumber,
              priority: task.priority,
              title: task.title,
              description: task.description || null,
              estimatedMinutes: task.estimatedMinutes || 30,
              checklist: task.checklist ? JSON.stringify(task.checklist.map((text: string, idx: number) => ({
                id: `item-${idx}`,
                text,
                completed: false
              }))) : null,
              status: "PENDING",
            });
          }
          
          // Update project context with summary
          if (parsed.projectSummary) {
            const existingContext = await db
              .select()
              .from(projectContext)
              .where(eq(projectContext.projectId, input.projectId))
              .limit(1);
            
            const summaryBullets = [{ text: parsed.projectSummary }];
            
            if (existingContext.length > 0) {
              await db
                .update(projectContext)
                .set({ summaryBullets })
                .where(eq(projectContext.projectId, input.projectId));
            } else {
              await db.insert(projectContext).values({
                projectId: input.projectId,
                summaryBullets,
              });
            }
          }
          
          return { 
            tasks: parsed.tasks, 
            cycleId, 
            cycleNumber,
            projectSummary: parsed.projectSummary 
          };
        }
        
        return { tasks: parsed.tasks || [], projectSummary: parsed.projectSummary };
      } catch (error) {
        // Log error
        await db.insert(aiInteractionLog).values({
          userId: ctx.user.id,
          projectId: input.projectId,
          actionType: "PLANNER_BARKLEY",
          inputPrompt: prompt,
          outputResponse: null,
          success: false,
          errorMessage: String(error),
          latencyMs: Date.now() - startTime,
        });
        
        throw error;
      }
    }),
});

export type CyclesRouter = typeof cyclesRouter;
