# Tech Stack - NeuroExecução (KNH4)

**Versão:** 1.0
**Data:** 21/01/2026

---

## 🎨 Frontend

### Core Framework
- **React 18.2** - UI library com Concurrent Features
- **TypeScript 5.3** - Type safety e developer experience
- **Vite 5.0** - Build tool ultra-rápido

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Design Tokens CSS** - Matriz Crextio (custom CSS variables)
- **Inter Font** - Tipografia principal (Google Fonts)

### State Management
- **Context API** - Estado global leve
- **React Query 5.0** - Server state caching
- **Zustand 4.4** - Client state (alternativa ao Context)

### Routing
- **React Router 6.21** - Client-side routing
- **TanStack Router** - Type-safe routing (considerando migração)

### Forms & Validation
- **React Hook Form 7.49** - Formulários performáticos
- **Zod 3.22** - Schema validation com TypeScript

### UI Components
- **Custom Components** - Button, Card, Input (src/components/shared)
- **Headless UI** - Accessible components (modal, dropdown)
- **Radix UI** - Primitives para acessibilidade

### Data Visualization
- **Recharts 2.10** - Charts e gráficos
- **D3.js** - Visualizações customizadas (se necessário)

### Testing
- **Vitest 1.1** - Unit testing (compatível com Vite)
- **Testing Library 14.1** - Component testing
- **Playwright 1.40** - E2E testing
- **axe-core** - Accessibility testing

### Developer Tools
- **ESLint 8.56** - Linting
- **Prettier 3.1** - Code formatting
- **TypeScript ESLint** - TS-specific linting
- **Husky** - Git hooks

---

## ⚙️ Backend

### Core Framework
- **Node.js 20 LTS** - Runtime JavaScript
- **Express 4.18** - Web framework
- **TypeScript 5.3** - Type safety

### Database
- **PostgreSQL 15** - Relational database
- **Drizzle ORM 0.29** - Type-safe ORM
- **Drizzle Kit** - Migration tools

### Caching
- **Redis 7.2** - In-memory data store
- **ioredis 5.3** - Redis client para Node.js

### Authentication
- **JWT (jsonwebtoken 9.0)** - Token-based auth
- **bcrypt 5.1** - Password hashing
- **Passport.js** - Authentication middleware (opcional)

### Validation
- **Zod 3.22** - Schema validation (shared com frontend)
- **express-validator** - Request validation

### API Documentation
- **Swagger/OpenAPI 3.0** - API spec
- **swagger-ui-express** - UI para docs

### File Upload
- **Multer 1.4** - Multipart form data
- **Cloudinary SDK** - Cloud storage

### Background Jobs
- **BullMQ 5.1** - Queue system (Redis-based)
- **Agenda 5.0** - Job scheduling (alternativa)

### Logging
- **Winston 3.11** - Structured logging
- **Morgan** - HTTP request logging

### Monitoring
- **Sentry SDK** - Error tracking
- **Prometheus** - Metrics collection (futuro)

### Testing
- **Jest 29.7** - Unit testing
- **Supertest 6.3** - HTTP integration testing
- **faker-js 8.3** - Mock data generation

---

## 🤖 AI & Integrations

### AI Provider
- **Anthropic API** - Claude Sonnet 4.5
- **@anthropic-ai/sdk 0.9** - Official SDK

### AI Utilities
- **langchain 0.1** - LLM orchestration (considerar)
- **Custom prompt templates** - docs/prompts/

### External APIs
- **Axios 1.6** - HTTP client
- **node-fetch** - Fetch API para Node.js

---

## 🗄️ Database Schema

### ORM
- **Drizzle ORM**
  - Type-safe migrations
  - Zero runtime overhead
  - Autocomplete perfeito

### Migrations
```bash
npm run db:generate   # Gera migration
npm run db:migrate    # Executa migration
npm run db:push       # Push schema (dev)
npm run db:studio     # UI para DB
```

### Main Tables
```typescript
// Exemplo de schema Drizzle
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('free'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

---

## 🚀 Deployment & Infrastructure

### Frontend Hosting
- **Vercel**
  - Automatic HTTPS
  - Global CDN
  - Preview deployments
  - Edge functions

### Backend Hosting
- **Railway**
  - Container deployment (Docker)
  - Auto-scaling
  - PostgreSQL managed
  - Redis managed

### CI/CD
- **GitHub Actions**
  - Test on PR
  - Deploy on merge to main
  - Semantic versioning

### Monitoring
- **Vercel Analytics** - Frontend performance
- **LogRocket** - Session replay
- **Sentry** - Error tracking
- **PostHog** - Product analytics

### CDN & Assets
- **Cloudinary**
  - Image optimization
  - Video transcoding
  - Delivery via CDN

---

## 📦 Package Management

### Package Manager
- **npm** (padrão Node.js)
- **pnpm** (alternativa mais rápida, considerar)

### Key Dependencies

**Frontend (package.json):**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "axios": "^1.6.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.0",
    "playwright": "^1.40.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

**Backend (server/package.json):**
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.0",
    "ioredis": "^5.3.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "zod": "^3.22.0",
    "@anthropic-ai/sdk": "^0.9.0",
    "axios": "^1.6.0",
    "winston": "^3.11.0",
    "bullmq": "^5.1.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "drizzle-kit": "^0.20.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "supertest": "^6.3.0"
  }
}
```

---

## 🛠️ Development Tools

### IDE
- **VSCode** (recomendado)
  - Extensions:
    - ESLint
    - Prettier
    - Tailwind CSS IntelliSense
    - TypeScript Importer
    - Error Lens

### Database Tools
- **Drizzle Studio** - Visual DB editor
- **pgAdmin** - PostgreSQL management
- **TablePlus** - Multi-DB client

### API Testing
- **Postman** - API development
- **Insomnia** - REST client alternativo
- **Thunder Client** - VSCode extension

### Design
- **Figma** - UI/UX design
- **Excalidraw** - Diagramas rápidos

---

## 📊 Performance Budgets

### Frontend
- **Initial Bundle:** < 200KB gzipped
- **Lazy Loaded Chunks:** < 50KB each
- **Images:** WebP format, < 100KB
- **Fonts:** Subset Inter, < 30KB

### Backend
- **API Response Time:** < 200ms (P95)
- **Database Queries:** < 50ms (P95)
- **AI Responses:** < 3s (P95)
- **Memory Usage:** < 512MB per instance

---

## 🔐 Security Tools

### Dependencies
- **helmet** - HTTP security headers
- **cors** - CORS middleware
- **express-rate-limit** - Rate limiting
- **validator** - Input sanitization

### Auditing
- **npm audit** - Vulnerability scanning
- **Snyk** - Continuous security monitoring
- **OWASP ZAP** - Penetration testing

---

## 📱 Future Considerations

### Mobile
- **React Native** - Cross-platform mobile
- **Expo** - Managed React Native

### Desktop
- **Electron** - Desktop wrapper (se necessário)
- **Tauri** - Lightweight alternative

### Offline-First
- **Workbox** - Service Workers
- **IndexedDB** - Client-side storage
- **PouchDB** - Sync with CouchDB

---

**Última atualização:** 21/01/2026
**Mantido por:** Equipe NeuroExecução
