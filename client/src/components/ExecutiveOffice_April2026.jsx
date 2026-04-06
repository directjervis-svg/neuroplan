import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  AlertTriangle, CheckCircle2, Circle, Clock, LayoutDashboard,
  Target, Activity, ShieldAlert, Ban, Briefcase, Zap, ListX,
  RefreshCcw, Calendar, BookOpen, Layers, ChevronRight, ChevronDown,
  Plus, X, Download, MessageSquare, Send, Loader2, StickyNote,
  Trash2, GraduationCap, Save, FileText, Sparkles
} from "lucide-react";

// ── P2: DYNAMIC DATE ──────────────────────────────────────────────────────────
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const parseDateStr = s => new Date(s + "T00:00:00");
const daysBetween = (a, b) => Math.round((b - a) / 86400000);
const getSprintStatus = s => {
  const start = parseDateStr(s.startDate), end = parseDateStr(s.endDate);
  if (TODAY < start) return "upcoming";
  if (TODAY > end) return "completed";
  return "active";
};
const daysRemaining = s => Math.max(0, daysBetween(TODAY, parseDateStr(s.endDate)) + 1);
const dayOfSprint = s => Math.max(1, daysBetween(parseDateStr(s.startDate), TODAY) + 1);
const todayStr = TODAY.toISOString().split("T")[0];
const todayDisplay = `${String(TODAY.getDate()).padStart(2,"0")}/${String(TODAY.getMonth()+1).padStart(2,"0")}`;

// ── LIVE CLOCK COMPONENT ──────────────────────────────────────────────────────
const LiveClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const yr = now.getFullYear();
  const weekday = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][now.getDay()];
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-1.5 select-none">
      <Clock className="w-3 h-3 text-emerald-400" />
      <span className="text-emerald-400 font-bold tabular-nums">{hh}:{mm}<span className="animate-pulse">:</span>{ss}</span>
      <span className="text-slate-500">·</span>
      <span>{weekday} {dd}/{mo}/{yr}</span>
    </div>
  );
};

