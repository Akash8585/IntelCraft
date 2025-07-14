import os
import logging
from typing import Dict
from openai import AsyncOpenAI

from ..classes import ResearchState

logger = logging.getLogger(__name__)


class ProposalGenerator:
    """Generates a tailored 1–2 page partnership proposal in Markdown format."""

    def __init__(self) -> None:
        self.openai_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        self.client = AsyncOpenAI(api_key=self.openai_key)

    async def generate_proposal(self, state: ResearchState) -> ResearchState:
        company = state.get("company")
        company_research = state.get("report", "")
        help_description = state.get("help_description", "")

        if not company or not company_research:
            logger.error("Missing required input (company or report)")
            return state
        
        if not help_description:
            logger.warning("No help description provided - using generic proposal template")
            help_description = "We provide innovative solutions to help companies achieve their business goals."

        # Real-time feedback
        if websocket_manager := state.get("websocket_manager"):
            if job_id := state.get("job_id"):
                await websocket_manager.send_status_update(
                    job_id=job_id,
                    status="processing",
                    message=f"Generating partnership proposal for {company}",
                    result={"step": "ProposalGenerator", "substep": "start"}
                )

        prompt = self._build_prompt(company, company_research, help_description)

        try:
            logger.info(f"Generating proposal for: {company}")
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert B2B proposal writer. You write concise, persuasive, markdown-formatted partnership proposals tailored to each company's goals."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7
            )

            content = response.choices[0].message.content.strip()
            logger.info("Proposal successfully generated")

            state["proposal"] = content
            if "editor" not in state:
                state["editor"] = {}
            state["editor"]["proposal"] = content
            state["status"] = "proposal_complete"

            # Send proposal ready notification
            if websocket_manager := state.get("websocket_manager"):
                if job_id := state.get("job_id"):
                    await websocket_manager.send_status_update(
                        job_id=job_id,
                        status="proposal_ready",
                        message="Partnership proposal generated",
                        result={
                            "step": "ProposalGenerator",
                            "proposal": content,
                            "company": company
                        }
                    )

            return state

        except Exception as e:
            logger.error(f"Proposal generation failed: {e}")
            return state

    async def run(self, state: ResearchState) -> ResearchState:
        return await self.generate_proposal(state)

    def _build_prompt(self, company: str, research: str, help_description: str) -> str:
        return f"""
Company: {company}
Research Summary:
{research}

How We Can Help (Value Proposition):
{help_description}

---

Please write a long-form, markdown-formatted business proposal (1–2 pages max) to {company}. The proposal should be structured as follows:

# Partnership Proposal for {company}

## Introduction
- Brief summary of who we are and why we're reaching out
- Reference {company}’s mission or products (based on research)

## Solution Fit
- Describe how our product/service fits into {company}’s current strategy, problems, or workflow
- Use user note context directly

## Technical Capabilities
- Brief overview of relevant features or technology
- Focus on integration points with {company}’s stack, products, or pain points

## Use Case Examples
- Mention specific use cases or benefits for their team
- Relate to examples in the research if available

## Pricing / Next Steps
- Suggest next steps (e.g., quick call, trial, demo)
- (Optional) Mention pricing or flexible plans

Return only clean markdown with section headers. Do not add commentary or instructions.
"""

