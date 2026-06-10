import { AGENT_REGISTRY } from './agents'

export interface Report {
  agentId: string
  title: string
  content: string
  timestamp: string
}

export async function generateAgentReport(agentId: string, projectContext: any): Promise<Report> {
  const agent = AGENT_REGISTRY[agentId]
  if (!agent) throw new Error(`Agent \${agentId} not found`)

  const systemPrompt = `
    \${agent.instructions}
    You are writing a professional report for a founder.
    Project: \${projectContext.name}
    Description: \${projectContext.description}

    The report should include:
    - Executive Summary
    - Key Findings
    - Risks
    - Opportunities
    - Recommendations
    - Next Actions

    Format as Markdown.
  `

  try {
    const response = await window.api.aiChat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate your specialist report based on the project context.' }
      ],
      model: 'meta/llama-3.1-405b-instruct'
    })

    if (!response || !response.choices || !response.choices[0]) {
      throw new Error('Invalid response from AI provider')
    }

    const content = response.choices[0].message.content

    return {
      agentId,
      title: `\${agent.name} Report`,
      content,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error(`Error generating report for \${agentId}:`, error)
    throw error
  }
}