const NEXT_STATUS = { not_started: "in_progress", in_progress: "done", done: "not_started", blocked: "not_started" };
const STATUS_CFG = {
  not_started: { label: "A Fazer",       icon: Circle,       cls: "text-slate-500 bg-slate-100 border border-slate-200" },
  in_progress: { label: "Em Andamento",  icon: Clock,        cls: "text-amber-700 bg-amber-50 border border-amber-300" },
  blocked:     { label: "Bloqueado",     icon: ShieldAlert,  cls: "text-red-700 bg-red-50 border border-red-300" },
  done:        { label: "Concluído",     icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border border-emerald-300" }
};
const PLATFORM_COLOR = {
  "LinkedIn Learning": "bg-blue-100 text-blue-800 border border-blue-200",
  "Microsoft Learn":   "bg-cyan-100 text-cyan-800 border border-cyan-200",
  "Coursera":          "bg-violet-100 text-violet-800 border border-violet-200",
  "EmergenTeck":       "bg-orange-100 text-orange-800 border border-orange-200",
  "Consolidação":      "bg-slate-100 text-slate-500 border border-slate-200",
  "Revisão curta":     "bg-slate-100 text-slate-500 border border-slate-200",
  "Revisão leve":      "bg-slate-100 text-slate-500 border border-slate-200",
  "Todos":             "bg-slate-100 text-slate-500 border border-slate-200",
  "Nenhum":            "bg-slate-100 text-slate-400 border border-slate-200",
};

// ── DATA (unchanged) ──────────────────────────────────────────────────────────
const SPRINTS = [
  {
    id:"SP-1", name:"Sprint 1", subtitle:"Fundamentos e corte",
    period:"01/04 – 04/04", startDate:"2026-04-01", endDate:"2026-04-04",
    goal:"Fechar o recorte do mês e iniciar a base conceitual mínima para stack + editorial.",
    deliverables:["Lista do que entra e sai de abril","Rascunho da stack mínima","Rascunho inicial da linha editorial","Mapa inicial do workflow"],
    courses:[
      {name:"Intelligent Automation Foundations",platform:"LinkedIn Learning",focus:"Vocabulário-base, componentes de automação inteligente, limites entre IA, RPA e workflow"},
      {name:"Hyperautomation with insights from process mining",platform:"Microsoft Learn",focus:"Visão de processo, gargalos, rastreabilidade e melhoria de fluxo"}
    ],
    hours:{stack:5,editorial:4,workflow:3,admin:4,total:16},
    days:[
      {date:"2026-04-01",display:"01/04",dayName:"Qua",critical:{id:"S1D1C",title:"Definir escopo de abril",status:"in_progress"},secondary:[{id:"S1D1S1",title:"Listar o que fica fora",status:"not_started"},{id:"S1D1S2",title:"Abrir trilha de notas dos cursos (LinkedIn L.)",status:"not_started"}],course:"LinkedIn Learning",notToDo:["Blog","Design","Agente"]},
      {date:"2026-04-02",display:"02/04",dayName:"Qui",critical:{id:"S1D2C",title:"Rascunhar stack mínima",status:"not_started"},secondary:[{id:"S1D2S1",title:"Extrair conceitos úteis do Microsoft Learn",status:"not_started"},{id:"S1D2S2",title:"Registrar dependências",status:"not_started"}],course:"Microsoft Learn",notToDo:[]},
      {date:"2026-04-03",display:"03/04",dayName:"Sex",critical:{id:"S1D3C",title:"Rascunhar linha editorial mínima",status:"not_started"},secondary:[{id:"S1D3S1",title:"Definir público inicial",status:"not_started"},{id:"S1D3S2",title:"Definir 3 pilares",status:"not_started"}],course:"LinkedIn Learning",notToDo:[]},
      {date:"2026-04-04",display:"04/04",dayName:"Sáb",critical:{id:"S1D4C",title:"Mapear workflow v0 em alto nível",status:"not_started"},secondary:[{id:"S1D4S1",title:"Registrar entradas e saídas",status:"not_started"},{id:"S1D4S2",title:"Revisão semanal curta",status:"not_started"}],course:"Microsoft Learn",notToDo:[]}
    ]
  },
  {
    id:"SP-2",name:"Sprint 2",subtitle:"Fechamento da base",
    period:"06/04 – 11/04",startDate:"2026-04-06",endDate:"2026-04-11",
    goal:"Fechar os 3 artefatos-base em versão v1.",
    deliverables:["Stack mínima aplicada fechada","Linha editorial mínima fechada","Workflow editorial manual v0 desenhado","1 dry run iniciado"],
    courses:[
      {name:"Intelligent Automation Foundations",platform:"LinkedIn Learning",focus:"Concluir os módulos essenciais"},
      {name:"Hyperautomation with insights from process mining",platform:"Microsoft Learn",focus:"Concluir os módulos centrais"},
      {name:"Hyperautomation with Salesforce Ecosystem",platform:"Coursera",focus:"Apenas blocos de orquestração, integração e automação de fluxo"}
    ],
    hours:{stack:8,editorial:6,workflow:4,admin:6,total:24},
    days:[
      {date:"2026-04-06",display:"06/04",dayName:"Seg",critical:{id:"S2D1C",title:"Fechar stack mínima v1",status:"not_started"},secondary:[{id:"S2D1S1",title:"Decidir ferramenta/fluxo mínimo",status:"not_started"},{id:"S2D1S2",title:"Pendência administrativa crítica",status:"not_started"}],course:"LinkedIn Learning",notToDo:[]},
      {date:"2026-04-07",display:"07/04",dayName:"Ter",critical:{id:"S2D2C",title:"Consolidar stack mínima aplicada",status:"not_started"},secondary:[{id:"S2D2S1",title:"Definir padrão de prompt/eval",status:"not_started"},{id:"S2D2S2",title:"Registrar o que foi excluído",status:"not_started"}],course:"Microsoft Learn",notToDo:[]},
      {date:"2026-04-08",display:"08/04",dayName:"Qua",critical:{id:"S2D3C",title:"Fechar linha editorial mínima",status:"not_started"},secondary:[{id:"S2D3S1",title:"Função de cada canal",status:"not_started"},{id:"S2D3S2",title:"Critérios mínimos de publicação",status:"not_started"}],course:"Coursera",notToDo:[]},
      {date:"2026-04-09",display:"09/04",dayName:"Qui",critical:{id:"S2D4C",title:"Desenhar workflow editorial manual v0",status:"not_started"},secondary:[{id:"S2D4S1",title:"Definir etapa de revisão",status:"not_started"},{id:"S2D4S2",title:"Checklist de entrada",status:"not_started"}],course:"Coursera",notToDo:[]},
      {date:"2026-04-10",display:"10/04",dayName:"Sex",critical:{id:"S2D5C",title:"Preparar dry run",status:"not_started"},secondary:[{id:"S2D5S1",title:"Montar caso editorial simples",status:"not_started"},{id:"S2D5S2",title:"Registrar riscos",status:"not_started"}],course:"Microsoft Learn",notToDo:[]},
      {date:"2026-04-11",display:"11/04",dayName:"Sáb",critical:{id:"S2D6C",title:"Executar dry run v0",status:"not_started"},secondary:[{id:"S2D6S1",title:"Anotar gargalos",status:"not_started"},{id:"S2D6S2",title:"Revisão semanal",status:"not_started"}],course:"Revisão curta",notToDo:[]}
    ]
  },
  {
    id:"SP-3",name:"Sprint 3",subtitle:"Aplicação controlada",
    period:"13/04 – 18/04",startDate:"2026-04-13",endDate:"2026-04-18",
    goal:"Transformar os artefatos-base em um caso editorial simples e testável.",
    deliverables:["1 caso editorial simples definido","Checklist de entrada e saída","Critérios de revisão","Registro de gargalos do workflow"],
    courses:[
      {name:"Intelligent Automation Training: Master AI & RPA",platform:"EmergenTeck",focus:"Blocos aplicáveis ao fluxo mínimo, automação futura"},
      {name:"Hyperautomation with Salesforce Ecosystem",platform:"Coursera",focus:"Continuidade seletiva — foco em integração/orquestração"}
    ],
    hours:{stack:6,editorial:4,workflow:8,admin:6,total:24},
    days:[
      {date:"2026-04-13",display:"13/04",dayName:"Seg",critical:{id:"S3D1C",title:"Escolher 1 caso editorial simples",status:"not_started"},secondary:[{id:"S3D1S1",title:"Definir objetivo do caso",status:"not_started"},{id:"S3D1S2",title:"Organizar materiais de entrada",status:"not_started"}],course:"EmergenTeck",notToDo:[]},
      {date:"2026-04-14",display:"14/04",dayName:"Ter",critical:{id:"S3D2C",title:"Rodar o fluxo no caso escolhido",status:"not_started"},secondary:[{id:"S3D2S1",title:"Medir tempo por etapa",status:"not_started"},{id:"S3D2S2",title:"Revisar padrão de saída",status:"not_started"}],course:"Coursera",notToDo:[]},
      {date:"2026-04-15",display:"15/04",dayName:"Qua",critical:{id:"S3D3C",title:"Ajustar workflow após primeiro uso real",status:"not_started"},secondary:[{id:"S3D3S1",title:"Cortar etapas desnecessárias",status:"not_started"},{id:"S3D3S2",title:"Refinar checklist",status:"not_started"}],course:"EmergenTeck",notToDo:[]},
      {date:"2026-04-16",display:"16/04",dayName:"Qui",critical:{id:"S3D4C",title:"Refinar critérios de qualidade editorial",status:"not_started"},secondary:[{id:"S3D4S1",title:"Validar alinhamento com pilares",status:"not_started"},{id:"S3D4S2",title:"Revisar prompt/eval",status:"not_started"}],course:"EmergenTeck",notToDo:[]},
      {date:"2026-04-17",display:"17/04",dayName:"Sex",critical:{id:"S3D5C",title:"Executar segundo ciclo curto do caso",status:"not_started"},secondary:[{id:"S3D5S1",title:"Validar consistência",status:"not_started"},{id:"S3D5S2",title:"Registrar pontos de automação futura",status:"not_started"}],course:"Coursera",notToDo:[]},
      {date:"2026-04-18",display:"18/04",dayName:"Sáb",critical:{id:"S3D6C",title:"Revisão do sprint",status:"not_started"},secondary:[{id:"S3D6S1",title:"Priorizar gargalos",status:"not_started"},{id:"S3D6S2",title:"Definir ajustes do sprint 4",status:"not_started"}],course:"Revisão leve",notToDo:[]}
    ]
  },
  {
    id:"SP-4",name:"Sprint 4",subtitle:"Consolidação operacional",
    period:"20/04 – 25/04",startDate:"2026-04-20",endDate:"2026-04-25",
    goal:"Estabilizar o processo e decidir o que vira rotina e o que volta para backlog.",
    deliverables:["Workflow v1 ajustado","Checklist operacional enxuto","Padrão mínimo de prompt/eval","Decisão documentada sobre o que será repetível em maio"],
    courses:[
      {name:"Intelligent Automation Training: Master AI & RPA",platform:"EmergenTeck",focus:"Continuidade seletiva"},
      {name:"Hyperautomation with Salesforce Ecosystem",platform:"Coursera",focus:"Blocos remanescentes úteis"},
      {name:"Hyperautomation with insights from process mining",platform:"Microsoft Learn",focus:"Revisão de process mining aplicada ao fluxo criado"}
    ],
    hours:{stack:6,editorial:4,workflow:8,admin:6,total:24},
    days:[
      {date:"2026-04-20",display:"20/04",dayName:"Seg",critical:{id:"S4D1C",title:"Estabilizar workflow v1",status:"not_started"},secondary:[{id:"S4D1S1",title:"Consolidar etapa de revisão",status:"not_started"},{id:"S4D1S2",title:"Pendência administrativa",status:"not_started"}],course:"EmergenTeck",notToDo:[]},
      {date:"2026-04-21",display:"21/04",dayName:"Ter",critical:{id:"S4D2C",title:"Consolidar padrão de prompt/eval",status:"not_started"},secondary:[{id:"S4D2S1",title:"Reduzir variação do output",status:"not_started"},{id:"S4D2S2",title:"Documentar regra operacional",status:"not_started"}],course:"Coursera",notToDo:[]},
      {date:"2026-04-22",display:"22/04",dayName:"Qua",critical:{id:"S4D3C",title:"Aplicar process mining ao fluxo criado",status:"not_started"},secondary:[{id:"S4D3S1",title:"Identificar gargalo principal",status:"not_started"},{id:"S4D3S2",title:"Eliminar retrabalho",status:"not_started"}],course:"Microsoft Learn",notToDo:[]},
      {date:"2026-04-23",display:"23/04",dayName:"Qui",critical:{id:"S4D4C",title:"Revisar linha editorial à luz do caso real",status:"not_started"},secondary:[{id:"S4D4S1",title:"Ajustar critérios mínimos",status:"not_started"},{id:"S4D4S2",title:"Registrar limites do sistema",status:"not_started"}],course:"EmergenTeck",notToDo:[]},
      {date:"2026-04-24",display:"24/04",dayName:"Sex",critical:{id:"S4D5C",title:"Rodar ciclo completo com checklist final",status:"not_started"},secondary:[{id:"S4D5S1",title:"Validar tempo total",status:"not_started"},{id:"S4D5S2",title:"Decidir o que vira rotina",status:"not_started"}],course:"Coursera",notToDo:[]},
      {date:"2026-04-25",display:"25/04",dayName:"Sáb",critical:{id:"S4D6C",title:"Fechar versão operacional v1",status:"not_started"},secondary:[{id:"S4D6S1",title:"Revisão semanal",status:"not_started"},{id:"S4D6S2",title:"Preparar fechamento do mês",status:"not_started"}],course:"Revisão leve",notToDo:[]}
    ]
  },
  {
    id:"SP-5",name:"Sprint 5",subtitle:"Fechamento de abril e transição",
    period:"27/04 – 30/04",startDate:"2026-04-27",endDate:"2026-04-30",
    goal:"Fechar abril com documentação mínima, lições aprendidas e backlog de maio cortado.",
    deliverables:["Pacote final dos 3 artefatos","Retrospectiva objetiva","Backlog de maio (máx. 3 itens)","Decisão explícita do que não entra em maio"],
    courses:[{name:"Revisão e consolidação das anotações dos 4 cursos",platform:"Todos",focus:"Sem abrir módulos novos se houver atraso nos artefatos"}],
    hours:{stack:4,editorial:4,workflow:4,admin:4,total:16},
    days:[
      {date:"2026-04-27",display:"27/04",dayName:"Seg",critical:{id:"S5D1C",title:"Consolidar documento final da stack mínima",status:"not_started"},secondary:[{id:"S5D1S1",title:"Anexar lições dos cursos",status:"not_started"},{id:"S5D1S2",title:"Pendência administrativa final",status:"not_started"}],course:"Consolidação",notToDo:[]},
      {date:"2026-04-28",display:"28/04",dayName:"Ter",critical:{id:"S5D2C",title:"Consolidar documento final do workflow",status:"not_started"},secondary:[{id:"S5D2S1",title:"Checklist final",status:"not_started"},{id:"S5D2S2",title:"Lista de melhorias para maio",status:"not_started"}],course:"Consolidação",notToDo:[]},
      {date:"2026-04-29",display:"29/04",dayName:"Qua",critical:{id:"S5D3C",title:"Consolidar documento final da linha editorial",status:"not_started"},secondary:[{id:"S5D3S1",title:"Backlog enxuto de maio",status:"not_started"},{id:"S5D3S2",title:"Cortar itens fora de foco",status:"not_started"}],course:"Consolidação",notToDo:[]},
      {date:"2026-04-30",display:"30/04",dayName:"Qui",critical:{id:"S5D4C",title:"Retrospectiva executiva de abril",status:"not_started"},secondary:[{id:"S5D4S1",title:"Validar se maio pode receber infraestrutura mínima",status:"not_started"},{id:"S5D4S2",title:"Preparar primeiro sprint de maio",status:"not_started"}],course:"Nenhum",notToDo:["Abrir novo projeto","Novo curso","Novo canal"]}
    ]
  }
];

const META = { title:"Plano de Execução: Abril 2026", horizon:"01/04/2026 – 30/04/2026", nextStep:"Produzir documento curto (3 colunas): o que entra, o que sai, e mapeamento curso-artefato.", lastUpdated: todayDisplay };
const OBJECTIVES = [
  {id:"OBJ-1",title:"Fechar a linha editorial mínima",result:["1 público inicial","3 pilares editoriais","Função de cada canal","Critérios mínimos"],indicator:"Documento fechado até 08/04",project:"Linha editorial mínima",progress:0},
  {id:"OBJ-2",title:"Fechar stack mínima de capacitação",result:["1 stack mínima","1 fluxo de uso","1 padrão de prompt/eval","1 caso simples"],indicator:"Recorte até 07/04, 1 teste até 12/04",project:"Stack mínima aplicada",progress:0},
  {id:"OBJ-3",title:"Definir workflow editorial manual v0",result:["Fluxo manual: entrada → transformação → revisão → saída","Sem agente","1 dry run"],indicator:"Workflow v0 até 11/04, dry run até 12/04",project:"Workflow editorial mínimo",progress:0}
];
const OUT_OF_SCOPE = ["Infraestrutura pública mínima","Produção dos 3 primeiros artigos (como meta principal)","Agente editorial v0","Repurpose como frente separada","Frankwatching & Vídeos EN/NL","Refinamento visual","Domínio amplo da ferramenta (como projeto autônomo)"];
const CAPACITY = {
  available:104, planned:104, bufferPercent:20,
  overloadPoints:["Tratar os 4 cursos como metas independentes.","Tentar concluir todos os módulos em profundidade.","Trazer infraestrutura pública para dentro de abril.","Converter estudo em produção pública cedo demais.","Reabrir 'agente', 'repurpose' ou 'domínio da ferramenta' como frentes."],
  adjustments:["Cursos distribuídos como suporte da stack, não como fim em si.","Mês quebrado em 5 sprints com carga realista.","Fechamento de abril é documental e operacional, não de volume público.","Backlog de maio será gerado só no fim, com base em evidência."]
};
const REVIEWS = {
  eod:["A prioridade crítica foi concluída?","O que travou?","O dia seguinte precisa manter a sequência ou cortar algo?","Alguma pendência administrativa invadiu o bloco crítico?"],
  eow:["Stack mínima está mais clara ou ainda difusa?","Linha editorial continua em 1 página ou inflou?","Workflow já funciona manualmente de ponta a ponta?","Algum curso está virando dispersão em vez de suporte?"],
  triggers:["2 dias seguidos sem concluir prioridade crítica","Stack ainda vaga após 07/04","Linha editorial ainda aberta após 08/04","Workflow sem dry run até 12/04","Cursos consumindo mais tempo que o workflow","Vontade de abrir nova frente antes de fechar as 3 atuais"]
};

const ALL_COURSES = [
  {id:"c1",name:"Intelligent Automation Foundations",platform:"LinkedIn Learning"},
  {id:"c2",name:"Hyperautomation with insights from process mining",platform:"Microsoft Learn"},
  {id:"c3",name:"Hyperautomation with Salesforce Ecosystem",platform:"Coursera"},
  {id:"c4",name:"Intelligent Automation Training: Master AI & RPA",platform:"EmergenTeck"},
];

// ── P1: PERSISTENT STORAGE HOOK ───────────────────────────────────────────────
const usePersistedState = (key, defaultValue) => {
  const [value, setValue] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(key);
        if (result && result.value) {
          setValue(JSON.parse(result.value));
        }
      } catch (e) { /* key doesn't exist yet, use default */ }
      setLoaded(true);
    })();
  }, [key]);

  const setPersisted = useCallback((newVal) => {
    setValue(prev => {
      const resolved = typeof newVal === "function" ? newVal(prev) : newVal;
      window.storage.set(key, JSON.stringify(resolved)).catch(() => {});
      return resolved;
    });
  }, [key]);

  return [value, setPersisted, loaded];
};

