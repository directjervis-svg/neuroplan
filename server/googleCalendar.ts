/**
 * Google Calendar Integration Service
 * Bidirectional sync between NeuroPlan tasks and Google Calendar events
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { eq, and, isNull, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import { tasks, projects, users } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";

// Google Calendar API configuration
// Note: In production, you would use the Google Calendar API directly
// For this implementation, we'll use the built-in Map proxy for Google services

const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

// Calendar sync settings schema
const calendarSyncSettingsSchema = z.object({
  enabled: z.boolean(),
  calendarId: z.string().optional(),
  syncDirection: z.enum(['to_calendar', 'from_calendar', 'bidirectional']),
  autoSync: z.boolean(),
  syncInterval: z.number().min(5).max(60), // minutes
  includeCompleted: z.boolean(),
  defaultDuration: z.number().min(15).max(480), // minutes
  colorCoding: z.boolean(),
});

type CalendarSyncSettings = z.infer<typeof calendarSyncSettingsSchema>;

// Event color mapping based on task type (neuroadaptive colors)
const TASK_TYPE_COLORS = {
  ACTION: '10', // Green
  RETENTION: '6', // Orange
  MAINTENANCE: '5', // Yellow
  default: '8', // Gray
};

// Convert NeuroPlan task to Google Calendar event format
function taskToCalendarEvent(task: {
  id: number;
  title: string;
  description?: string | null;
  type?: string | null;
  dueDate?: Date | null;
  estimatedMinutes?: number | null;
  projectId?: number | null;
  projectName?: string;
}, settings: CalendarSyncSettings) {
  const startTime = task.dueDate || new Date();
  const duration = task.estimatedMinutes || settings.defaultDuration;
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

  return {
    summary: `[NeuroPlan] ${task.title}`,
    description: [
      task.description || '',
      '',
      '---',
      `Projeto: ${task.projectName || 'Sem projeto'}`,
      `Tipo: ${task.type || 'Não definido'}`,
      `ID NeuroPlan: ${task.id}`,
    ].join('\n'),
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    colorId: settings.colorCoding 
      ? TASK_TYPE_COLORS[task.type as keyof typeof TASK_TYPE_COLORS] || TASK_TYPE_COLORS.default
      : undefined,
    extendedProperties: {
      private: {
        neuroplanTaskId: String(task.id),
        neuroplanProjectId: String(task.projectId || ''),
        neuroplanType: task.type || '',
      },
    },
  };
}

// Convert Google Calendar event to NeuroPlan task format
function calendarEventToTask(event: {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}) {
  const startTime = event.start.dateTime 
    ? new Date(event.start.dateTime)
    : event.start.date 
      ? new Date(event.start.date)
      : new Date();

  const endTime = event.end.dateTime
    ? new Date(event.end.dateTime)
    : event.end.date
      ? new Date(event.end.date)
      : new Date(startTime.getTime() + 30 * 60 * 1000);

  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (60 * 1000));

  return {
    title: event.summary?.replace('[NeuroPlan] ', '') || 'Evento do Calendário',
    description: event.description || '',
    dueDate: startTime,
    estimatedMinutes: durationMinutes,
    googleEventId: event.id,
  };
}

// Generate iCal format for task
function generateICalEvent(task: {
  id: number;
  title: string;
  description?: string | null;
}) {
  const uid = `neuroplan-task-${task.id}@neuroplan.app`;
  const now = new Date();
  const startTime = now;
  const duration = 30; // Default duration
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NeuroPlan//Task Export//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `SUMMARY:${task.title}`,
    `DESCRIPTION:${(task.description || '').replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// Google Calendar Router
export const googleCalendarRouter = router({
  // Get OAuth URL for Google Calendar authorization
  getAuthUrl: protectedProcedure.query(async ({ ctx }) => {
    // In production, this would generate a real OAuth URL
    // For now, we return a placeholder that explains the setup process
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    
    if (!clientId) {
      return {
        url: null,
        message: 'Google Calendar integration requires configuration. Please contact support.',
        configured: false,
      };
    }

    const redirectUri = `${ctx.req.headers.origin}/api/oauth/google/callback`;
    const scope = GOOGLE_CALENDAR_SCOPES.join(' ');
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', String(ctx.user.id));

    return {
      url: authUrl.toString(),
      message: 'Clique para conectar sua conta Google',
      configured: true,
    };
  }),

  // Check if user has connected Google Calendar
  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return { connected: false, email: null };
    }

    // Check if user has Google Calendar tokens stored
    // For now, we'll use a simplified check
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    // In production, you would check for stored OAuth tokens
    return {
      connected: false,
      email: null,
      message: 'Google Calendar não conectado',
    };
  }),

  // Get sync settings
  getSyncSettings: protectedProcedure.query(async ({ ctx }) => {
    // Return default settings (in production, these would be stored per user)
    return {
      enabled: false,
      calendarId: 'primary',
      syncDirection: 'bidirectional' as const,
      autoSync: true,
      syncInterval: 15,
      includeCompleted: false,
      defaultDuration: 30,
      colorCoding: true,
    };
  }),

  // Update sync settings
  updateSyncSettings: protectedProcedure
    .input(calendarSyncSettingsSchema.partial())
    .mutation(async ({ ctx, input }) => {
      // In production, save settings to database
      return {
        success: true,
        settings: {
          enabled: input.enabled ?? false,
          calendarId: input.calendarId ?? 'primary',
          syncDirection: input.syncDirection ?? 'bidirectional',
          autoSync: input.autoSync ?? true,
          syncInterval: input.syncInterval ?? 15,
          includeCompleted: input.includeCompleted ?? false,
          defaultDuration: input.defaultDuration ?? 30,
          colorCoding: input.colorCoding ?? true,
        },
      };
    }),

  // Export single task as iCal
  exportTaskAsICal: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const task = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.taskId)))
        .limit(1);

      if (!task[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
      }

      const icalContent = generateICalEvent(task[0]);

      return {
        content: icalContent,
        filename: `neuroplan-task-${input.taskId}.ics`,
        mimeType: 'text/calendar',
      };
    }),

  // Export project tasks as iCal
  exportProjectAsICal: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const project = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.projectId), eq(projects.userId, ctx.user.id)))
        .limit(1);

      if (!project[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }

      const projectTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, input.projectId));

      const now = new Date();
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const events = projectTasks.map(task => {
        const startTime = now; // Tasks don't have dueDate, use current time
        const duration = 30; // Default duration
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

        return [
          'BEGIN:VEVENT',
          `UID:neuroplan-task-${task.id}@neuroplan.app`,
          `DTSTAMP:${formatDate(now)}`,
          `DTSTART:${formatDate(startTime)}`,
          `DTEND:${formatDate(endTime)}`,
          `SUMMARY:${task.title}`,
          `DESCRIPTION:Projeto: ${project[0].title}\\n${(task.description || '').replace(/\n/g, '\\n')}`,
          'STATUS:CONFIRMED',
          'END:VEVENT',
        ].join('\r\n');
      });

      const icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//NeuroPlan//Project Export//PT',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${project[0].title}`,
        ...events,
        'END:VCALENDAR',
      ].join('\r\n');

      return {
        content: icalContent,
        filename: `neuroplan-project-${input.projectId}.ics`,
        mimeType: 'text/calendar',
      };
    }),

  // Sync tasks to Google Calendar (manual trigger)
  syncToCalendar: protectedProcedure
    .input(z.object({
      projectId: z.number().optional(),
      taskIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In production, this would use the Google Calendar API
      // For now, return a message about the feature status
      return {
        success: false,
        message: 'Para sincronizar com o Google Calendar, conecte sua conta Google nas configurações.',
        syncedCount: 0,
        errors: [],
      };
    }),

  // Import events from Google Calendar
  importFromCalendar: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In production, this would fetch events from Google Calendar API
      return {
        success: false,
        message: 'Para importar do Google Calendar, conecte sua conta Google nas configurações.',
        importedCount: 0,
        events: [],
      };
    }),

  // Get list of user's calendars
  getCalendars: protectedProcedure.query(async ({ ctx }) => {
    // In production, this would fetch from Google Calendar API
    return {
      calendars: [],
      message: 'Conecte sua conta Google para ver seus calendários.',
    };
  }),
});

export type GoogleCalendarRouter = typeof googleCalendarRouter;
