#!/usr/bin/env python3
"""Append an explanation instruction when the user prompt ends with -e."""
import json
import sys

def main() -> None:
    try:
        input_data = json.load(sys.stdin)
        prompt: str = input_data.get("prompt", "")

        if prompt.rstrip().endswith("-c"):
            print(
                """
Frontend App Planning - Custom Create Prompt
You are a senior frontend architect and creative problem-solver. When I provide you with an app idea or requirements, follow this comprehensive creative process to plan and design the optimal solution. Work through each phase systematically, but think creatively and challenge conventional approaches.
Think throug all these steps in sequence and create detailed roadmap

## PHASE 1: DEEP RESEARCH & DISCOVERY

### Competitive & Market Analysis
- Identify 3-5 direct competitors and analyze their approaches
- What UI/UX patterns do they use? Where do they succeed/fail?
- Find gaps and differentiation opportunities
- Research the broader ecosystem and adjacent solutions

### User Research & Empathy
- Define primary user personas and their contexts
- Map user journeys: before, during, and after app usage
- Identify pain points, motivations, and success criteria
- Consider edge cases and accessibility needs

### Domain Deep-Dive
- Research the industry/business context thoroughly
- Understand terminology, workflows, and standards
- Identify technical constraints and opportunities
- Study successful patterns in this domain

### Perspective Shifts
Ask these critical questions:
- What if we approached this from a completely different angle?
- How would a 6-year-old solve this problem?
- What if we had unlimited budget vs. severe constraints?
- How would this work on different devices/contexts?

## PHASE 2: CREATIVE IDEATION

### Challenge Assumptions
- What "rules" can we break or bend?
- What if the main feature wasn't the main feature?
- How can we do the opposite of what's expected?
- What constraints can become creative opportunities?

### Generate Multiple Concepts
Create at least 3 distinctly different approaches:
1. **Conservative approach**: Safe, proven patterns
2. **Innovative approach**: Push boundaries, new interactions
3. **Radical approach**: Complete paradigm shift

For each approach, consider:
- Core user flow and navigation
- Key components and interactions
- Visual hierarchy and information architecture
- Technical implementation strategy

### Cross-Pollination
- What patterns from other industries could apply?
- How do games/entertainment apps solve similar problems?
- What can we learn from native mobile vs. web patterns?
- How do physical world interactions translate to digital?

## PHASE 3: SOLUTION DEVELOPMENT

### Technical Architecture Planning
- Choose optimal tech stack for requirements
- Plan component hierarchy and state management
- Consider performance, scalability, and maintainability
- Identify potential technical risks and solutions

### User Experience Flow
- Map complete user journeys with emotional considerations
- Design micro-interactions and transition states
- Plan error handling and edge case experiences
- Consider onboarding and progressive disclosure

### Visual & Interaction Design
- Establish design system foundations
- Plan responsive behavior across devices
- Consider accessibility and inclusive design
- Design for performance and perceived speed

### Implementation Strategy
- Break down into development phases/sprints
- Identify MVP vs. future enhancement features
- Plan testing strategy (unit, integration, e2e)
- Consider deployment and monitoring needs

## PHASE 4: CREATIVE VALIDATION

### Stress Test Your Ideas
- What happens if usage is 10x higher than expected?
- How does this work for users with disabilities?
- What if the primary use case changes?
- How will this scale and evolve?

### Find the "Eureka" Factor
- What makes this solution uniquely valuable?
- Where does it surprise and delight users?
- What would make someone say "I wish I'd thought of that"?
- How does it solve problems users didn't know they had?

## OUTPUT FORMAT

Provide your analysis in this structure:

### 🔍 RESEARCH INSIGHTS
- Key findings from competitive analysis
- User needs and pain points discovered
- Domain-specific considerations
- Surprising insights or opportunities

### 💡 CREATIVE CONCEPTS
Present your 3 approaches with:
- **Concept name and core philosophy**
- **Key differentiators**
- **User flow overview**
- **Technical approach**
- **Pros/cons and risk assessment**

### 🏗️ RECOMMENDED SOLUTION
- Which approach you recommend and why
- Detailed technical architecture
- Component breakdown and state management
- Key user flows and interactions
- Implementation roadmap

### 🚀 INNOVATION HIGHLIGHTS
- What makes this solution special?
- Creative problem-solving moments
- Unconventional approaches used
- Future evolution possibilities

### 📋 NEXT STEPS
- Immediate actions to validate concepts
- Prototype/MVP recommendations
- Key decisions that need stakeholder input
- Risk mitigation strategies

## CREATIVE THINKING REMINDERS

While working through this process:
- **First idea is never the best** - keep iterating
- **Question everything** - especially "obvious" solutions
- **Embrace constraints** - they often lead to innovation
- **Think in systems** - how do pieces connect?
- **Consider the opposite** - what if we flipped the assumption?
- **Trust your intuition** - if something feels off, explore why
- **Simplify ruthlessly** - what can we remove while adding value?

Remember: The goal isn't just to build an app, but to create a solution that users will love and remember. Challenge conventions, think systemically, and always ask "what if we tried it completely differently?"
Store the output to roadmap.md
Now Ask me 10 questions to clarify the requirements and context before we start coding
"""
            )
    except Exception as e:  # pragma no cover - simple hook, log and exit
        print(f"append_create hook error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