// ── UTILS ─────────────────────────────────────────────────────────────────────
const cx = (...c) => c.filter(Boolean).join(" ");

const StatusChip = ({ status, small }) => {
  const C = STATUS_CFG[status]; const Icon = C.icon;
  return (
    <span className={cx("inline-flex items-center rounded-sm font-medium", small ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-xs", C.cls)}>
      <Icon className={cx("mr-1", small ? "w-2.5 h-2.5" : "w-3 h-3")} />{C.label}
    </span>
  );
};

const Card = ({ children, className = "", accent = false, accentColor = "border-t-slate-800" }) => (
  <div className={cx("bg-white border border-slate-200 shadow-sm p-5", accent ? `border-t-4 ${accentColor}` : "", className)}>
    {children}
  </div>
);

const SectionHeader = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 border-b-2 border-slate-800 pb-2 mb-4 mt-6">
    {Icon && <Icon className="w-5 h-5 text-slate-700" />}
    <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest">{title}</h2>
  </div>
);

// ── P3: QUICK NOTE MODAL ──────────────────────────────────────────────────────
const QuickNoteModal = ({ isOpen, onClose, contextLabel, onSave }) => {
  const [text, setText] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-slate-200 shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-wider">Nota Rápida</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-400 font-mono mb-2">{contextLabel}</div>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            className="w-full border border-slate-200 p-3 text-sm text-slate-800 resize-none focus:outline-none focus:border-slate-400 min-h-[120px]"
            placeholder="Escreva sua nota..."
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200 hover:bg-slate-50">Cancelar</button>
            <button
              onClick={() => { if (text.trim()) { onSave(text.trim()); setText(""); onClose(); } }}
              className="px-3 py-1.5 text-xs text-white bg-slate-900 hover:bg-slate-700 flex items-center gap-1"
            ><Save className="w-3 h-3" /> Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── NOTES DISPLAY ─────────────────────────────────────────────────────────────
const NotesList = ({ notes, onDelete }) => {
  if (!notes || notes.length === 0) return null;
  return (
    <div className="space-y-1.5 mt-2">
      {notes.map((n, i) => (
        <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 text-xs group">
          <StickyNote className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-slate-700">{n.text}</span>
            <span className="text-slate-400 ml-2 font-mono">{n.time}</span>
          </div>
          <button onClick={() => onDelete(i)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-0.5">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

// ── MONTH TIMELINE ────────────────────────────────────────────────────────────
const MonthTimeline = ({ activeSprintId }) => {
  const dayNum = daysBetween(new Date("2026-04-01"), TODAY) + 1;
  const todayPct = Math.min(100, Math.max(0, Math.round(((dayNum - 1) / 29) * 100)));
  return (
    <div className="bg-white border border-slate-200 p-4 mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Abril 2026 — Linha do Tempo</span>
        <span className="text-xs font-mono text-slate-400">Dia {dayNum} de 30 · {Math.round((dayNum/30)*100)}% do mês</span>
      </div>
      <div className="relative h-9 bg-slate-100 border border-slate-200 overflow-hidden">
        {SPRINTS.map(s => {
          const startDay = daysBetween(new Date("2026-04-01"), parseDateStr(s.startDate));
          const endDay = daysBetween(new Date("2026-04-01"), parseDateStr(s.endDate));
          const left = (startDay / 29) * 100;
          const width = ((endDay - startDay + 1) / 30) * 100;
          const st = getSprintStatus(s);
          const isSelected = s.id === activeSprintId;
          return (
            <div key={s.id}
              className={cx("absolute top-0 h-full flex items-center justify-center text-xs font-bold border-r border-white transition-all",
                isSelected ? "bg-slate-900 text-white" : st==="completed" ? "bg-slate-500 text-white" : st==="active" ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-500"
              )}
              style={{left:`${left}%`, width:`${width}%`}}>
              {width > 10 ? s.name.replace("Sprint ","SP") : ""}
            </div>
          );
        })}
        {dayNum >= 1 && dayNum <= 30 && (
          <div className="absolute top-0 h-full w-px bg-red-500 z-10" style={{left:`${todayPct}%`}}>
            <div className="absolute top-0 -translate-x-1/2 bg-red-500 text-white text-xs px-1 leading-5 whitespace-nowrap">hoje</div>
          </div>
        )}
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-400 font-mono select-none">
        {["01","06","13","20","27","30"].map(d => <span key={d}>{d}/04</span>)}
      </div>
    </div>
  );
};

// ── TASK CARD ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, status, onCycle, isToday, notes, onAddNote, onDeleteNote }) => (
  <div className={cx("border transition-all select-none group",
    isToday ? "border-l-4 border-l-amber-500 border-t border-r border-b border-slate-200 bg-amber-50/30" : "border-slate-200 bg-white hover:border-slate-400",
    status==="done" ? "opacity-55" : ""
  )}>
    <div className="p-3 cursor-pointer" onClick={onCycle}>
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className={cx("inline-flex items-center gap-1 text-xs font-bold uppercase px-1.5 py-0.5",
          task.type==="critical" ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-500 border border-slate-200"
        )}>
          {task.type==="critical" ? <Zap className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>}
          {task.type==="critical" ? "Crítica" : "Sec."}
        </span>
        <div className="flex items-center gap-1">
          {isToday && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 border border-amber-300">HOJE</span>}
          {notes && notes.length > 0 && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1 py-0.5 border border-amber-200">{notes.length}<StickyNote className="w-2.5 h-2.5 inline ml-0.5"/></span>}
        </div>
      </div>
      <p className={cx("text-sm font-medium leading-tight mb-2", status==="done" ? "line-through text-slate-400" : "text-slate-900")}>{task.title}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-mono">{task.date} {task.dayName}</span>
        <StatusChip status={status} small />
      </div>
      <p className="text-xs text-slate-300 mt-1 group-hover:text-slate-400 transition-colors">clique para avançar →</p>
    </div>
    <div className="px-3 pb-2 flex items-center gap-1">
      <button onClick={(e) => { e.stopPropagation(); onAddNote(); }} className="text-xs text-slate-400 hover:text-amber-600 flex items-center gap-1 transition-colors p-1">
        <Plus className="w-3 h-3" /> nota
      </button>
    </div>
    {notes && notes.length > 0 && <div className="px-3 pb-3"><NotesList notes={notes} onDelete={onDeleteNote} /></div>}
  </div>
);

const KanbanCol = ({ title, count, colorClass, children }) => (
  <div className="flex-1 min-w-0">
    <div className={cx("flex items-center gap-2 px-3 py-2 mb-3 border-b-2", colorClass)}>
      <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
      <span className="ml-auto w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-white border border-current">{count}</span>
    </div>
    <div className="space-y-2.5 min-h-12">{children}</div>
  </div>
);

// ── KANBAN VIEW ───────────────────────────────────────────────────────────────
const KanbanView = ({ taskStatuses, setTaskStatus, dayNotes, addDayNote, deleteDayNote }) => {
  const defaultSprint = SPRINTS.find(s => getSprintStatus(s)==="active") || SPRINTS[0];
  const [selectedId, setSelectedId] = useState(defaultSprint.id);
  const [noteModal, setNoteModal] = useState(null);
  const sprint = SPRINTS.find(s => s.id === selectedId);
  const sprintSt = getSprintStatus(sprint);

  const getStatus = t => taskStatuses[t.id] !== undefined ? taskStatuses[t.id] : t.status;

  const allTasks = useMemo(() => sprint.days.flatMap(day => [
    {...day.critical, date:day.display, dayName:day.dayName, type:"critical", dayDate:day.date},
    ...day.secondary.map(s => ({...s, date:day.display, dayName:day.dayName, type:"secondary", dayDate:day.date}))
  ]), [sprint]);

  const cols = {
    not_started: allTasks.filter(t => getStatus(t)==="not_started"),
    in_progress: allTasks.filter(t => getStatus(t)==="in_progress"),
    done: allTasks.filter(t => getStatus(t)==="done"),
  };
  const completionPct = Math.round((cols.done.length / allTasks.length) * 100);

  const stBadge = { active:"bg-emerald-50 text-emerald-800 border border-emerald-300", upcoming:"bg-blue-50 text-blue-700 border border-blue-200", completed:"bg-slate-100 text-slate-500 border border-slate-200" };
  const stLabel = { active:"● ATIVO", upcoming:"PRÓXIMO", completed:"✓ CONCLUÍDO" };
  const accentByStatus = { active:"border-t-emerald-600", upcoming:"border-t-blue-500", completed:"border-t-slate-400" };
  const hoursData = [{label:"Stack",h:sprint.hours.stack,color:"bg-blue-400"},{label:"Editorial",h:sprint.hours.editorial,color:"bg-violet-400"},{label:"Workflow",h:sprint.hours.workflow,color:"bg-emerald-400"},{label:"Admin",h:sprint.hours.admin,color:"bg-slate-300"}];

  return (
    <div className="space-y-4">
      <MonthTimeline activeSprintId={selectedId} />
      <QuickNoteModal
        isOpen={!!noteModal}
        onClose={() => setNoteModal(null)}
        contextLabel={noteModal?.label || ""}
        onSave={(text) => addDayNote(noteModal.taskId, text)}
      />

      <div className="flex gap-1.5 flex-wrap">
        {SPRINTS.map(s => {
          const st = getSprintStatus(s); const isSel = s.id === selectedId;
          return (
            <button key={s.id} onClick={() => setSelectedId(s.id)}
              className={cx("px-3 py-1.5 text-xs font-bold uppercase tracking-wide border transition-all flex items-center gap-1.5",
                isSel ? "bg-slate-900 text-white border-slate-900" :
                st==="active" ? "bg-white border-slate-600 text-slate-800 hover:border-slate-900" :
                "bg-white border-slate-200 text-slate-400 hover:border-slate-400"
              )}>
              {s.name.replace("Sprint ","SP")}
              {st==="active" && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
              {st==="completed" && <CheckCircle2 className="w-3 h-3 text-slate-400"/>}
            </button>
          );
        })}
      </div>

      <Card accent accentColor={accentByStatus[sprintSt]}>
        <div className="flex flex-wrap items-start gap-4 justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h3 className="text-xl font-bold text-slate-900">{sprint.name} — {sprint.subtitle}</h3>
              <span className={cx("text-xs font-bold px-2 py-0.5 uppercase", stBadge[sprintSt])}>{stLabel[sprintSt]}</span>
            </div>
            <p className="text-sm text-slate-400 font-mono">{sprint.period} · {sprint.hours.total}h</p>
          </div>
          <div className="flex gap-5 text-center">
            {sprintSt==="active" && <>
              <div><div className="text-3xl font-light text-slate-900 leading-none">{dayOfSprint(sprint)}</div><div className="text-xs text-slate-400 mt-0.5 uppercase">dia atual</div></div>
              <div><div className="text-3xl font-light text-amber-600 leading-none">{daysRemaining(sprint)}</div><div className="text-xs text-slate-400 mt-0.5 uppercase">dias rest.</div></div>
            </>}
            <div><div className="text-3xl font-light text-slate-900 leading-none">{completionPct}%</div><div className="text-xs text-slate-400 mt-0.5 uppercase">concluído</div></div>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-2 mb-4 relative">
          <div className="bg-slate-800 h-2 transition-all duration-500" style={{width:`${completionPct}%`}} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <p className="text-sm text-slate-700 mb-3">{sprint.goal}</p>
            <div className="flex flex-wrap gap-1.5">
              {sprint.deliverables.map((d,i) => <span key={i} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1">{d}</span>)}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Horas do Sprint</h4>
            <div className="space-y-1.5">
              {hoursData.map(h => (
                <div key={h.label} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-14 shrink-0">{h.label}</span>
                  <div className="flex-1 bg-slate-100 h-3"><div className={cx("h-3", h.color)} style={{width:`${(h.h/sprint.hours.total)*100}%`}} /></div>
                  <span className="text-xs font-mono text-slate-600 w-5 text-right">{h.h}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <KanbanCol title="A Fazer" count={cols.not_started.length} colorClass="border-slate-300 text-slate-600">
          {cols.not_started.map(t => <TaskCard key={t.id} task={t} status={getStatus(t)} isToday={t.dayDate===todayStr}
            notes={dayNotes[t.id]} onAddNote={() => setNoteModal({taskId:t.id, label:`${t.date} · ${t.title}`})}
            onDeleteNote={(i) => deleteDayNote(t.id, i)} onCycle={() => setTaskStatus(t.id, NEXT_STATUS[getStatus(t)])} />)}
        </KanbanCol>
        <KanbanCol title="Em Andamento" count={cols.in_progress.length} colorClass="border-amber-400 text-amber-700">
          {cols.in_progress.map(t => <TaskCard key={t.id} task={t} status={getStatus(t)} isToday={t.dayDate===todayStr}
            notes={dayNotes[t.id]} onAddNote={() => setNoteModal({taskId:t.id, label:`${t.date} · ${t.title}`})}
            onDeleteNote={(i) => deleteDayNote(t.id, i)} onCycle={() => setTaskStatus(t.id, NEXT_STATUS[getStatus(t)])} />)}
        </KanbanCol>
        <KanbanCol title="Concluído" count={cols.done.length} colorClass="border-emerald-500 text-emerald-700">
          {cols.done.map(t => <TaskCard key={t.id} task={t} status={getStatus(t)} isToday={t.dayDate===todayStr}
            notes={dayNotes[t.id]} onAddNote={() => setNoteModal({taskId:t.id, label:`${t.date} · ${t.title}`})}
            onDeleteNote={(i) => deleteDayNote(t.id, i)} onCycle={() => setTaskStatus(t.id, NEXT_STATUS[getStatus(t)])} />)}
        </KanbanCol>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Agenda Diária</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                <th className="px-3 py-2.5 text-left w-20">Data</th>
                <th className="px-3 py-2.5 text-left">Prioridade Crítica</th>
                <th className="px-3 py-2.5 text-left">Secundária 1</th>
                <th className="px-3 py-2.5 text-left">Secundária 2</th>
                <th className="px-3 py-2.5 text-left w-40">Curso</th>
              </tr>
            </thead>
            <tbody>
              {sprint.days.map((day, i) => {
                const isCurDay = day.date === todayStr;
                const cSt = getStatus(day.critical);
                return (
                  <tr key={day.date} className={cx("border-b border-slate-100",
                    isCurDay ? "bg-amber-50 border-l-4 border-l-amber-500" : i%2===0 ? "bg-white" : "bg-slate-50/40"
                  )}>
                    <td className="px-3 py-3">
                      <div className="font-mono font-bold text-xs text-slate-800">{day.display}</div>
                      <div className="text-xs text-slate-400">{day.dayName}</div>
                      {isCurDay && <div className="text-xs text-amber-600 font-bold">← hoje</div>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-1.5">
                        <span className="text-red-400 text-xs shrink-0 mt-0.5">▶</span>
                        <div>
                          <span className={cx("text-xs font-medium cursor-pointer", cSt==="done" ? "line-through text-slate-400" : "text-slate-900")}
                            onClick={() => setTaskStatus(day.critical.id, NEXT_STATUS[cSt])}>
                            {day.critical.title}
                          </span>
                          <div className="mt-1"><StatusChip status={cSt} small /></div>
                        </div>
                      </div>
                    </td>
                    {day.secondary.map((sec,j) => {
                      const sSt = getStatus(sec);
                      return (
                        <td key={j} className="px-3 py-3">
                          <span className={cx("text-xs block mb-1 cursor-pointer hover:text-slate-600", sSt==="done" ? "line-through text-slate-400" : "text-slate-700")}
                            onClick={() => setTaskStatus(sec.id, NEXT_STATUS[sSt])}>
                            {sec.title}
                          </span>
                          <StatusChip status={sSt} small />
                        </td>
                      );
                    })}
                    <td className="px-3 py-3">
                      <span className={cx("text-xs px-2 py-0.5 font-medium inline-block", PLATFORM_COLOR[day.course] || "bg-slate-100 text-slate-500 border border-slate-200")}>
                        {day.course}
                      </span>
                      {day.notToDo.length>0 && <div className="text-xs text-red-500 mt-1">× {day.notToDo.join(", ")}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2 flex items-center gap-2"><BookOpen className="w-4 h-4"/>Cursos do Sprint</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sprint.courses.map((c,i) => (
            <div key={i} className="p-3 bg-white border border-slate-200">
              <span className={cx("text-xs font-bold px-2 py-0.5 inline-block mb-2", PLATFORM_COLOR[c.platform]||"bg-slate-100 text-slate-500 border border-slate-200")}>{c.platform}</span>
              <p className="text-sm font-semibold text-slate-900 mb-1 leading-tight">{c.name}</p>
              <p className="text-xs text-slate-500 italic">{c.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD VIEW ────────────────────────────────────────────────────────────
const DashboardView = ({ taskStatuses, setTaskStatus }) => {
  const activeSprint = SPRINTS.find(s => getSprintStatus(s)==="active");
  const todayDay = activeSprint?.days.find(d => d.date===todayStr);
  const getStatus = t => taskStatuses[t.id] !== undefined ? taskStatuses[t.id] : t.status;
  const allTasks = SPRINTS.flatMap(s => s.days.flatMap(d => [d.critical,...d.secondary]));
  const donePct = Math.round((allTasks.filter(t => getStatus(t)==="done").length / allTasks.length) * 100);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Sprint Ativo",value:activeSprint?.name||"—",sub:activeSprint?.period||"Nenhum sprint ativo",color:"border-t-slate-800"},
          {label:"Dias Restantes",value:activeSprint?daysRemaining(activeSprint):"—",sub:"no sprint",color:"border-t-amber-500"},
          {label:"Progresso Mensal",value:`${donePct}%`,sub:`${allTasks.filter(t=>getStatus(t)==="done").length}/${allTasks.length} tarefas`,color:"border-t-emerald-500"},
          {label:"Capacidade Abril",value:"104h",sub:"planejadas / disponíveis",color:"border-t-blue-500"}
        ].map((s,i) => (
          <Card key={i} accent accentColor={s.color}>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</div>
            <div className="text-xs text-slate-400">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card accent accentColor="border-t-red-700" className="md:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Execução Imediata — {todayDay?.display || todayDisplay} {todayDay?.dayName || ""}
          </h3>
          {todayDay ? (
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-red-700 uppercase bg-red-50 px-2 py-0.5 border border-red-100 mb-2 inline-block">Prioridade Crítica (máx. 1)</span>
                <div className="flex justify-between items-center p-3 border-2 border-slate-900 bg-slate-50 cursor-pointer hover:bg-white transition-colors"
                  onClick={() => setTaskStatus(todayDay.critical.id, NEXT_STATUS[getStatus(todayDay.critical)])}>
                  <span className="font-bold text-slate-900 text-sm">{todayDay.critical.title}</span>
                  <StatusChip status={getStatus(todayDay.critical)} />
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 border border-slate-200 mb-2 inline-block">Secundárias (máx. 2)</span>
                <div className="space-y-2">
                  {todayDay.secondary.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setTaskStatus(t.id, NEXT_STATUS[getStatus(t)])}>
                      <span className="text-slate-700 text-sm">{t.title}</span>
                      <StatusChip status={getStatus(t)} />
                    </div>
                  ))}
                </div>
              </div>
              {todayDay.notToDo.length>0 && (
                <div className="p-2.5 bg-red-50 border border-red-100 text-xs text-red-700 flex items-center gap-2">
                  <Ban className="w-3.5 h-3.5 shrink-0"/> <span className="font-bold">Não fazer hoje:</span> {todayDay.notToDo.join(", ")}
                </div>
              )}
            </div>
          ) : <p className="text-sm text-slate-400 italic">Nenhum sprint ativo para hoje ({todayDisplay}). Verifique a aba Sprint Board.</p>}
        </Card>

        <div className="space-y-4">
          <Card className="bg-slate-50">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Ban className="w-4 h-4"/>Fora do Horizonte</h3>
            <ul className="space-y-1.5">
              {OUT_OF_SCOPE.map((item,i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5"><span className="text-red-400 font-bold shrink-0">×</span>{item}</li>
              ))}
            </ul>
          </Card>
          <Card className="bg-slate-900 text-white">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Próxima Ação</h3>
            <p className="text-sm leading-relaxed text-slate-200">{META.nextStep}</p>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">Objetivos Estratégicos de Abril</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {OBJECTIVES.map(obj => (
            <Card key={obj.id} className="flex flex-col">
              <span className="text-xs text-slate-400 font-mono mb-1">{obj.id}</span>
              <h4 className="font-bold text-slate-900 mb-2 text-sm leading-tight">{obj.title}</h4>
              <p className="text-xs text-slate-500 mb-3 flex-grow">{obj.indicator}</p>
              <div className="w-full bg-slate-100 h-1.5">
                <div className="bg-slate-800 h-1.5 transition-all" style={{width:`${obj.progress}%`}} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── STRATEGY VIEW ─────────────────────────────────────────────────────────────
const StrategyView = () => (
  <div className="space-y-5">
    <SectionHeader title="Horizonte Estratégico: Abril 2026" icon={Target} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        {OBJECTIVES.map(obj => (
          <Card key={obj.id} accent>
            <div className="flex justify-between items-start mb-3 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{obj.id} · {obj.project}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{obj.title}</h3>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 border border-slate-200 shrink-0">↗ {obj.indicator.split("até ")[1] || obj.indicator}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-200 pb-1 mb-2">Resultados Esperados</h4>
                <ul className="space-y-1">{obj.result.map((r,i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-1.5"><span className="text-slate-300 shrink-0">■</span>{r}</li>)}</ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-200 pb-1 mb-2">Indicador</h4>
                <p className="text-sm text-slate-700">{obj.indicator}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="bg-slate-50 h-fit">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2"><ListX className="w-4 h-4"/>Explicitamente Fora</h3>
        <p className="text-xs text-slate-500 mb-3">Itens adiados para preservar capacidade e foco nos 3 objetivos.</p>
        <ul className="space-y-2">
          {OUT_OF_SCOPE.map((item,i) => (
            <li key={i} className="text-sm text-slate-700 flex items-start p-2 bg-white border border-slate-200 gap-2">
              <span className="text-red-500 font-bold shrink-0">×</span>{item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  </div>
);

// ── CAPACITY VIEW ─────────────────────────────────────────────────────────────
const CapacityView = () => {
  const macroHours = [{label:"Stack mínima + cursos aplicados",h:29,color:"bg-blue-400"},{label:"Linha editorial mínima",h:22,color:"bg-violet-400"},{label:"Workflow editorial mínimo",h:27,color:"bg-emerald-400"},{label:"Fixos / admin / revisões",h:26,color:"bg-slate-300"}];
  return (
    <div className="space-y-5">
      <SectionHeader title="Capacidade & Stress Test" icon={ShieldAlert} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{label:"Disponível",value:"104h",sub:"Horas úteis de abril",ac:"border-t-emerald-600"},{label:"Planejado",value:"104h",sub:"Soma dos 5 sprints",ac:"border-t-blue-600"},{label:"Buffer",value:"20%",sub:"Mínimo exigido: 20% ✓",ac:"border-t-slate-800"}].map(c => (
          <Card key={c.label} accent accentColor={c.ac}>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{c.label}</div>
            <div className="text-4xl font-light text-slate-900 mb-1">{c.value}</div>
            <div className="text-xs text-slate-400">{c.sub}</div>
          </Card>
        ))}
      </div>
      <Card>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Distribuição Macro do Mês</h4>
        <div className="space-y-2.5">
          {macroHours.map(h => (
            <div key={h.label} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 w-60 shrink-0">{h.label}</span>
              <div className="flex-1 bg-slate-100 h-6 relative overflow-hidden">
                <div className={cx("h-6 flex items-center pl-2 transition-all", h.color)} style={{width:`${(h.h/104)*100}%`}}>
                  <span className="text-xs font-bold text-white">{h.h}h</span>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 w-8">{Math.round((h.h/104)*100)}%</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Gatilhos de Sobrecarga</h3>
          <ul className="space-y-2">{CAPACITY.overloadPoints.map((p,i) => <li key={i} className="flex items-start text-sm text-slate-800 gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"/>{p}</li>)}</ul>
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Ajustes Arquiteturais</h3>
          <ul className="space-y-2">{CAPACITY.adjustments.map((a,i) => <li key={i} className="flex items-start text-sm text-slate-800 gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"/>{a}</li>)}</ul>
        </Card>
      </div>
    </div>
  );
};

// ── P4: REVIEW VIEW WITH PERSISTENT ANSWER FIELDS ────────────────────────────
const ReviewView = ({ reviewAnswers, setReviewAnswers }) => {
  const updateAnswer = (section, idx, val) => {
    setReviewAnswers(prev => {
      const next = {...prev};
      if (!next[section]) next[section] = {};
      next[section][idx] = val;
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Auditoria & Replanejamento" icon={RefreshCcw} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[{key:"eod",title:"Fim do Dia (EOD)",items:REVIEWS.eod},{key:"eow",title:"Fim da Semana (EOW)",items:REVIEWS.eow}].map(section => (
          <Card key={section.key} accent>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3">{section.title}</h3>
            <ul className="space-y-3">
              {section.items.map((q,i) => (
                <li key={i} className="bg-slate-50 border border-slate-200 p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-slate-400 font-mono text-xs shrink-0 mt-0.5">0{i+1}</span>
                    <span className="text-sm text-slate-800 font-medium">{q}</span>
                  </div>
                  <textarea
                    className="w-full border border-slate-200 bg-white p-2 text-xs text-slate-700 resize-none focus:outline-none focus:border-slate-400 min-h-[48px]"
                    placeholder="Registre sua resposta..."
                    value={reviewAnswers?.[section.key]?.[i] || ""}
                    onChange={e => updateAnswer(section.key, i, e.target.value)}
                  />
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <Card className="border-l-4 border-l-red-700 bg-red-50/50">
        <h3 className="text-sm font-bold text-red-900 uppercase tracking-widest mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/>Gatilhos de Replanejamento Forçado</h3>
        <p className="text-sm text-slate-700 mb-4">Se qualquer condição abaixo for atingida, parar para replanejar. Não empurrar através de falha estrutural.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REVIEWS.triggers.map((t,i) => (
            <div key={i} className="p-3 bg-white border border-red-200 text-sm text-slate-800 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />{t}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── P7: KNOWLEDGE NOTES VIEW ─────────────────────────────────────────────────
const KnowledgeView = ({ knowledgeNotes, setKnowledgeNotes }) => {
  const [selectedCourse, setSelectedCourse] = useState(ALL_COURSES[0].id);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");

  const addNote = () => {
    if (!newNote.trim()) return;
    const ts = new Date().toLocaleString("pt-BR", {day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
    setKnowledgeNotes(prev => {
      const next = {...prev};
      if (!next[selectedCourse]) next[selectedCourse] = [];
      next[selectedCourse] = [...next[selectedCourse], { text: newNote.trim(), tag: newTag.trim() || "geral", time: ts }];
      return next;
    });
    setNewNote("");
    setNewTag("");
  };

  const deleteNote = (courseId, idx) => {
    setKnowledgeNotes(prev => {
      const next = {...prev};
      next[courseId] = next[courseId].filter((_, i) => i !== idx);
      return next;
    });
  };

  const allNotes = Object.entries(knowledgeNotes).flatMap(([cid, notes]) =>
    (notes || []).map(n => ({...n, courseId: cid, courseName: ALL_COURSES.find(c => c.id === cid)?.name || cid}))
  );
  const totalNotes = allNotes.length;
  const allTags = [...new Set(allNotes.map(n => n.tag))].sort();

  return (
    <div className="space-y-5">
      <SectionHeader title="Knowledge Notes — Cursos" icon={GraduationCap} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ALL_COURSES.map(c => {
          const count = (knowledgeNotes[c.id] || []).length;
          return (
            <Card key={c.id} accent accentColor={selectedCourse === c.id ? "border-t-blue-500" : "border-t-slate-200"}
              className={cx("cursor-pointer transition-all", selectedCourse === c.id ? "ring-1 ring-blue-300" : "hover:border-slate-300")}>
              <div onClick={() => setSelectedCourse(c.id)}>
                <span className={cx("text-xs font-bold px-2 py-0.5 inline-block mb-2", PLATFORM_COLOR[c.platform] || "bg-slate-100 text-slate-500 border border-slate-200")}>{c.platform}</span>
                <p className="text-xs font-semibold text-slate-900 leading-tight mb-2">{c.name}</p>
                <div className="text-lg font-bold text-slate-900">{count} <span className="text-xs font-normal text-slate-400">notas</span></div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="w-5 h-5 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{ALL_COURSES.find(c => c.id === selectedCourse)?.name}</h3>
          <span className="text-xs text-slate-400 font-mono ml-auto">{(knowledgeNotes[selectedCourse] || []).length} notas</span>
        </div>

        <div className="mb-4 p-4 bg-slate-50 border border-slate-200">
          <textarea
            value={newNote} onChange={e => setNewNote(e.target.value)}
            className="w-full border border-slate-200 bg-white p-3 text-sm text-slate-800 resize-none focus:outline-none focus:border-slate-400 min-h-[100px] mb-3"
            placeholder="Registre um conceito, insight, ou anotação do curso..."
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-slate-500 shrink-0">Tag:</span>
              <input
                value={newTag} onChange={e => setNewTag(e.target.value)}
                className="border border-slate-200 px-2 py-1 text-xs text-slate-700 w-40 focus:outline-none focus:border-slate-400"
                placeholder="ex: conceito, insight, dúvida"
              />
            </div>
            <button onClick={addNote}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 transition-colors flex items-center gap-1.5">
              <Plus className="w-3 h-3" /> Adicionar Nota
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {(knowledgeNotes[selectedCourse] || []).slice().reverse().map((note, i, arr) => {
            const realIdx = arr.length - 1 - i;
            return (
              <div key={i} className="p-3 bg-white border border-slate-200 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 border border-blue-200">{note.tag}</span>
                      <span className="text-xs text-slate-400 font-mono">{note.time}</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                  </div>
                  <button onClick={() => deleteNote(selectedCourse, realIdx)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {(knowledgeNotes[selectedCourse] || []).length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">Nenhuma nota ainda. Comece a registrar aprendizados deste curso.</div>
          )}
        </div>
      </Card>

      {allTags.length > 0 && (
        <Card>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Todas as Tags</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const count = allNotes.filter(n => n.tag === tag).length;
              return <span key={tag} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1">{tag} <span className="font-mono text-slate-400">({count})</span></span>;
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

// ── P5: AI ASSISTANT DRAWER ──────────────────────────────────────────────────
const AIDrawer = ({ isOpen, onClose, taskStatuses }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const getSystemContext = () => {
    const activeSprint = SPRINTS.find(s => getSprintStatus(s)==="active");
    const allTasks = SPRINTS.flatMap(s => s.days.flatMap(d => [d.critical,...d.secondary]));
    const getStatus = t => taskStatuses[t.id] !== undefined ? taskStatuses[t.id] : t.status;
    const done = allTasks.filter(t => getStatus(t)==="done").length;
    const inProg = allTasks.filter(t => getStatus(t)==="in_progress").length;
    const blocked = allTasks.filter(t => getStatus(t)==="blocked").length;

    return `Você é um assistente operacional embutido num cockpit de execução de abril 2026. Responda em pt-BR, de forma direta e curta.

CONTEXTO ATUAL:
- Hoje: ${todayStr}
- Sprint ativo: ${activeSprint?.name || "nenhum"} (${activeSprint?.period || "-"})
- Progresso mensal: ${done}/${allTasks.length} tarefas concluídas, ${inProg} em andamento, ${blocked} bloqueadas
- Objetivos: ${OBJECTIVES.map(o => o.title).join("; ")}
- Fora de escopo: ${OUT_OF_SCOPE.join("; ")}
- Capacidade: 104h, buffer 20%

SPRINTS: ${JSON.stringify(SPRINTS.map(s => ({id:s.id,name:s.name,period:s.period,status:getSprintStatus(s),goal:s.goal})))}

REGRAS: Não sugira nada fora de escopo de abril. Priorize foco. Seja brutalmente objetivo.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, {role:"user", content: userMsg}]);
    setLoading(true);

    try {
      const conversationHistory = [...messages, {role:"user", content: userMsg}];
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: getSystemContext(),
          messages: conversationHistory.map(m => ({role: m.role, content: m.content}))
        })
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "Erro ao processar resposta.";
      setMessages(prev => [...prev, {role:"assistant", content: text}]);
    } catch (err) {
      setMessages(prev => [...prev, {role:"assistant", content:"⚠ Erro de conexão com a API. Tente novamente."}]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold uppercase tracking-wider">Assistente AI</span>
          <span className="text-xs text-slate-400 font-mono">Claude Sonnet</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-700 transition-colors"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Assistente com contexto do seu plano de abril.</p>
            <div className="space-y-2">
              {["Como está meu progresso hoje?","O que priorizar amanhã?","Analise riscos do sprint atual","Estou travado, o que cortar?"].map(q => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="block w-full text-left text-xs p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cx("max-w-[85%]", m.role==="user" ? "ml-auto" : "mr-auto")}>
            <div className={cx("p-3 text-sm leading-relaxed",
              m.role==="user" ? "bg-slate-900 text-white" : "bg-slate-50 border border-slate-200 text-slate-800"
            )}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
            <div className={cx("text-xs text-slate-400 mt-1", m.role==="user" ? "text-right" : "")}>
              {m.role==="user" ? "você" : "assistente"}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Analisando...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-slate-200 shrink-0 bg-white">
        <div className="flex gap-2">
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendMessage()}
            className="flex-1 border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-slate-400"
            placeholder="Pergunte sobre seu plano..."
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            className="px-3 py-2 bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── P6: EXPORT FUNCTION ──────────────────────────────────────────────────────
const exportAllData = (taskStatuses, dayNotes, reviewAnswers, knowledgeNotes) => {
  const data = {
    exportDate: new Date().toISOString(),
    version: "2.0",
    taskStatuses,
    dayNotes,
    reviewAnswers,
    knowledgeNotes,
    meta: META
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `exec-office-backup-${todayStr}.json`; a.click();
  URL.revokeObjectURL(url);
};

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [aiOpen, setAiOpen] = useState(false);

  // P1: All persisted states
  const [taskStatuses, setTaskStatuses, tasksLoaded] = usePersistedState("exec-task-states", {"S1D1C":"in_progress"});
  const [dayNotes, setDayNotes, notesLoaded] = usePersistedState("exec-day-notes", {});
  const [reviewAnswers, setReviewAnswers, reviewLoaded] = usePersistedState("exec-review-answers", {});
  const [knowledgeNotes, setKnowledgeNotes, knowledgeLoaded] = usePersistedState("exec-knowledge-notes", {});

  const setTaskStatus = (id, status) => setTaskStatuses(prev => ({...prev, [id]: status}));

  const addDayNote = (taskId, text) => {
    const ts = new Date().toLocaleString("pt-BR", {hour:"2-digit",minute:"2-digit"});
    setDayNotes(prev => {
      const next = {...prev};
      if (!next[taskId]) next[taskId] = [];
      next[taskId] = [...next[taskId], {text, time: ts}];
      return next;
    });
  };

  const deleteDayNote = (taskId, idx) => {
    setDayNotes(prev => {
      const next = {...prev};
      next[taskId] = next[taskId].filter((_, i) => i !== idx);
      return next;
    });
  };

  const activeSprint = SPRINTS.find(s => getSprintStatus(s)==="active");

  const navItems = [
    {id:"dashboard", label:"Dashboard",    icon:LayoutDashboard},
    {id:"kanban",    label:"Sprint Board",  icon:Layers},
    {id:"strategy",  label:"Estratégia",   icon:Target},
    {id:"capacity",  label:"Capacidade",   icon:ShieldAlert},
    {id:"review",    label:"Revisão",      icon:RefreshCcw},
    {id:"knowledge", label:"Knowledge",    icon:GraduationCap},
  ];

  const allLoaded = tasksLoaded && notesLoaded && reviewLoaded && knowledgeLoaded;

  if (!allLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-slate-900 text-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <span className="font-bold tracking-widest uppercase text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400"/>Executive Office
              </span>
              <span className="text-slate-700 hidden sm:block">|</span>
              <span className="text-sm text-slate-300 truncate max-w-xs hidden sm:block">{META.title}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              {activeSprint && (
                <span className="hidden md:flex items-center gap-2 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  {activeSprint.name} · {daysRemaining(activeSprint)}d rest.
                </span>
              )}
              <LiveClock />
              <button onClick={() => setAiOpen(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 transition-colors text-xs font-bold">
                <Sparkles className="w-3 h-3" /> AI
              </button>
              <button onClick={() => exportAllData(taskStatuses, dayNotes, reviewAnswers, knowledgeNotes)}
                className="flex items-center gap-1 bg-slate-800 border border-slate-700 hover:bg-slate-700 px-2 py-1.5 text-white transition-colors" title="Exportar backup JSON">
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-1 sm:gap-4 overflow-x-auto">
              {navItems.map(item => {
                const isActive = activeTab===item.id; const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={cx("whitespace-nowrap flex items-center py-3 px-1 border-b-2 text-xs sm:text-sm uppercase tracking-wider transition-colors gap-1.5",
                      isActive ? "border-slate-900 text-slate-900 font-bold" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    )}>
                    <Icon className="w-4 h-4"/>{item.label}
                    {item.id==="kanban" && activeSprint && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                    {item.id==="knowledge" && Object.values(knowledgeNotes).flat().length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0 font-mono">{Object.values(knowledgeNotes).flat().length}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        {activeTab==="dashboard"  && <DashboardView taskStatuses={taskStatuses} setTaskStatus={setTaskStatus}/>}
        {activeTab==="kanban"     && <KanbanView taskStatuses={taskStatuses} setTaskStatus={setTaskStatus} dayNotes={dayNotes} addDayNote={addDayNote} deleteDayNote={deleteDayNote}/>}
        {activeTab==="strategy"   && <StrategyView/>}
        {activeTab==="capacity"   && <CapacityView/>}
        {activeTab==="review"     && <ReviewView reviewAnswers={reviewAnswers} setReviewAnswers={setReviewAnswers}/>}
        {activeTab==="knowledge"  && <KnowledgeView knowledgeNotes={knowledgeNotes} setKnowledgeNotes={setKnowledgeNotes}/>}
      </main>

      <AIDrawer isOpen={aiOpen} onClose={() => setAiOpen(false)} taskStatuses={taskStatuses} />

      <footer className="fixed bottom-0 w-full bg-white border-t border-slate-200 px-4 py-2 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-xs font-mono text-slate-400">
          <span>{META.title} · v2.0</span>
          <span className="hidden sm:block">
            {activeSprint ? `${activeSprint.name} ativo · ${daysRemaining(activeSprint)} dias restantes` : "Sem sprint ativo"}
          </span>
          <span>Hoje: {todayDisplay}</span>
        </div>
      </footer>
    </div>
  );
}
