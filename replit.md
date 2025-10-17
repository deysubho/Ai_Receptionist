# AI Supervisor Dashboard - Human-in-the-Loop System

## Overview

A human-in-the-loop AI voice receptionist system for Bella's Beauty Salon. When the AI agent doesn't know an answer during customer calls, it intelligently escalates questions to a human supervisor dashboard. The supervisor provides answers which are immediately relayed back to customers and automatically added to the AI's knowledge base for future reference.

The system comprises three main components:
- **LiveKit Voice Agent** (Python): Handles incoming customer calls, manages conversations, and escalates unknown questions
- **Supervisor Dashboard** (React/TypeScript): Web interface for supervisors to view and respond to escalated requests
- **Backend API** (Express/Node.js): Manages data persistence and coordinates between the agent and dashboard

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom dark mode design system (Linear/productivity-focused approach)
- **State Management**: TanStack Query (React Query) for server state with 3-second polling for real-time updates
- **Routing**: Wouter for lightweight client-side routing
- **Key Design Decisions**:
  - Single-page dashboard application with tab-based filtering (All/Pending/Resolved)
  - Real-time auto-refresh every 3 seconds to ensure supervisors see new requests immediately
  - Dark mode as default for reduced eye strain during extended use
  - Information-dense layout optimized for rapid decision-making

### Backend Architecture
- **Framework**: Express.js (Node.js)
- **API Style**: RESTful endpoints
- **Database**: SQLite for lightweight, file-based persistence (currently using better-sqlite3, though drizzle.config.ts references PostgreSQL for future migration)
- **Schema Definition**: Drizzle ORM with schema validation via Zod
- **Key Tables**:
  - `customers`: Stores caller information (name, phone)
  - `help_requests`: Tracks escalated questions with status lifecycle (pending → processing → resolved/timeout)
  - `knowledge_base`: Stores learned Q&A pairs with usage tracking
- **API Endpoints**:
  - `GET /api/requests`: Fetch all help requests with customer data
  - `POST /api/requests`: Create new escalation (called by AI agent)
  - `PATCH /api/requests/:id/answer`: Submit supervisor answer
  - `GET /api/knowledge`: Retrieve knowledge base entries
- **Storage Pattern**: Repository pattern with `IStorage` interface and `SQLiteStorage` implementation for database abstraction

### LiveKit Voice Agent
- **Framework**: LiveKit Agents SDK (Python)
- **AI Model**: OpenAI GPT for natural language understanding
- **Voice Processing**: Silero VAD (Voice Activity Detection) for speech recognition
- **Core Functionality**:
  - Answers questions from hardcoded salon knowledge (hours, services, pricing)
  - Checks knowledge base for previously learned answers before escalating
  - Detects when it doesn't know an answer and creates help request via API
  - Captures customer context (name, phone) for follow-up
  - Simulates immediate callback when supervisor provides answer
- **Function Tools**: Custom function_tool decorators for structured actions (escalation, knowledge lookup)

### Status Lifecycle
1. **Pending**: New help request created by AI agent
2. **Processing**: Supervisor is actively composing an answer
3. **Resolved**: Answer submitted; customer notified, knowledge base updated
4. **Timeout**: (Reserved for future implementation) Request expired without response

### Knowledge Base Learning
- Automatic learning: Every supervisor answer creates/updates knowledge base entry
- Deduplication: Questions are normalized to prevent duplicate entries
- Usage tracking: Counts how many times each answer is referenced
- Search capability: Full-text search across questions and answers in dashboard

## External Dependencies

### Third-Party Services
- **LiveKit Cloud**: Voice communication infrastructure for real-time audio streaming and WebRTC
- **OpenAI API**: GPT models for natural language processing in the voice agent

### Database
- **SQLite**: File-based relational database (database.sqlite)
- **Future Migration Path**: Configuration present for PostgreSQL via Drizzle ORM (though not currently active)

### Key Libraries
- **Frontend**:
  - React 18 with TypeScript
  - TanStack Query for data fetching
  - Radix UI primitives for accessible components
  - Tailwind CSS for styling
  - date-fns for time formatting
  - Wouter for routing
  
- **Backend**:
  - Express.js for HTTP server
  - better-sqlite3 for database access
  - Drizzle ORM for schema management
  - Zod for validation
  
- **Voice Agent**:
  - livekit-agents SDK
  - livekit-plugins-openai for GPT integration
  - livekit-plugins-silero for voice activity detection
  - requests for HTTP API calls
  - python-dotenv for environment configuration

### Environment Configuration
Required environment variables:
- `OPENAI_API_KEY`: OpenAI API authentication
- `LIVEKIT_URL`: LiveKit cloud server URL
- `LIVEKIT_API_KEY`: LiveKit API key
- `LIVEKIT_API_SECRET`: LiveKit API secret
- `API_BASE_URL`: Backend API endpoint (defaults to http://localhost:5000)
- `DATABASE_URL`: PostgreSQL connection string (for future migration)

### Development Tools
- Vite with HMR for fast frontend development
- Replit-specific plugins for development banner and error overlay
- ESBuild for backend bundling in production
- TypeScript compiler for type checking