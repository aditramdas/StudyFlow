````markdown
# StudyFlow Full System Architecture

This document describes the complete end-to-end architecture for StudyFlow, building on your existing frontend. It includes:

1. **File & Folder Structure**
2. **Component Responsibilities**
3. **State Management & Persistence**
4. **Service Connectivity & Data Flow**

---

## 1. File & Folder Structure

```bash
project-root/
│   .gitignore
│   architecture.md        # This document
│   bun.lockb
│   components.json
│   eslint.config.js
│   index.html             # Vite entrypoint
│   package-lock.json
│   package.json
│   postcss.config.js
│   README.md
│   tailwind.config.ts
│   tsconfig.app.json
│   tsconfig.json
│   tsconfig.node.json
│   vite.config.ts
│
├── public/                # Static assets served by Vite
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/                   # React application
│   ├── App.css
│   ├── App.tsx            # Root component, routing
│   ├── index.css
│   ├── main.tsx           # ReactDOM render
│   ├── vite-env.d.ts
│   │
│   ├── components/        # Feature and UI components
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── CourseCard.tsx
│   │   ├── Header.tsx
│   │   ├── LearningAidsPanel.tsx
│   │   └── StudyPlannerCard.tsx
│   │   └── ui/            # shadcn/ui primitives & overrides
│   │       ├── accordion.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       └── … (all other UI primitives)
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── lib/               # Shared utilities
│   │   └── utils.ts       # date formatting, debounce, etc.
│   │
│   └── pages/             # Route-connected views
│       ├── Index.tsx      # Dashboard
│       └── NotFound.tsx
│
├── backend/               # (Proposed) microservices
│   ├── auth-service/
│   │   └── src/           # signup/login, JWT issuance + validation
│   │
│   ├── ingestion-service/
│   │   └── src/           # file upload, S3 storage, metadata → PostgreSQL, emit events
│   │
│   ├── nlp-service/
│   │   └── src/           # OCR, summarization, flashcard + concept extraction → Neo4j & PostgreSQL
│   │
│   ├── scheduler-service/
│   │   └── src/           # SM-2 spaced-repetition, `/schedule/today`, emit reminders
│   │
│   ├── analytics-service/
│   │   └── src/           # ingest user events, aggregate metrics → PostgreSQL
│   │
│   └── notification-service/
│       └── src/           # send push/email/in-app based on scheduler/analytics events
│
├── shared/                # Common libraries
│   ├── auth/              # JWT helpers, middleware
│   ├── db/                # PostgreSQL ORM setup & connections
│   └── messaging/         # RabbitMQ/Kafka client wrappers
│
├── infra/                 # Deployment & CI
│   ├── k8s/               # Kubernetes manifests
│   ├── terraform/         # Cloud infra (RDS, S3, Redis, IAM)
│   └── ci/                # GitHub Actions / GitLab CI pipelines
│
└── docker-compose.yml     # Local dev: Postgres, Redis, RabbitMQ, Neo4j, all services
```
````

---

## 2. Component Responsibilities

| Component                | Port | Protocol  | Responsibility                                                                                             |
| ------------------------ | ---- | --------- | ---------------------------------------------------------------------------------------------------------- |
| **Vite Frontend**        | 5173 | HTTP      | React UI: Dashboard, Courses, Planner, Analytics, uses Axios to call backend APIs                          |
| **API Gateway**¹         | 8000 | HTTP/REST | Routes requests to microservices, handles JWT validation, CORS, rate-limiting                              |
| **Auth Service**         | 3000 | REST      | User signup/login, JWT issuance & refresh, role management, token blacklist in Redis                       |
| **Ingestion Service**    | 3001 | REST      | `POST /upload` → save file to S3, metadata in Postgres, emit `document.uploaded` via RabbitMQ              |
| **NLP Service**          | 3002 | gRPC/REST | Consume `document.uploaded`, perform OCR + NLP pipelines, store summaries & flashcards, update Neo4j graph |
| **Scheduler Service**    | 3003 | REST      | Implement SM-2 algorithm, seed flashcard schedule in Redis, `GET /schedule/today`, emit reminders          |
| **Analytics Service**    | 3004 | REST      | Ingest study/quiz events, aggregate metrics (total time, scores, streaks), serve `/dashboard/metrics`      |
| **Notification Service** | 3005 | REST      | Subscribe to scheduler & analytics events, send email/push/in-app notifications                            |

¹API Gateway can be Kong, Ambassador, or a lightweight Node/Express proxy.

---

## 3. State Management & Persistence

| State Type                 | Owner(s)          | Storage Layer                                 |
| -------------------------- | ----------------- | --------------------------------------------- |
| **Static Assets**          | Frontend          | `public/` folder                              |
| **UI State & Cache**       | Frontend (store/) | Redux or Zustand in-memory                    |
| **Raw Course Files**       | Ingestion Service | S3 / Blob Storage                             |
| **User & Course Metadata** | Auth & Ingestion  | PostgreSQL                                    |
| **Parsed Artifacts**       | NLP Service       | PostgreSQL + Neo4j (knowledge graph)          |
| **Flashcard Schedules**    | Scheduler Service | Redis (sorted sets) + PostgreSQL              |
| **User Events & Metrics**  | Analytics Service | Time-series & relational tables in PostgreSQL |
| **Session Tokens**         | Auth Service      | Redis (JWT blacklist)                         |
| **Message Bus**            | All services      | RabbitMQ or Kafka                             |

---

## 4. Service Connectivity & Data Flow

```plaintext
[React UI]
  └─(Axios/HTTP)──► [API Gateway] ─┬─► Auth Service
                                  ├─► Ingestion Service ──► S3 + Postgres ──► RabbitMQ:document.uploaded
                                  ├─► NLP Service ──(consume)─► OCR/NLP ──► Postgres + Neo4j ──► RabbitMQ:nlp.completed
                                  ├─► Scheduler Service ──(consume)─► seed Redis schedule ──► RabbitMQ:reminder
                                  ├─► Analytics Service ──(consume events)─► aggregate Postgres
                                  └─► Notification Service ──(consume)─► send notifications
```

1. **User Login**

   - React calls `POST /auth/login` → Auth Service validates & returns JWT.

2. **Upload Course Material**

   - React `POST /upload` through Gateway → Ingestion Service saves file, metadata, emits `document.uploaded`.

3. **Content Processing**

   - NLP Service consumes `document.uploaded`, runs OCR/summarization, writes to Postgres & Neo4j, emits `nlp.completed`.

4. **Scheduling**

   - Scheduler Service consumes `nlp.completed`, seeds flashcard reviews in Redis, exposes `/schedule/today` to React.

5. **Study Sessions & Quizzes**

   - React fetches due flashcards via `/nlp/flashcards?due=today` and posts review results → Analytics Service ingests.

6. **Dashboard Metrics**

   - React fetches `/dashboard/metrics` → Analytics Service returns aggregated totals, weekly breakdown, subject performance.

7. **Notifications**

   - Scheduler & Analytics emit reminder events → Notification Service sends email/in-app alerts.

---

> **Note:** Each backend service is independently deployable, horizontally scalable, and communicates via a lightweight message bus (RabbitMQ/Kafka) for event-driven workflows. All long-term data lives in PostgreSQL (and Neo4j for graph data) while Redis handles ephemeral state and scheduling queues.

```bash
# Local dev bring-up
docker-compose up --build
```

```bash
# Deploy infra (example)
cd infra/terraform
terraform init && terraform apply
```

---
