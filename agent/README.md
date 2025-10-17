# Bella's Beauty Salon - LiveKit AI Voice Agent

This is the Python-based LiveKit voice agent that handles customer calls for Bella's Beauty Salon.

## Features

- **Voice Receptionist**: Answers questions about salon services, prices, hours, and policies
- **Knowledge Base Integration**: Checks learned answers before escalating
- **Human-in-the-Loop**: Escalates unknown questions to supervisor
- **Immediate Callbacks**: Calls customers back with supervisor's answer
- **Self-Learning**: Automatically updates knowledge base with supervisor answers

## Setup

### 1. Install Dependencies

```bash
cd agent
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `OPENAI_API_KEY`: Your OpenAI API key (get from https://platform.openai.com/api-keys)
- `LIVEKIT_URL`: Your LiveKit cloud URL (get from https://cloud.livekit.io)
- `LIVEKIT_API_KEY`: Your LiveKit API key
- `LIVEKIT_API_SECRET`: Your LiveKit API secret

### 3. Run the Agent

```bash
# Development mode (console)
python salon_agent.py dev

# Or with LiveKit CLI
livekit-cli app dev
```

## How It Works

### Call Flow

1. **Customer calls** → LiveKit connects to agent
2. **AI greets** → "Hello! Welcome to Bella's Beauty Salon. How can I help you today?"
3. **Customer asks question** → AI uses salon knowledge to respond

### Escalation Flow (When AI Doesn't Know)

1. **Unknown question** → AI searches knowledge base
2. **Not found** → AI uses `request_help` tool
3. **Creates help request** → Stores in database with customer info
4. **Tells customer** → "Let me check with my supervisor and get back to you"
5. **Supervisor answers** → Via dashboard
6. **Immediate callback** → AI calls customer back with answer
7. **Knowledge base updated** → Future calls use learned answer

## Testing Without LiveKit Cloud

You can test the escalation and knowledge base integration without LiveKit:

1. Start the backend server
2. Use the dashboard to create test requests
3. The agent can query the knowledge base via HTTP API

## Agent Capabilities

### Built-in Knowledge
- Service prices and descriptions
- Business hours and location
- Cancellation policies
- Staff information

### Tool: `request_help`
Escalates unknown questions to supervisor with customer context.

Parameters:
- `question`: The question the AI doesn't know
- `customer_name`: Customer's name
- `customer_phone`: Customer's phone number

Returns:
- `status`: "found_in_knowledge_base", "escalated", or "error"
- `answer` or `message`: Response to use

## Monitoring

The agent logs all activities:
- 🎙️ Agent startup
- 🤔 Unknown questions
- 📢 Escalations
- ✅ Successful responses
- ❌ Errors

Check console output for real-time monitoring.

## Architecture

```
Customer Call
    ↓
LiveKit Room
    ↓
AI Agent (Python)
    ↓ (if unknown)
request_help tool
    ↓
Backend API
    ↓
Database (SQLite)
    ↓
Supervisor Dashboard
    ↓ (answer)
Backend API
    ↓
Knowledge Base Updated
    ↓
Agent Callback (simulated)
```

## Notes

- The agent requires OPENAI_API_KEY to function
- LiveKit credentials are needed for actual voice calls
- For testing, you can interact via console mode
- Supervisor responses trigger immediate customer callbacks
