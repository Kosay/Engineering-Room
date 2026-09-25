# KMH AI Engineering Room

> **Rigorous Engineering Investigation Workspace**  
> *Distinguishing hypotheses from verified facts through structured Epistemic Claims, Multi-Agent Debate, Evidence Verification, Experiments, Reconciliation, and Architectural Decisions.*

---

## 🚀 Overview

**KMH AI Engineering Room** is a collaborative workspace designed for software architects, systems engineers, and AI research teams to conduct rigorous engineering investigations. Unlike standard conversational chat interfaces, KMH structures engineering problem-solving into a formal **Epistemic State Machine** that enforces verification before arriving at technical decisions.

---

## ✨ Key Features

- 🔍 **Structured Epistemic Claims & Verification**: Track hypotheses (`unverified`, `supported`, `disputed`, `disproved`, `verified`) backed by verifiable evidence and executable experiments.
- 🤖 **Multi-Agent Specialist Roles**:
  - **Architect**: System design & decision proposal synthesis.
  - **Adversarial Reviewer**: Stress-tests assumptions, edge cases, and failure modes.
  - **Independent Analyst**: Objective analysis of trade-offs and alternative solutions.
  - **Evidence Researcher**: Gathers and evaluates technical documentation and sources.
  - **Experiment Agent**: Formulates test cases, reproducible code samples, and benchmark specs.
  - **Implementation Agent**: Generates actionable implementation blueprints and code patches.
  - **Human Engineer**: Human-in-the-loop oversight and final decision approval.
- ⚡ **Automated Gemini AI Analysis**: Integrated server-side Gemini 2.5/3.0 model workflow for automated multi-perspective debate, evidence evaluation, and reconciliation synthesis.
- 📑 **Comprehensive Investigation Phases**:
  1. `Question`: Define the core engineering challenge or issue.
  2. `Analysis`: Initial breakdown and architectural assessment.
  3. `Debate`: Multi-agent adversarial discussion and trade-off analysis.
  4. `Evidence`: Gathering documentation, benchmark logs, and source snippets.
  5. `Experiment`: Formulating and running test pipelines.
  6. `Reconciliation`: Resolving conflicting claims and evidence points.
  7. `Decision`: Drafting and approving final engineering decisions.
  8. `Implementation`: Actionable execution plans and code output.
- 🔒 **Firebase Realtime Persistence & Authentication**: Firestore backend for workspace organizations, role-based access, and real-time collaboration.

---

## 📐 Epistemic Architecture & Lifecycle

```
[ Question ] ➔ [ Analysis ] ➔ [ Debate ] ➔ [ Evidence Gathering ]
                                                  │
                                                  ▼
[ Decision ] ◄─ [ Reconciliation ] ◄─ [ Experimentation ]
     │
     ▼
[ Implementation ] ➔ [ Completed Fact ]
```

1. **Claims**: Individual engineering assertions with epistemic status tracking.
2. **Evidence**: Graded by reliability (`high`, `medium`, `low`, `unverified`) and type (`official_doc`, `source_code`, `benchmarks`, etc.).
3. **Experiments**: Managed test specifications with status tracking (`draft`, `running`, `completed`) and outcome recording (`passed`, `failed`, `partial`).
4. **Reconciliation**: Formal resolution mechanism for conflicting findings.
5. **Decisions**: Architectural decision records (ADR) linked directly to supporting evidence and experiment outcomes.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion
- **Backend / API**: Express (Node.js + `tsx`), Vite Middleware integration
- **AI Engine**: `@google/genai` (Google Gemini API)
- **Database & Auth**: Firebase Firestore & Firebase Auth

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/kmh-ai-engineering-room.git
   cd kmh-ai-engineering-room
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   # Google Gemini API Key for Server-Side AI Analysis
   GEMINI_API_KEY=your_gemini_api_key_here

   # Firebase Configuration (Required for persistence and auth)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Development Server

Run the full-stack development server (Express server with Vite middleware):

```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 📁 Project Structure

```
├── server.ts                  # Express server entry point (Gemini API routes)
├── index.html                 # Main HTML entry point
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── metadata.json              # Applet metadata
└── src/
    ├── App.tsx                # Primary application router & view manager
    ├── main.tsx               # React application mounting
    ├── index.css              # Global styles (Tailwind CSS)
    ├── components/            # UI Components
    │   ├── auth/              # Sign-in & Authentication forms
    │   ├── common/            # Buttons, Badges, Cards, Loaders
    │   ├── investigation/     # Claim, Evidence, Experiment & Decision editors
    │   ├── modals/            # AI Prompt & Action modals
    │   ├── navigation/        # Header, Sidebar & Workspace tabs
    │   ├── room/              # Live Engineering Room workspace view
    │   └── views/             # Investigation lists, dashboards & settings
    ├── lib/                   # Integrations & Utilities
    │   ├── auth-context.tsx   # Auth Context provider
    │   ├── firebase.ts        # Firebase initialization
    │   └── firestore-service.ts # Realtime Firestore data operations
    └── types/                 # Domain types & Epistemic State Machine interface
```

---

## 🧪 Available Scripts

- `npm run dev`: Starts the local development server on port 3000.
- `npm run build`: Compiles TypeScript and builds production assets with Vite.
- `npm run start`: Runs the production Express server (`node server.ts`).
- `npm run lint`: Performs static type checking with `tsc --noEmit`.
- `npm run clean`: Cleans build output directories.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
