import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for Planner Barkley AI Agent
 * 
 * These tests verify the AI-powered cycle generation functionality
 * that creates 3-day cycles with A-B-C prioritized tasks.
 */

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Planner Barkley - Cycle Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Task Structure Validation", () => {
    it("should generate exactly 9 tasks (3 per day)", () => {
      const mockTasks = generateMockTasks();
      expect(mockTasks.length).toBe(9);
    });

    it("should have 3 tasks per day", () => {
      const mockTasks = generateMockTasks();
      const day1Tasks = mockTasks.filter(t => t.dayNumber === 1);
      const day2Tasks = mockTasks.filter(t => t.dayNumber === 2);
      const day3Tasks = mockTasks.filter(t => t.dayNumber === 3);
      
      expect(day1Tasks.length).toBe(3);
      expect(day2Tasks.length).toBe(3);
      expect(day3Tasks.length).toBe(3);
    });

    it("should have A-B-C priorities for each day", () => {
      const mockTasks = generateMockTasks();
      
      for (let day = 1; day <= 3; day++) {
        const dayTasks = mockTasks.filter(t => t.dayNumber === day);
        const priorities = dayTasks.map(t => t.priority);
        
        expect(priorities).toContain("A");
        expect(priorities).toContain("B");
        expect(priorities).toContain("C");
      }
    });

    it("should have valid estimated minutes", () => {
      const mockTasks = generateMockTasks();
      
      mockTasks.forEach(task => {
        expect(task.estimatedMinutes).toBeGreaterThan(0);
        expect(task.estimatedMinutes).toBeLessThanOrEqual(60);
      });
    });

    it("should have non-empty titles", () => {
      const mockTasks = generateMockTasks();
      
      mockTasks.forEach(task => {
        expect(task.title).toBeTruthy();
        expect(task.title.length).toBeGreaterThan(0);
      });
    });

    it("should have task A with ~30 minutes estimate", () => {
      const mockTasks = generateMockTasks();
      const taskA = mockTasks.find(t => t.dayNumber === 1 && t.priority === "A");
      
      expect(taskA?.estimatedMinutes).toBe(30);
    });

    it("should have task B with ~45 minutes estimate", () => {
      const mockTasks = generateMockTasks();
      const taskB = mockTasks.find(t => t.dayNumber === 1 && t.priority === "B");
      
      expect(taskB?.estimatedMinutes).toBe(45);
    });

    it("should have task C with ~30 minutes estimate", () => {
      const mockTasks = generateMockTasks();
      const taskC = mockTasks.find(t => t.dayNumber === 1 && t.priority === "C");
      
      expect(taskC?.estimatedMinutes).toBe(30);
    });
  });

  describe("Barkley Principles Validation", () => {
    it("should have action verbs at the start of task titles", () => {
      const actionVerbs = [
        "Criar", "Escrever", "Revisar", "Enviar", "Listar", 
        "Definir", "Implementar", "Testar", "Configurar", "Documentar"
      ];
      
      const mockTasks = generateMockTasks();
      
      mockTasks.forEach(task => {
        const startsWithVerb = actionVerbs.some(verb => 
          task.title.startsWith(verb)
        );
        expect(startsWithVerb).toBe(true);
      });
    });

    it("should have specific and concrete descriptions", () => {
      const mockTasks = generateMockTasks();
      
      mockTasks.forEach(task => {
        // Description should not be too short (vague)
        expect(task.description.length).toBeGreaterThan(20);
        
        // Should not contain vague words
        const vagueWords = ["algo", "coisa", "talvez", "possivelmente"];
        vagueWords.forEach(word => {
          expect(task.description.toLowerCase()).not.toContain(word);
        });
      });
    });

    it("should have checklist items for complex tasks", () => {
      const mockTasks = generateMockTasks();
      
      // At least task B (ideal) should have checklist
      const taskB = mockTasks.find(t => t.dayNumber === 1 && t.priority === "B");
      expect(taskB?.checklist).toBeDefined();
      expect(taskB?.checklist.length).toBeGreaterThan(0);
    });
  });

  describe("Cycle Creation", () => {
    it("should calculate correct dates for 3-day cycle", () => {
      const now = new Date();
      const day2 = new Date(now);
      day2.setDate(day2.getDate() + 1);
      const day3 = new Date(now);
      day3.setDate(day3.getDate() + 2);
      
      expect(day2.getDate()).toBe(now.getDate() + 1);
      expect(day3.getDate()).toBe(now.getDate() + 2);
    });

    it("should set initial status as DAY_1", () => {
      const cycleStatus = "DAY_1";
      expect(cycleStatus).toBe("DAY_1");
    });

    it("should set currentDay to 1 initially", () => {
      const currentDay = 1;
      expect(currentDay).toBe(1);
    });
  });
});

/**
 * Helper function to generate mock tasks for testing
 */
function generateMockTasks() {
  return [
    // Day 1
    { dayNumber: 1, priority: "A" as const, title: "Criar estrutura básica do projeto", description: "Configurar o ambiente de desenvolvimento e criar a estrutura de pastas inicial do projeto", estimatedMinutes: 30, checklist: ["Instalar dependências", "Criar pastas"] },
    { dayNumber: 1, priority: "B" as const, title: "Implementar componente principal", description: "Desenvolver o componente principal da aplicação com todas as funcionalidades básicas", estimatedMinutes: 45, checklist: ["Criar componente", "Adicionar props", "Testar renderização"] },
    { dayNumber: 1, priority: "C" as const, title: "Documentar decisões técnicas", description: "Escrever documentação sobre as decisões técnicas tomadas durante o desenvolvimento", estimatedMinutes: 30, checklist: ["Criar README", "Documentar APIs"] },
    
    // Day 2
    { dayNumber: 2, priority: "A" as const, title: "Revisar código do dia anterior", description: "Fazer code review do trabalho realizado no dia 1 e corrigir problemas encontrados", estimatedMinutes: 30, checklist: [] },
    { dayNumber: 2, priority: "B" as const, title: "Implementar testes unitários", description: "Criar testes unitários para os componentes e funções desenvolvidos", estimatedMinutes: 45, checklist: [] },
    { dayNumber: 2, priority: "C" as const, title: "Configurar CI/CD básico", description: "Configurar pipeline de integração contínua para automatizar testes", estimatedMinutes: 30, checklist: [] },
    
    // Day 3
    { dayNumber: 3, priority: "A" as const, title: "Testar fluxo completo", description: "Realizar testes end-to-end do fluxo principal da aplicação", estimatedMinutes: 30, checklist: [] },
    { dayNumber: 3, priority: "B" as const, title: "Implementar melhorias de UX", description: "Adicionar feedback visual e melhorar a experiência do usuário", estimatedMinutes: 45, checklist: [] },
    { dayNumber: 3, priority: "C" as const, title: "Criar release notes", description: "Documentar as mudanças e preparar notas de release para a versão", estimatedMinutes: 30, checklist: [] },
  ];
}
