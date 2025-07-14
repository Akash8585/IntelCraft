import logging
import os
from typing import Any, Dict

from langchain_core.messages import AIMessage
from openai import AsyncOpenAI

from ..classes import ResearchState

logger = logging.getLogger(__name__)


class EmailGenerator:
    """Generates a personalized cold outreach email based on the research report."""

    def __init__(self) -> None:
        self.openai_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")

        self.openai_client = AsyncOpenAI(api_key=self.openai_key)

    async def generate_email(self, state: ResearchState) -> str:
        company = state.get("company", "Unknown Company")
        industry = state.get("industry", "Unknown Industry")
        report = state.get("report", "")
        help_description = state.get("help_description", "")
        hq_location = state.get("hq_location", "Unknown")

        prompt = f"""
You are a professional outreach strategist. Write a personalized, high-conversion cold email to the team at {company}, a {industry} company headquartered in {hq_location}.

VALUE PROPOSITION FROM USER:
{help_description if help_description else "No specific value proposition provided - use general business value"}

Structure the email as follows:
1. Open with a genuine compliment or insight based on their recent work/achievements from the research
2. Briefly explain how you can help them (based on the value proposition above)
3. Connect your value to their specific business needs or challenges
4. Close with a casual, respectful call-to-action

Strict requirements:
- Maximum 180 words
- No generic fluff or over-selling
- Sound natural and conversational
- Use markdown formatting (**bold** or *italic*) sparingly for emphasis
- Do NOT include subject line, greeting, or signature
- Focus on THEIR needs, not YOUR capabilities

Company research context:
{report}

Generate the email body only - clean, crisp, and highly relevant to {company}.
        """

        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert B2B outreach writer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                stream=False
            )

            email = response.choices[0].message.content.strip()
            return email

        except Exception as e:
            logger.error(f"Error generating email: {e}")
            return ""

    async def compile_email(self, state: ResearchState) -> ResearchState:
        company = state.get("company", "Unknown Company")

        # Real-time feedback
        if websocket_manager := state.get("websocket_manager"):
            if job_id := state.get("job_id"):
                await websocket_manager.send_status_update(
                    job_id=job_id,
                    status="processing",
                    message=f"Generating outreach email for {company}",
                    result={"step": "EmailGenerator", "substep": "start"}
                )

        email_text = await self.generate_email(state)

        if email_text:
            logger.info("Generated outreach email")
            logger.info(email_text)
            state["email"] = email_text
            if "email_generator" not in state:
                state["email_generator"] = {}
            state["email_generator"]["email"] = email_text

            if websocket_manager := state.get("websocket_manager"):
                if job_id := state.get("job_id"):
                    await websocket_manager.send_status_update(
                        job_id=job_id,
                        status="email_ready",
                        message="Outreach email generated",
                        result={
                            "step": "EmailGenerator",
                            "email": email_text,
                            "company": company
                        }
                    )
        else:
            logger.warning("No email was generated.")

        return state

    async def run(self, state: ResearchState) -> ResearchState:
        return await self.compile_email(state)
