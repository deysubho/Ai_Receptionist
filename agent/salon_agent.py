"""
LiveKit AI Voice Agent for Bella's Beauty Salon
Human-in-the-Loop Escalation System
"""

import asyncio
import logging
import os
import requests
from typing import Annotated
from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    RunContext,
    WorkerOptions,
    cli,
    function_tool,
)
from livekit.plugins import openai, silero

# Load environment variables
load_dotenv()

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5000")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Salon business knowledge
SALON_KNOWLEDGE = """
You are Bella, the AI receptionist for Bella's Beauty Salon - a premium hair and beauty salon.

**Business Information:**
- Location: 123 Main Street, Downtown
- Hours: Monday-Saturday 9 AM - 7 PM, Sunday 10 AM - 5 PM
- Phone: (555) 123-4567

**Services We Offer:**
- Haircuts: Women $60, Men $40, Kids $25
- Hair Coloring: Starting at $120
- Highlights: Starting at $100
- Keratin Treatment: $250
- Manicure: $35
- Pedicure: $50
- Spa Manicure & Pedicure Combo: $75
- Facials: $80 (60 min)
- Waxing: Various services available

**Policies:**
- We require 24-hour notice for cancellations
- Late arrivals may result in shortened service time
- We accept cash, credit cards, and digital payments
- Gratuity not included in prices (15-20% customary)

**Staff:**
- Sarah (Senior Stylist) - Specializes in color and cuts
- Maria (Nail Technician) - Expert in nail art
- Jessica (Esthetician) - Facial and skincare specialist

**Your Role:**
- Answer questions about our services, prices, hours, and policies
- Be friendly, professional, and helpful
- If you don't know the answer to something specific, ALWAYS escalate to your supervisor
- Never make up information or prices
"""

logger = logging.getLogger(__name__)


def search_knowledge_base(query: str) -> str:
    """Search the knowledge base for learned answers."""
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/knowledge/search",
            params={"q": query},
            timeout=5
        )
        if response.status_code == 200:
            results = response.json()
            if results:
                # Return the most relevant answer
                return results[0]["answer"]
    except Exception as e:
        logger.error(f"Error searching knowledge base: {e}")
    return None


def create_or_get_customer(name: str, phone: str) -> dict:
    """Create a new customer or get existing one."""
    try:
        # Try to get existing customer
        response = requests.get(
            f"{API_BASE_URL}/api/customers/phone/{phone}",
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
        
        # Create new customer
        response = requests.post(
            f"{API_BASE_URL}/api/customers",
            json={"name": name, "phone": phone},
            timeout=5
        )
        if response.status_code == 201:
            return response.json()
    except Exception as e:
        logger.error(f"Error creating customer: {e}")
    return None


@function_tool
async def request_help(
    context: RunContext,
    question: Annotated[str, "The question that the AI doesn't know the answer to"],
    customer_name: Annotated[str, "The customer's name"],
    customer_phone: Annotated[str, "The customer's phone number"],
):
    """
    Request help from human supervisor when the AI doesn't know the answer.
    This will:
    1. Check the knowledge base for learned answers
    2. If not found, escalate to supervisor
    3. Tell the customer you'll get back to them
    """
    
    logger.info(f"🤔 AI doesn't know: '{question}'")
    
    # First, search knowledge base
    kb_answer = search_knowledge_base(question)
    if kb_answer:
        logger.info(f"✅ Found answer in knowledge base!")
        return {
            "status": "found_in_knowledge_base",
            "answer": kb_answer
        }
    
    # Knowledge base doesn't have the answer, escalate to supervisor
    logger.info(f"📢 Escalating to supervisor...")
    
    # Create or get customer
    customer = create_or_get_customer(customer_name, customer_phone)
    if not customer:
        return {
            "status": "error",
            "message": "Failed to create customer record"
        }
    
    # Create help request
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/requests",
            json={
                "customerId": customer["id"],
                "question": question,
                "status": "pending"
            },
            timeout=5
        )
        
        if response.status_code == 201:
            request_data = response.json()
            logger.info(f"✅ Help request #{request_data['id']} created")
            
            return {
                "status": "escalated",
                "request_id": request_data["id"],
                "message": "I've forwarded your question to my supervisor. They'll get back to you shortly."
            }
    except Exception as e:
        logger.error(f"Error creating help request: {e}")
        return {
            "status": "error",
            "message": "Failed to escalate question"
        }


async def check_for_supervisor_response(request_id: int) -> dict:
    """Poll for supervisor response to a help request."""
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/requests/{request_id}",
            timeout=5
        )
        if response.status_code == 200:
            request = response.json()
            if request["status"] == "resolved" and request["answer"]:
                return {
                    "status": "resolved",
                    "answer": request["answer"]
                }
    except Exception as e:
        logger.error(f"Error checking supervisor response: {e}")
    return {"status": "pending"}


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the LiveKit agent."""
    
    logger.info("🎙️ Bella's Beauty Salon AI Agent starting...")
    
    await ctx.connect()
    
    # Create the AI agent
    agent = Agent(
        instructions=SALON_KNOWLEDGE,
        tools=[request_help],
    )
    
    # Create agent session with OpenAI
    session = AgentSession(
        vad=silero.VAD.load(),  # Voice Activity Detection
        stt=openai.STT(),  # Speech-to-Text
        llm=openai.LLM(model="gpt-4o-mini"),  # Language Model
        tts=openai.TTS(),  # Text-to-Speech
    )
    
    # Start the session
    await session.start(agent=agent, room=ctx.room)
    
    # Greet the caller
    await session.generate_reply(
        instructions="Greet the customer warmly and ask how you can help them today."
    )
    
    logger.info("✅ AI Agent is now active and ready to take calls")
    
    # Keep the agent running
    await session.wait_for_completion()


def main():
    """Run the LiveKit agent."""
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY environment variable is required")
    
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
            ws_url=os.getenv("LIVEKIT_URL"),
        )
    )


if __name__ == "__main__":
    main()
