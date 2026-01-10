/**
 * Export Service
 * Generates PDF exports in multiple formats:
 * - Mental Plan One-Page
 * - Post-its for cutting
 * - Project One-Page
 * - iCal calendar code
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { projects, tasks, dailyLogs } from "../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";

// Helper to format date in Brazilian format
function formatDateBR(date: Date | null): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Helper to format time
function formatTime(date: Date | null): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Cycle duration in days
const cycleDurationDays: Record<string, number> = {
  DAYS_3: 3,
  DAYS_7: 7,
  DAYS_14: 14,
};

// Generate iCal format for calendar import
function generateICalEvent(
  task: any,
  project: any,
  startDate: Date
): string {
  const taskDate = new Date(startDate);
  taskDate.setDate(taskDate.getDate() + (task.dayNumber - 1));
  
  const endDate = new Date(taskDate);
  endDate.setHours(endDate.getHours() + 1);
  
  const uid = `task-${task.id}@neuroplan.app`;
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dtstart = taskDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dtend = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${task.title}
DESCRIPTION:${task.description || "Tarefa do projeto " + project.title}\\nTipo: ${task.type}\\nDia ${task.dayNumber} - Posição ${task.position}
CATEGORIES:NeuroExecução,${project.title}
STATUS:${task.completedAt ? "COMPLETED" : "NEEDS-ACTION"}
END:VEVENT`;
}

// Generate full iCal file content
function generateICalFile(projectData: any, tasksData: any[]): string {
  const startDate = projectData.startDate ? new Date(projectData.startDate) : new Date();
  
  const events = tasksData.map(task => generateICalEvent(task, projectData, startDate)).join("\n");
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NeuroExecução//Projeto ${projectData.title}//PT-BR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:NeuroExecução - ${projectData.title}
X-WR-TIMEZONE:America/Sao_Paulo
${events}
END:VCALENDAR`;
}

// Generate HTML for Mental Plan One-Page
function generateMentalPlanHTML(project: any, tasksList: any[], userName: string): string {
  const startDate = project.startDate ? new Date(project.startDate) : new Date();
  const cycleDays = cycleDurationDays[project.cycleDuration || "DAYS_3"];
  
  // Group tasks by day
  const tasksByDay: Record<number, any[]> = {};
  tasksList.forEach(task => {
    if (!tasksByDay[task.dayNumber]) {
      tasksByDay[task.dayNumber] = [];
    }
    tasksByDay[task.dayNumber].push(task);
  });

  const daysHTML = Object.entries(tasksByDay)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([dayNum, dayTasks]) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + Number(dayNum) - 1);
      
      const tasksHTML = dayTasks
        .sort((a, b) => a.position - b.position)
        .map(task => `
          <div class="task ${task.type?.toLowerCase() || 'action'}">
            <span class="task-type">${task.type || 'ACTION'}</span>
            <span class="task-title">${task.title}</span>
            <span class="task-checkbox">${task.completedAt ? '✓' : '○'}</span>
          </div>
        `).join("");
      
      return `
        <div class="day-column">
          <div class="day-header">
            <span class="day-number">D${dayNum}</span>
            <span class="day-date">${formatDateBR(dayDate)}</span>
          </div>
          <div class="tasks-list">
            ${tasksHTML}
          </div>
        </div>
      `;
    }).join("");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plano Mental - ${project.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #f8f9fa;
      padding: 20px;
      color: #1a1a1a;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      padding: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .header-left h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .header-left .subtitle {
      color: #22C55E;
      font-size: 14px;
      font-weight: 500;
    }
    
    .header-right {
      text-align: right;
    }
    
    .header-right .user-name {
      font-size: 14px;
      color: #a0a0a0;
    }
    
    .header-right .date {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    
    .meta-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      padding: 24px 32px;
      background: #f8f9fa;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .meta-item {
      text-align: center;
    }
    
    .meta-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .meta-value {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .deliverables {
      padding: 24px 32px;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .deliverables h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #1a1a1a;
    }
    
    .deliverables-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .deliverable {
      padding: 16px;
      border-radius: 8px;
      background: #f8f9fa;
    }
    
    .deliverable.a { border-left: 4px solid #22C55E; }
    .deliverable.b { border-left: 4px solid #F59E0B; }
    .deliverable.c { border-left: 4px solid #8B5CF6; }
    
    .deliverable-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .deliverable.a .deliverable-label { color: #22C55E; }
    .deliverable.b .deliverable-label { color: #F59E0B; }
    .deliverable.c .deliverable-label { color: #8B5CF6; }
    
    .deliverable-text {
      font-size: 13px;
      color: #444;
      line-height: 1.5;
    }
    
    .days-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 24px 32px;
    }
    
    .day-column {
      background: #f8f9fa;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .day-header {
      background: #1a1a1a;
      color: white;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .day-number {
      font-weight: 700;
      font-size: 16px;
    }
    
    .day-date {
      font-size: 12px;
      color: #a0a0a0;
    }
    
    .tasks-list {
      padding: 12px;
    }
    
    .task {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 13px;
    }
    
    .task:last-child {
      margin-bottom: 0;
    }
    
    .task-type {
      font-size: 9px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    
    .task.action .task-type {
      background: #22C55E20;
      color: #22C55E;
    }
    
    .task.retention .task-type {
      background: #F59E0B20;
      color: #F59E0B;
    }
    
    .task.maintenance .task-type {
      background: #8B5CF620;
      color: #8B5CF6;
    }
    
    .task-title {
      flex: 1;
      color: #333;
    }
    
    .task-checkbox {
      font-size: 16px;
      color: #22C55E;
    }
    
    .footer {
      padding: 16px 32px;
      background: #f8f9fa;
      text-align: center;
      font-size: 11px;
      color: #666;
    }
    
    .footer .logo {
      font-weight: 700;
      color: #22C55E;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .container {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h1>${project.title}</h1>
        <div class="subtitle">Plano Mental One-Page</div>
      </div>
      <div class="header-right">
        <div class="user-name">${userName}</div>
        <div class="date">Gerado em ${formatDateBR(new Date())}</div>
      </div>
    </div>
    
    <div class="meta-section">
      <div class="meta-item">
        <div class="meta-label">Categoria</div>
        <div class="meta-value">${project.category || "PERSONAL"}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Ciclo</div>
        <div class="meta-value">${cycleDays} dias</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Início</div>
        <div class="meta-value">${formatDateBR(project.startDate)}</div>
      </div>
    </div>
    
    <div class="deliverables">
      <h3>Entregas Anti-Perfeccionismo</h3>
      <div class="deliverables-grid">
        <div class="deliverable a">
          <div class="deliverable-label">A - Mínimo Aceitável</div>
          <div class="deliverable-text">${project.deliverableA || "Não definido"}</div>
        </div>
        <div class="deliverable b">
          <div class="deliverable-label">B - Ideal</div>
          <div class="deliverable-text">${project.deliverableB || "Não definido"}</div>
        </div>
        <div class="deliverable c">
          <div class="deliverable-label">C - Excepcional</div>
          <div class="deliverable-text">${project.deliverableC || "Não definido"}</div>
        </div>
      </div>
    </div>
    
    <div class="days-grid">
      ${daysHTML}
    </div>
    
    <div class="footer">
      Gerado por <span class="logo">NeuroExecução</span> • Seu parceiro de execução neuroadaptado
    </div>
  </div>
</body>
</html>
  `;
}

// Generate HTML for Post-its (printable and cuttable)
function generatePostItsHTML(project: any, tasksList: any[]): string {
  const startDate = project.startDate ? new Date(project.startDate) : new Date();
  
  const postItsHTML = tasksList
    .sort((a, b) => a.dayNumber - b.dayNumber || a.position - b.position)
    .map(task => {
      const taskDate = new Date(startDate);
      taskDate.setDate(taskDate.getDate() + task.dayNumber - 1);
      
      const typeColors: Record<string, { bg: string; border: string; text: string }> = {
        ACTION: { bg: "#22C55E15", border: "#22C55E", text: "#166534" },
        RETENTION: { bg: "#F59E0B15", border: "#F59E0B", text: "#92400E" },
        MAINTENANCE: { bg: "#8B5CF615", border: "#8B5CF6", text: "#5B21B6" },
      };
      
      const colors = typeColors[task.type || "ACTION"];
      
      return `
        <div class="postit" style="background: ${colors.bg}; border-color: ${colors.border};">
          <div class="postit-header">
            <span class="postit-day">D${task.dayNumber}</span>
            <span class="postit-date">${formatDateBR(taskDate)}</span>
          </div>
          <div class="postit-type" style="color: ${colors.text};">${task.type || "ACTION"}</div>
          <div class="postit-title">${task.title}</div>
          <div class="postit-checkbox">☐</div>
          <div class="postit-project">${project.title}</div>
        </div>
      `;
    }).join("");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post-its - ${project.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #f8f9fa;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .header h1 {
      font-size: 24px;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .header p {
      font-size: 14px;
      color: #666;
    }
    
    .postits-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .postit {
      aspect-ratio: 1;
      padding: 16px;
      border-radius: 4px;
      border-left: 6px solid;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
    }
    
    .postit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .postit-day {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .postit-date {
      font-size: 11px;
      color: #666;
    }
    
    .postit-type {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .postit-title {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
      line-height: 1.4;
    }
    
    .postit-checkbox {
      position: absolute;
      bottom: 16px;
      right: 16px;
      font-size: 24px;
      color: #ccc;
    }
    
    .postit-project {
      font-size: 10px;
      color: #999;
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px dashed #ddd;
    }
    
    .cut-guide {
      text-align: center;
      margin-top: 24px;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      font-size: 12px;
      color: #666;
    }
    
    .cut-guide strong {
      color: #1a1a1a;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .postits-grid {
        gap: 0;
      }
      
      .postit {
        border: 1px dashed #ccc;
        border-left: 6px solid;
        border-radius: 0;
        box-shadow: none;
        page-break-inside: avoid;
      }
      
      .cut-guide {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🗒️ Post-its para Recortar</h1>
    <p>${project.title} • ${tasksList.length} tarefas</p>
  </div>
  
  <div class="postits-grid">
    ${postItsHTML}
  </div>
  
  <div class="cut-guide">
    <strong>✂️ Dica:</strong> Imprima esta página e recorte cada post-it pelas linhas pontilhadas. 
    Cole em seu quadro, agenda ou monitor para visualização física das tarefas.
  </div>
</body>
</html>
  `;
}

// Generate HTML for Project One-Page (corporate style)
function generateProjectOnePage(project: any, tasksList: any[], userName: string, companyName?: string): string {
  const startDate = project.startDate ? new Date(project.startDate) : new Date();
  const cycleDays = cycleDurationDays[project.cycleDuration || "DAYS_3"];
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + cycleDays);
  
  const completedTasks = tasksList.filter(t => t.completedAt).length;
  const progress = tasksList.length > 0 ? Math.round((completedTasks / tasksList.length) * 100) : 0;
  
  // Group tasks by type
  const actionTasks = tasksList.filter(t => t.type === "ACTION" || !t.type);
  const retentionTasks = tasksList.filter(t => t.type === "RETENTION");
  
  const tasksTableHTML = tasksList
    .sort((a, b) => a.dayNumber - b.dayNumber || a.position - b.position)
    .map(task => {
      const taskDate = new Date(startDate);
      taskDate.setDate(taskDate.getDate() + task.dayNumber - 1);
      
      return `
        <tr>
          <td class="day-cell">D${task.dayNumber}</td>
          <td class="date-cell">${formatDateBR(taskDate)}</td>
          <td class="type-cell ${(task.type || 'ACTION').toLowerCase()}">${task.type || 'ACTION'}</td>
          <td class="title-cell">${task.title}</td>
          <td class="status-cell">${task.completedAt ? '✓ Concluída' : '○ Pendente'}</td>
        </tr>
      `;
    }).join("");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Projeto One-Page - ${project.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: white;
      padding: 40px;
      color: #1a1a1a;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 3px solid #1a1a1a;
      margin-bottom: 32px;
    }
    
    .company-info {
      text-align: right;
    }
    
    .company-name {
      font-size: 14px;
      font-weight: 600;
      color: #666;
    }
    
    .document-date {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
    
    .project-title {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .project-subtitle {
      font-size: 14px;
      color: #22C55E;
      font-weight: 500;
    }
    
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .meta-box {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      text-align: center;
    }
    
    .meta-box.highlight {
      background: #22C55E;
      color: white;
    }
    
    .meta-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .meta-box.highlight .meta-label {
      color: rgba(255,255,255,0.8);
    }
    
    .meta-value {
      font-size: 24px;
      font-weight: 700;
    }
    
    .section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e5e5;
    }
    
    .deliverables-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .deliverable-box {
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e5e5e5;
    }
    
    .deliverable-box.a { border-left: 4px solid #22C55E; }
    .deliverable-box.b { border-left: 4px solid #F59E0B; }
    .deliverable-box.c { border-left: 4px solid #8B5CF6; }
    
    .deliverable-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .deliverable-box.a .deliverable-label { color: #22C55E; }
    .deliverable-box.b .deliverable-label { color: #F59E0B; }
    .deliverable-box.c .deliverable-label { color: #8B5CF6; }
    
    .deliverable-text {
      font-size: 13px;
      color: #444;
      line-height: 1.5;
    }
    
    .tasks-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    
    .tasks-table th {
      background: #1a1a1a;
      color: white;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .tasks-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .tasks-table tr:nth-child(even) {
      background: #f8f9fa;
    }
    
    .day-cell {
      font-weight: 600;
      width: 60px;
    }
    
    .date-cell {
      color: #666;
      width: 100px;
    }
    
    .type-cell {
      width: 100px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .type-cell.action { color: #22C55E; }
    .type-cell.retention { color: #F59E0B; }
    .type-cell.maintenance { color: #8B5CF6; }
    
    .title-cell {
      font-weight: 500;
    }
    
    .status-cell {
      width: 120px;
      font-size: 12px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #666;
    }
    
    .footer-logo {
      font-weight: 700;
      color: #22C55E;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .tasks-table {
        font-size: 11px;
      }
      
      .tasks-table th,
      .tasks-table td {
        padding: 8px 12px;
      }
    }
  </style>
</head>
<body>
  <div class="document-header">
    <div>
      <h1 class="project-title">${project.title}</h1>
      <div class="project-subtitle">Plano de Execução One-Page</div>
    </div>
    <div class="company-info">
      ${companyName ? `<div class="company-name">${companyName}</div>` : ''}
      <div class="document-date">Responsável: ${userName}</div>
      <div class="document-date">Gerado em ${formatDateBR(new Date())}</div>
    </div>
  </div>
  
  <div class="meta-grid">
    <div class="meta-box">
      <div class="meta-label">Início</div>
      <div class="meta-value">${formatDateBR(startDate)}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Término</div>
      <div class="meta-value">${formatDateBR(endDate)}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Tarefas</div>
      <div class="meta-value">${completedTasks}/${tasksList.length}</div>
    </div>
    <div class="meta-box highlight">
      <div class="meta-label">Progresso</div>
      <div class="meta-value">${progress}%</div>
    </div>
  </div>
  
  <div class="section">
    <h2 class="section-title">Entregas Definidas</h2>
    <div class="deliverables-row">
      <div class="deliverable-box a">
        <div class="deliverable-label">A - Mínimo Aceitável</div>
        <div class="deliverable-text">${project.deliverableA || "Não definido"}</div>
      </div>
      <div class="deliverable-box b">
        <div class="deliverable-label">B - Ideal</div>
        <div class="deliverable-text">${project.deliverableB || "Não definido"}</div>
      </div>
      <div class="deliverable-box c">
        <div class="deliverable-label">C - Excepcional</div>
        <div class="deliverable-text">${project.deliverableC || "Não definido"}</div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <h2 class="section-title">Cronograma de Tarefas</h2>
    <table class="tasks-table">
      <thead>
        <tr>
          <th>Dia</th>
          <th>Data</th>
          <th>Tipo</th>
          <th>Tarefa</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tasksTableHTML}
      </tbody>
    </table>
  </div>
  
  <div class="footer">
    <div>
      Documento gerado automaticamente por <span class="footer-logo">NeuroExecução</span>
    </div>
    <div>
      Metodologia baseada em Russell Barkley • Ciclos de ${cycleDays} dias
    </div>
  </div>
</body>
</html>
  `;
}

export const exportRouter = router({
  // Get project data for export
  getProjectForExport: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const projectData = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.projectId), eq(projects.userId, ctx.user.id)))
        .limit(1);
      
      if (projectData.length === 0) {
        throw new Error("Projeto não encontrado");
      }
      
      const tasksData = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, input.projectId))
        .orderBy(asc(tasks.dayNumber), asc(tasks.position));
      
      return {
        project: projectData[0],
        tasks: tasksData,
      };
    }),
  
  // Generate Mental Plan One-Page HTML
  generateMentalPlan: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const projectData = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.projectId), eq(projects.userId, ctx.user.id)))
        .limit(1);
      
      if (projectData.length === 0) {
        throw new Error("Projeto não encontrado");
      }
      
      const tasksData = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, input.projectId))
        .orderBy(asc(tasks.dayNumber), asc(tasks.position));
      
      const html = generateMentalPlanHTML(
        projectData[0],
        tasksData,
        ctx.user.name || "Usuário"
      );
      
      return { html, filename: `plano-mental-${projectData[0].title.toLowerCase().replace(/\s+/g, "-")}.html` };
    }),
  
  // Generate Post-its HTML
  generatePostIts: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const projectData = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.projectId), eq(projects.userId, ctx.user.id)))
        .limit(1);
      
      if (projectData.length === 0) {
        throw new Error("Projeto não encontrado");
      }
      
      const tasksData = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, input.projectId))
        .orderBy(asc(tasks.dayNumber), asc(tasks.position));
      
      const html = generatePostItsHTML(projectData[0], tasksData);
      
      return { html, filename: `postits-${projectData[0].title.toLowerCase().replace(/\s+/g, "-")}.html` };
    }),
  
  // Generate Project One-Page HTML
  generateProjectOnePage: protectedProcedure
    .input(z.object({ 
      projectId: z.number(),
      companyName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const projectData = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.projectId), eq(projects.userId, ctx.user.id)))
        .limit(1);
      
      if (projectData.length === 0) {
        throw new Error("Projeto não encontrado");
      }
      
      const tasksData = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, input.projectId))
        .orderBy(asc(tasks.dayNumber), asc(tasks.position));
      
      const html = generateProjectOnePage(
        projectData[0],
        tasksData,
        ctx.user.name || "Usuário",
        input.companyName
      );
      
      return { html, filename: `projeto-${projectData[0].title.toLowerCase().replace(/\s+/g, "-")}.html` };
    }),
  
  // Generate iCal file
  generateICal: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const projectData = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.projectId), eq(projects.userId, ctx.user.id)))
        .limit(1);
      
      if (projectData.length === 0) {
        throw new Error("Projeto não encontrado");
      }
      
      const tasksData = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, input.projectId))
        .orderBy(asc(tasks.dayNumber), asc(tasks.position));
      
      const ical = generateICalFile(projectData[0], tasksData);
      
      return { 
        ical, 
        filename: `neuroplan-${projectData[0].title.toLowerCase().replace(/\s+/g, "-")}.ics` 
      };
    }),
});
