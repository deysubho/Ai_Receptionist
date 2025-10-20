# AI Supervisor Dashboard - Human-in-the-Loop System

A comprehensive human-in-the-loop AI voice receptionist system for Bella's Beauty Salon. When the AI doesn't know an answer, it intelligently escalates to a human supervisor, follows up with customers immediately, and updates its knowledge base automatically.

## 🎯 Key Features

### Voice AI Agent (Python + LiveKit)
- **Smart Receptionist**: Answers questions about salon services, pricing, hours, and policies
- **Knowledge Base Integration**: Checks learned answers before escalating
- **Intelligent Escalation**: Automatically detects when it doesn't know something
- **Customer Context**: Captures customer name and phone for follow-up

### Supervisor Dashboard (React + TypeScript)
- **Beautiful Dark UI**: Professional internal admin panel with exceptional visual quality
- **Real-time Updates**: Auto-refreshes every 3 seconds for pending requests
- **Request Management**: View, filter, and respond to escalated questions
- **Knowledge Base Viewer**: See all learned Q&A pairs with search functionality
- **Status Tracking**: Pending → Processing → Resolved lifecycle

### Backend System (Express + SQLite)
- **SQLite Database**: Lightweight, file-based storage for requests and knowledge
- **RESTful API**: Clean endpoints for all operations
- **Immediate Callbacks**: Simulates calling customer back instantly when supervisor responds
- **Auto-Learning**: Updates knowledge base with every supervisor answer

## 🏗️ Architecture

```
┌─────────────────┐
│  Customer Call  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  LiveKit AI Agent   │ (Python)
│  - Voice Recognition│
│  - OpenAI GPT       │
│  - Salon Knowledge  │
└────────┬────────────┘
         │ (if unknown)
         ▼
┌─────────────────────┐
│   Backend API       │ (Express.js)
│   - SQLite DB       │
│   - REST Endpoints  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Supervisor Dashboard│ (React)
│ - View Requests     │
│ - Submit Answers    │
│ - View Knowledge    │
└────────┬────────────┘
         │ (answer submitted)
         ▼
┌─────────────────────┐
│  Immediate Callback │
│  "Sorry for delay..." │
│  + Knowledge Update │
└─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.9+
- OpenAI API Key
- (Optional) LiveKit Cloud Account for actual voice calls

### 1. Clone and Install

```bash
# Install Node dependencies
npm install

# Install Python dependencies
cd agent
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment

The OpenAI API key is already set up in Replit Secrets. For LiveKit (optional):

```bash
cd agent
cp .env.example .env
# Edit .env with your LiveKit credentials
```

### 3. Start the Application

```bash
# Start the web server (dashboard + backend)
npm run dev
```

The dashboard will be available at `http://localhost:5000`

### 4. (Optional) Start the AI Agent

In a separate terminal:

```bash
cd agent
python salon_agent.py dev
```

## 📊 Database Schema

### help_requests
```sql
- id: INTEGER PRIMARY KEY
- customer_id: INTEGER (FK)
- question: TEXT
- status: TEXT (pending/processing/resolved/timeout)
- answer: TEXT
- created_at: TIMESTAMP
- resolved_at: TIMESTAMP
```

### customers
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT
- phone: TEXT
- created_at: TIMESTAMP
```

### knowledge_base
```sql
- id: INTEGER PRIMARY KEY
- question: TEXT
- answer: TEXT
- category: TEXT
- learned_at: TIMESTAMP
- usage_count: INTEGER
```

## 🎨 Design Decisions

### Request Lifecycle
- **Pending**: Waiting for supervisor answer
- **Processing**: Supervisor submitted answer, system is calling customer
- **Resolved**: Customer called back, knowledge base updated
- **Timeout**: Request expired (not implemented in MVP)

### Knowledge Base Updates
- Every supervisor answer is automatically saved
- Questions are matched semantically for future lookups
- Usage count tracks how often answers are reused
- Searchable by question or answer text

### Scalability Considerations
- **SQLite** for MVP (10-100 requests/day)
- **Connection pooling** ready for PostgreSQL migration
- **API rate limiting** prepared for high volume
- **Knowledge base indexing** for fast lookups
- **Polling interval** configurable (currently 3s)

### Error Handling
- Graceful degradation if knowledge base unavailable
- Retry logic for API calls
- Comprehensive logging for debugging
- User-friendly error messages

## 🔧 API Endpoints

### Help Requests
- `GET /api/requests` - List all requests with customer info
- `GET /api/requests/:id` - Get specific request
- `POST /api/requests` - Create new request (AI agent)
- `PATCH /api/requests/:id/answer` - Submit answer (supervisor)

### Knowledge Base
- `GET /api/knowledge` - List all entries
- `GET /api/knowledge/search?q=query` - Search entries

### Customers
- `GET /api/customers/phone/:phone` - Get customer by phone
- `POST /api/customers` - Create new customer

## 📈 Future Improvements

### Short-term (Next Sprint)
- Real Twilio integration for actual SMS/calls
- WebSocket for real-time dashboard updates
- Request timeout handling (24h expiry)
- Supervisor analytics dashboard

### Mid-term
- Semantic search for knowledge base (vector embeddings)
- Multi-language support
- Team management (multiple supervisors)
- Request assignment and routing

### Long-term
- PostgreSQL for production scale
- Redis for caching and pub/sub
- Machine learning for answer suggestions
- Integration with calendar for appointments
- Sentiment analysis on customer interactions

## 🧪 Testing

The system includes comprehensive test coverage:

```bash
# Run tests
npm test
```

To manually test the flow:
1. Open dashboard at `http://localhost:5000`
2. Use API to create test request (see agent README)
3. Submit answer via dashboard
4. Check console for callback simulation
5. Verify knowledge base updated

## 📝 Development Notes

### Code Quality
- TypeScript for type safety
- Zod for runtime validation
- Drizzle ORM for database schema
- React Query for data fetching
- Tailwind CSS for styling

### Design System
- Dark mode optimized
- Inter font for readability
- JetBrains Mono for data
- Consistent spacing (4, 6, 8px)
- Status color coding

### Modular Architecture
- Separate frontend/backend concerns
- Reusable React components
- Clean storage interface
- Extensible API design

## 🤝 Contributing

This is a technical assessment project demonstrating:
- Full-stack development skills
- System design thinking
- Code quality and organization
- UX/UI design principles
- AI integration capabilities

## 📄 License

Private - Technical Assessment Project

## 🙋 Support

For questions about the implementation, see:
- `agent/README.md` - Python agent details
- `design_guidelines.md` - UI/UX specifications
- Console logs - Real-time system behavior
