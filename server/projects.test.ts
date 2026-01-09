import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getProjects: vi.fn(),
  getProjectById: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  getTasks: vi.fn(),
  getTasksByProjectId: vi.fn(),
  getTodayTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  completeTask: vi.fn(),
  getQuickIdeas: vi.fn(),
  createQuickIdea: vi.fn(),
  getDailyLogs: vi.fn(),
  createDailyLog: vi.fn(),
  getFocusCycles: vi.fn(),
  createFocusCycle: vi.fn(),
  updateFocusCycle: vi.fn(),
  getUserStats: vi.fn(),
  updateUserPreferences: vi.fn(),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("projects router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("projects.list", () => {
    it("returns list of projects for authenticated user", async () => {
      const mockProjects = [
        {
          id: 1,
          userId: 1,
          title: "Test Project",
          briefing: "Test briefing",
          status: "ACTIVE",
          category: "PERSONAL",
          cycleDuration: "DAYS_3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getProjects).mockResolvedValue(mockProjects as any);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.list();

      expect(db.getProjects).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProjects);
    });
  });

  describe("projects.getById", () => {
    it("returns project by id for authenticated user", async () => {
      const mockProject = {
        id: 1,
        userId: 1,
        title: "Test Project",
        briefing: "Test briefing",
        status: "ACTIVE",
        category: "PERSONAL",
        cycleDuration: "DAYS_3",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getProjectById).mockResolvedValue(mockProject as any);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.getById({ id: 1 });

      expect(db.getProjectById).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockProject);
    });

    it("returns null for non-existent project", async () => {
      vi.mocked(db.getProjectById).mockResolvedValue(null);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.getById({ id: 999 });

      expect(result).toBeNull();
    });
  });

  describe("projects.create", () => {
    it("creates a new project with default values", async () => {
      const mockCreatedProject = {
        id: 1,
        userId: 1,
        title: "New Project",
        category: "PERSONAL",
        cycleDuration: "DAYS_3",
      };

      vi.mocked(db.createProject).mockResolvedValue(mockCreatedProject as any);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.create({
        title: "New Project",
      });

      expect(db.createProject).toHaveBeenCalledWith({
        userId: 1,
        title: "New Project",
        briefing: undefined,
        category: "PERSONAL",
        cycleDuration: "DAYS_3",
      });
      expect(result).toEqual(mockCreatedProject);
    });

    it("creates a project with custom category and cycle duration", async () => {
      const mockCreatedProject = {
        id: 2,
        userId: 1,
        title: "Work Project",
        category: "PROFESSIONAL",
        cycleDuration: "DAYS_7",
      };

      vi.mocked(db.createProject).mockResolvedValue(mockCreatedProject as any);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.create({
        title: "Work Project",
        briefing: "Important work project",
        category: "PROFESSIONAL",
        cycleDuration: "DAYS_7",
      });

      expect(db.createProject).toHaveBeenCalledWith({
        userId: 1,
        title: "Work Project",
        briefing: "Important work project",
        category: "PROFESSIONAL",
        cycleDuration: "DAYS_7",
      });
      expect(result).toEqual(mockCreatedProject);
    });
  });

  describe("projects.update", () => {
    it("updates project status", async () => {
      vi.mocked(db.updateProject).mockResolvedValue({ success: true });

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.update({
        id: 1,
        status: "ACTIVE",
      });

      expect(db.updateProject).toHaveBeenCalledWith(1, 1, { status: "ACTIVE" });
      expect(result).toEqual({ success: true });
    });

    it("updates project deliverables", async () => {
      vi.mocked(db.updateProject).mockResolvedValue({ success: true });

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.update({
        id: 1,
        deliverableA: "Minimum viable product",
        deliverableB: "Full feature set",
        deliverableC: "Premium version",
      });

      expect(db.updateProject).toHaveBeenCalledWith(1, 1, {
        deliverableA: "Minimum viable product",
        deliverableB: "Full feature set",
        deliverableC: "Premium version",
      });
      expect(result).toEqual({ success: true });
    });
  });
});

describe("tasks router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("tasks.getToday", () => {
    it("returns today's tasks for authenticated user", async () => {
      const mockTasks = [
        {
          id: 1,
          projectId: 1,
          title: "Complete task 1",
          type: "ACTION",
          dayNumber: 1,
          position: 1,
          completedAt: null,
        },
        {
          id: 2,
          projectId: 1,
          title: "Complete task 2",
          type: "ACTION",
          dayNumber: 1,
          position: 2,
          completedAt: null,
        },
      ];

      vi.mocked(db.getTodayTasks).mockResolvedValue(mockTasks as any);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tasks.getToday();

      expect(db.getTodayTasks).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTasks);
    });
  });

  describe("tasks.complete", () => {
    it("marks a task as completed", async () => {
      vi.mocked(db.completeTask).mockResolvedValue({ success: true });

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tasks.complete({ id: 1 });

      expect(db.completeTask).toHaveBeenCalledWith(1, 1, undefined);
      expect(result).toEqual({ success: true });
    });

    it("marks a task as completed with proof URL", async () => {
      vi.mocked(db.completeTask).mockResolvedValue({ success: true });

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tasks.complete({
        id: 1,
        proofUrl: "https://example.com/proof.png",
      });

      expect(db.completeTask).toHaveBeenCalledWith(1, 1, "https://example.com/proof.png");
      expect(result).toEqual({ success: true });
    });
  });
});

describe("ideas router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ideas.create", () => {
    it("creates a quick idea", async () => {
      const mockIdea = {
        id: 1,
        userId: 1,
        content: "Great idea!",
        projectId: null,
      };

      vi.mocked(db.createQuickIdea).mockResolvedValue(mockIdea as any);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ideas.create({ content: "Great idea!" });

      expect(db.createQuickIdea).toHaveBeenCalledWith({
        userId: 1,
        content: "Great idea!",
        projectId: undefined,
      });
      expect(result).toEqual(mockIdea);
    });

    it("creates a quick idea linked to a project", async () => {
      const mockIdea = {
        id: 2,
        userId: 1,
        content: "Project-specific idea",
        projectId: 1,
      };

      vi.mocked(db.createQuickIdea).mockResolvedValue(mockIdea as any);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ideas.create({
        content: "Project-specific idea",
        projectId: 1,
      });

      expect(db.createQuickIdea).toHaveBeenCalledWith({
        userId: 1,
        content: "Project-specific idea",
        projectId: 1,
      });
      expect(result).toEqual(mockIdea);
    });
  });
});

describe("stats router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("stats.overview", () => {
    it("returns user stats overview", async () => {
      const mockStats = {
        activeProjects: 3,
        todayTasks: 4,
        focusMinutes: 120,
        completedTasks: 2,
      };

      vi.mocked(db.getUserStats).mockResolvedValue(mockStats);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.stats.overview();

      expect(db.getUserStats).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStats);
    });
  });
});
