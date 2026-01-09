/**
 * Calendar Export Service
 * Generates calendar exports in multiple formats following corporate design standards
 * - Monthly Calendar (grid view with tasks)
 * - Weekly Calendar (detailed view)
 * - Daily Planner (focused view)
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { projects, tasks } from "../drizzle/schema";
import { eq, and, asc, gte, lte } from "drizzle-orm";

// Corporate color palette (neuroadapted - no blue)
const COLORS = {
  primary: "#0F172A",      // Navy primary
  secondary: "#1E293B",    // Navy secondary
  text: "#334155",         // Slate text
  textLight: "#64748B",    // Slate light
  paper: "#FFFFFF",
  subtle: "#F8FAFC",
  border: "#E2E8F0",
  success: "#059669",      // Green (ACTION)
  warning: "#D97706",      // Amber (RETENTION)
  accent: "#DC2626",       // Red (MAINTENANCE)
  purple: "#8B5CF6",       // Purple (extras)
};

// Task type colors
const TASK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ACTION: { bg: "#ECFDF5", text: "#059669", border: "#059669" },
  RETENTION: { bg: "#FFFBEB", text: "#D97706", border: "#D97706" },
  MAINTENANCE: { bg: "#FEF2F2", text: "#DC2626", border: "#DC2626" },
  BUFFER: { bg: "#F3E8FF", text: "#8B5CF6", border: "#8B5CF6" },
};

// Format date helpers
function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long" });
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "short" }).toUpperCase().replace(".", "");
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Generate Monthly Calendar HTML
function generateMonthlyCalendarHTML(
  project: any,
  tasksList: any[],
  year: number,
  month: number,
  userName: string
): string {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = getMonthName(new Date(year, month));
  
  // Group tasks by date
  const tasksByDate: Record<string, any[]> = {};
  const projectStart = project.startDate ? new Date(project.startDate) : new Date();
  
  tasksList.forEach(task => {
    const taskDate = new Date(projectStart);
    taskDate.setDate(taskDate.getDate() + (task.dayNumber - 1));
    const dateKey = taskDate.toISOString().split("T")[0];
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    tasksByDate[dateKey].push(task);
  });

  // Generate calendar grid
  let calendarHTML = "";
  let dayCount = 1;
  const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;
  
  for (let i = 0; i < totalCells; i++) {
    if (i % 7 === 0) calendarHTML += '<tr>';
    
    if (i < firstDay || dayCount > daysInMonth) {
      // Empty cell
      const prevOrNextDay = i < firstDay 
        ? daysInMonth - (firstDay - i - 1) + (month === 0 ? -31 : 0)
        : dayCount - daysInMonth;
      calendarHTML += `<td class="other-month"><span class="day-num">${Math.abs(prevOrNextDay) || ""}</span></td>`;
    } else {
      // Current month day
      const currentDate = new Date(year, month, dayCount);
      const dateKey = currentDate.toISOString().split("T")[0];
      const dayTasks = tasksByDate[dateKey] || [];
      
      const tasksHTML = dayTasks.slice(0, 3).map(task => {
        const colors = TASK_COLORS[task.type || "ACTION"];
        return `
          <div class="task-item" style="background: ${colors.bg}; border-left: 3px solid ${colors.border};">
            <strong style="color: ${colors.text};">${task.title}</strong>
            <span class="task-desc">${task.description?.substring(0, 30) || ""}</span>
            <span class="task-type" style="color: ${colors.text};">${task.type || "ACTION"}</span>
          </div>
        `;
      }).join("");
      
      const moreCount = dayTasks.length > 3 ? `<div class="more-tasks">+${dayTasks.length - 3} mais</div>` : "";
      
      calendarHTML += `
        <td>
          <span class="day-num">${dayCount}</span>
          <div class="tasks-container">
            ${tasksHTML}
            ${moreCount}
          </div>
        </td>
      `;
      dayCount++;
    }
    
    if (i % 7 === 6) calendarHTML += '</tr>';
  }

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calendário Mensal - ${project.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #525252;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .page {
      width: 297mm;
      min-height: 210mm;
      background: ${COLORS.paper};
      padding: 15mm;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .header-stripe {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, ${COLORS.primary} 70%, ${COLORS.success} 70%);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-top: 10px;
    }
    
    .header-left h1 {
      font-size: 32pt;
      font-weight: 800;
      color: ${COLORS.primary};
      margin: 0;
      line-height: 1.1;
      letter-spacing: -0.5px;
    }
    
    .header-left h2 {
      font-size: 14pt;
      font-weight: 600;
      color: ${COLORS.secondary};
      margin-top: 5px;
    }
    
    .header-left .project-name {
      font-size: 10pt;
      color: ${COLORS.success};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 5px;
    }
    
    .header-right {
      text-align: right;
    }
    
    .header-right .logo {
      font-size: 14pt;
      font-weight: 700;
      color: ${COLORS.primary};
    }
    
    .header-right .logo span {
      color: ${COLORS.success};
    }
    
    .calendar-table {
      width: 100%;
      border-collapse: collapse;
      flex: 1;
    }
    
    .calendar-table th {
      background-color: ${COLORS.secondary};
      color: white;
      text-align: center;
      padding: 10px;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .calendar-table td {
      border: 1px solid ${COLORS.border};
      vertical-align: top;
      padding: 8px;
      height: 100px;
      width: 14.28%;
    }
    
    .calendar-table td.other-month {
      background: ${COLORS.subtle};
    }
    
    .calendar-table td.other-month .day-num {
      color: ${COLORS.textLight};
    }
    
    .day-num {
      font-size: 12pt;
      font-weight: 600;
      color: ${COLORS.text};
      display: block;
      margin-bottom: 5px;
    }
    
    .tasks-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .task-item {
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 7pt;
    }
    
    .task-item strong {
      display: block;
      font-weight: 600;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .task-desc {
      display: block;
      color: ${COLORS.textLight};
      font-size: 6pt;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .task-type {
      display: block;
      font-size: 6pt;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 2px;
    }
    
    .more-tasks {
      font-size: 7pt;
      color: ${COLORS.textLight};
      font-style: italic;
    }
    
    .footer {
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid ${COLORS.border};
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: ${COLORS.textLight};
    }
    
    .legend {
      display: flex;
      gap: 15px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
    
    @media print {
      body {
        padding: 0;
        background: none;
      }
      
      .page {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header-stripe"></div>
    
    <div class="header">
      <div class="header-left">
        <h1>${monthName}</h1>
        <h2>${year}</h2>
        <div class="project-name">${project.title}</div>
      </div>
      <div class="header-right">
        <div class="logo">Neuro<span>Plan</span></div>
      </div>
    </div>
    
    <table class="calendar-table">
      <thead>
        <tr>
          <th>DOM</th>
          <th>SEG</th>
          <th>TER</th>
          <th>QUA</th>
          <th>QUI</th>
          <th>SEX</th>
          <th>SÁB</th>
        </tr>
      </thead>
      <tbody>
        ${calendarHTML}
      </tbody>
    </table>
    
    <div class="footer">
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color" style="background: ${TASK_COLORS.ACTION.bg}; border: 1px solid ${TASK_COLORS.ACTION.border};"></div>
          <span>ACTION</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: ${TASK_COLORS.RETENTION.bg}; border: 1px solid ${TASK_COLORS.RETENTION.border};"></div>
          <span>RETENTION</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: ${TASK_COLORS.MAINTENANCE.bg}; border: 1px solid ${TASK_COLORS.MAINTENANCE.border};"></div>
          <span>MAINTENANCE</span>
        </div>
      </div>
      <div>${formatDateBR(new Date())} • ${userName}</div>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate Weekly Calendar HTML
function generateWeeklyCalendarHTML(
  project: any,
  tasksList: any[],
  weekStart: Date,
  userName: string
): string {
  const projectStart = project.startDate ? new Date(project.startDate) : new Date();
  
  // Get week dates
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    weekDates.push(date);
  }
  
  // Group tasks by date
  const tasksByDate: Record<string, any[]> = {};
  tasksList.forEach(task => {
    const taskDate = new Date(projectStart);
    taskDate.setDate(taskDate.getDate() + (task.dayNumber - 1));
    const dateKey = taskDate.toISOString().split("T")[0];
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    tasksByDate[dateKey].push(task);
  });

  const daysHTML = weekDates.map(date => {
    const dateKey = date.toISOString().split("T")[0];
    const dayTasks = tasksByDate[dateKey] || [];
    const dayName = getDayName(date);
    const dayNum = date.getDate();
    
    const tasksHTML = dayTasks.map(task => {
      const colors = TASK_COLORS[task.type || "ACTION"];
      return `
        <div class="task-card" style="border-left: 4px solid ${colors.border};">
          <div class="task-header">
            <span class="task-type" style="background: ${colors.bg}; color: ${colors.text};">${task.type || "ACTION"}</span>
            <span class="task-time">${task.estimatedMinutes || 25}min</span>
          </div>
          <h4>${task.title}</h4>
          <p>${task.description || ""}</p>
          <div class="task-checkbox">
            <input type="checkbox" ${task.completedAt ? "checked" : ""}>
            <label>Concluído</label>
          </div>
        </div>
      `;
    }).join("");
    
    return `
      <div class="day-column">
        <div class="day-header">
          <span class="day-name">${dayName}</span>
          <span class="day-number">${dayNum}</span>
        </div>
        <div class="day-content">
          ${tasksHTML || '<div class="no-tasks">Sem tarefas</div>'}
        </div>
      </div>
    `;
  }).join("");

  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calendário Semanal - ${project.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #525252;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .page {
      width: 297mm;
      min-height: 210mm;
      background: ${COLORS.paper};
      padding: 15mm;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      position: relative;
      overflow: hidden;
    }
    
    .header-stripe {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, ${COLORS.primary} 70%, ${COLORS.warning} 70%);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-top: 10px;
    }
    
    .header-left h1 {
      font-size: 24pt;
      font-weight: 800;
      color: ${COLORS.primary};
    }
    
    .header-left .date-range {
      font-size: 12pt;
      color: ${COLORS.secondary};
      margin-top: 5px;
    }
    
    .header-left .project-name {
      font-size: 10pt;
      color: ${COLORS.warning};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 5px;
    }
    
    .header-right .logo {
      font-size: 14pt;
      font-weight: 700;
      color: ${COLORS.primary};
    }
    
    .header-right .logo span {
      color: ${COLORS.success};
    }
    
    .week-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
    }
    
    .day-column {
      background: ${COLORS.subtle};
      border-radius: 8px;
      overflow: hidden;
    }
    
    .day-header {
      background: ${COLORS.primary};
      color: white;
      padding: 10px;
      text-align: center;
    }
    
    .day-name {
      display: block;
      font-size: 9pt;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .day-number {
      display: block;
      font-size: 18pt;
      font-weight: 700;
      margin-top: 2px;
    }
    
    .day-content {
      padding: 10px;
      min-height: 150px;
    }
    
    .task-card {
      background: white;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 8px;
    }
    
    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    
    .task-type {
      font-size: 7pt;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    
    .task-time {
      font-size: 8pt;
      color: ${COLORS.textLight};
    }
    
    .task-card h4 {
      font-size: 9pt;
      font-weight: 600;
      color: ${COLORS.text};
      margin-bottom: 4px;
    }
    
    .task-card p {
      font-size: 8pt;
      color: ${COLORS.textLight};
      line-height: 1.4;
      margin-bottom: 6px;
    }
    
    .task-checkbox {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 8pt;
      color: ${COLORS.textLight};
    }
    
    .task-checkbox input {
      width: 14px;
      height: 14px;
    }
    
    .no-tasks {
      text-align: center;
      color: ${COLORS.textLight};
      font-size: 9pt;
      padding: 20px;
    }
    
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid ${COLORS.border};
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: ${COLORS.textLight};
    }
    
    @media print {
      body {
        padding: 0;
        background: none;
      }
      
      .page {
        margin: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header-stripe"></div>
    
    <div class="header">
      <div class="header-left">
        <h1>Semana</h1>
        <div class="date-range">${formatDateBR(weekStart)} - ${formatDateBR(weekEndDate)}</div>
        <div class="project-name">${project.title}</div>
      </div>
      <div class="header-right">
        <div class="logo">Neuro<span>Plan</span></div>
      </div>
    </div>
    
    <div class="week-grid">
      ${daysHTML}
    </div>
    
    <div class="footer">
      <div>Gerado em ${formatDateBR(new Date())}</div>
      <div>${userName}</div>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate Daily Planner HTML
function generateDailyPlannerHTML(
  project: any,
  tasksList: any[],
  targetDate: Date,
  userName: string
): string {
  const projectStart = project.startDate ? new Date(project.startDate) : new Date();
  const dateKey = targetDate.toISOString().split("T")[0];
  
  // Filter tasks for this day
  const dayTasks = tasksList.filter(task => {
    const taskDate = new Date(projectStart);
    taskDate.setDate(taskDate.getDate() + (task.dayNumber - 1));
    return taskDate.toISOString().split("T")[0] === dateKey;
  });

  const dayName = targetDate.toLocaleDateString("pt-BR", { weekday: "long" });
  const dayNum = targetDate.getDate();
  const monthName = getMonthName(targetDate);

  const tasksHTML = dayTasks.map((task, index) => {
    const colors = TASK_COLORS[task.type || "ACTION"];
    return `
      <div class="task-row" style="border-left: 4px solid ${colors.border};">
        <div class="task-number">${index + 1}</div>
        <div class="task-info">
          <div class="task-header">
            <span class="task-type" style="background: ${colors.bg}; color: ${colors.text};">${task.type || "ACTION"}</span>
            <span class="task-duration">${task.estimatedMinutes || 25} min</span>
          </div>
          <h3>${task.title}</h3>
          <p>${task.description || "Sem descrição"}</p>
        </div>
        <div class="task-checkbox">
          <div class="checkbox ${task.completedAt ? "checked" : ""}"></div>
        </div>
      </div>
    `;
  }).join("");

  const totalMinutes = dayTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 25), 0);
  const actionCount = dayTasks.filter(t => t.type === "ACTION").length;
  const retentionCount = dayTasks.filter(t => t.type === "RETENTION").length;
  const maintenanceCount = dayTasks.filter(t => t.type === "MAINTENANCE").length;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planner Diário - ${project.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #525252;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      background: ${COLORS.paper};
      padding: 20mm;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      position: relative;
    }
    
    .header-stripe {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, ${COLORS.primary} 70%, ${COLORS.accent} 70%);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      padding-top: 10px;
    }
    
    .header-left .day-name {
      font-size: 14pt;
      font-weight: 500;
      color: ${COLORS.textLight};
      text-transform: capitalize;
    }
    
    .header-left .day-number {
      font-size: 48pt;
      font-weight: 800;
      color: ${COLORS.primary};
      line-height: 1;
    }
    
    .header-left .month-year {
      font-size: 14pt;
      font-weight: 600;
      color: ${COLORS.secondary};
      text-transform: capitalize;
    }
    
    .header-left .project-name {
      font-size: 10pt;
      color: ${COLORS.accent};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 10px;
    }
    
    .header-right {
      text-align: right;
    }
    
    .header-right .logo {
      font-size: 14pt;
      font-weight: 700;
      color: ${COLORS.primary};
    }
    
    .header-right .logo span {
      color: ${COLORS.success};
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    
    .stat-card {
      background: ${COLORS.subtle};
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    
    .stat-value {
      font-size: 24pt;
      font-weight: 700;
      color: ${COLORS.primary};
    }
    
    .stat-label {
      font-size: 9pt;
      color: ${COLORS.textLight};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .tasks-section h2 {
      font-size: 12pt;
      font-weight: 600;
      color: ${COLORS.secondary};
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .task-row {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      background: ${COLORS.subtle};
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 12px;
    }
    
    .task-number {
      width: 30px;
      height: 30px;
      background: ${COLORS.primary};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12pt;
      flex-shrink: 0;
    }
    
    .task-info {
      flex: 1;
    }
    
    .task-info .task-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    
    .task-type {
      font-size: 8pt;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    
    .task-duration {
      font-size: 9pt;
      color: ${COLORS.textLight};
    }
    
    .task-info h3 {
      font-size: 11pt;
      font-weight: 600;
      color: ${COLORS.text};
      margin-bottom: 5px;
    }
    
    .task-info p {
      font-size: 9pt;
      color: ${COLORS.textLight};
      line-height: 1.5;
    }
    
    .task-checkbox {
      flex-shrink: 0;
    }
    
    .checkbox {
      width: 24px;
      height: 24px;
      border: 2px solid ${COLORS.border};
      border-radius: 4px;
    }
    
    .checkbox.checked {
      background: ${COLORS.success};
      border-color: ${COLORS.success};
    }
    
    .checkbox.checked::after {
      content: "✓";
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-weight: bold;
    }
    
    .notes-section {
      margin-top: 25px;
    }
    
    .notes-section h2 {
      font-size: 12pt;
      font-weight: 600;
      color: ${COLORS.secondary};
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .notes-area {
      background: ${COLORS.subtle};
      border-radius: 8px;
      padding: 15px;
      min-height: 100px;
    }
    
    .notes-area .line {
      border-bottom: 1px dashed ${COLORS.border};
      height: 25px;
    }
    
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid ${COLORS.border};
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: ${COLORS.textLight};
    }
    
    @media print {
      body {
        padding: 0;
        background: none;
      }
      
      .page {
        margin: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header-stripe"></div>
    
    <div class="header">
      <div class="header-left">
        <div class="day-name">${dayName}</div>
        <div class="day-number">${dayNum}</div>
        <div class="month-year">${monthName} ${targetDate.getFullYear()}</div>
        <div class="project-name">${project.title}</div>
      </div>
      <div class="header-right">
        <div class="logo">Neuro<span>Plan</span></div>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${dayTasks.length}</div>
        <div class="stat-label">Tarefas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: ${COLORS.success};">${actionCount}</div>
        <div class="stat-label">Action</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: ${COLORS.warning};">${retentionCount}</div>
        <div class="stat-label">Retention</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}m</div>
        <div class="stat-label">Tempo Total</div>
      </div>
    </div>
    
    <div class="tasks-section">
      <h2>Tarefas do Dia</h2>
      ${tasksHTML || '<div class="task-row"><div class="task-info"><p>Nenhuma tarefa programada para este dia.</p></div></div>'}
    </div>
    
    <div class="notes-section">
      <h2>Anotações</h2>
      <div class="notes-area">
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
    </div>
    
    <div class="footer">
      <div>Gerado em ${formatDateBR(new Date())}</div>
      <div>${userName}</div>
    </div>
  </div>
</body>
</html>
  `;
}

// Export router
export const calendarExportRouter = router({
  // Generate monthly calendar
  monthly: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      year: z.number(),
      month: z.number().min(0).max(11),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [project] = await db
        .select()
        .from(projects)
        .where(and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (!project) throw new Error("Projeto não encontrado");
      
      const tasksList = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, input.projectId))
        .orderBy(asc(tasks.dayNumber), asc(tasks.position));
      
      const html = generateMonthlyCalendarHTML(
        project,
        tasksList,
        input.year,
        input.month,
        ctx.user.name || "Usuário"
      );
      
      return { html, filename: `calendario-mensal-${input.year}-${input.month + 1}.html` };
    }),

  // Generate weekly calendar
  weekly: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      weekStart: z.string(), // ISO date string
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [project] = await db
        .select()
        .from(projects)
        .where(and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (!project) throw new Error("Projeto não encontrado");
      
      const tasksList = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, input.projectId))
        .orderBy(asc(tasks.dayNumber), asc(tasks.position));
      
      const weekStart = new Date(input.weekStart);
      const html = generateWeeklyCalendarHTML(
        project,
        tasksList,
        weekStart,
        ctx.user.name || "Usuário"
      );
      
      return { html, filename: `calendario-semanal-${input.weekStart}.html` };
    }),

  // Generate daily planner
  daily: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      date: z.string(), // ISO date string
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [project] = await db
        .select()
        .from(projects)
        .where(and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (!project) throw new Error("Projeto não encontrado");
      
      const tasksList = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, input.projectId))
        .orderBy(asc(tasks.dayNumber), asc(tasks.position));
      
      const targetDate = new Date(input.date);
      const html = generateDailyPlannerHTML(
        project,
        tasksList,
        targetDate,
        ctx.user.name || "Usuário"
      );
      
      return { html, filename: `planner-diario-${input.date}.html` };
    }),
});

export default calendarExportRouter;
