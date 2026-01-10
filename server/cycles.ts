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
  
  // Generate cycle with AI (Planner Barkley)
  generateWithAI: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      briefing: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const startTime = Date.now();
      
      const prompt = `Você é o Planner Barkley, um assistente especializado em ajudar pessoas com TDAH a executar projetos.

Baseado no briefing abaixo, crie um ciclo de 3 dias com tarefas A-B-C para cada dia.

REGRAS:
- Cada dia deve ter EXATAMENTE 3 tarefas: A (mínimo aceitável), B (ideal), C (excepcional)
- Tarefa A é obrigatória e deve ser completável em ~30 minutos
- Tarefa B expande A e leva ~45 minutos
- Tarefa C é bônus para dias produtivos, ~30 minutos
- Use verbos de ação no início de cada tarefa
- Seja específico e concreto, evite tarefas vagas

BRIEFING DO PROJETO:
${input.briefing}

Responda APENAS com JSON válido no formato:
{
  "tasks": [
    {"dayNumber": 1, "priority": "A", "title": "...", "description": "...", "estimatedMinutes": 30},
    {"dayNumber": 1, "priority": "B", "title": "...", "description": "...", "estimatedMinutes": 45},
    {"dayNumber": 1, "priority": "C", "title": "...", "description": "...", "estimatedMinutes": 30},
    {"dayNumber": 2, "priority": "A", "title": "...", "description": "...", "estimatedMinutes": 30},
    ...
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
        
        return { tasks: parsed.tasks || [] };
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
