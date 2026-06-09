export interface RoadmapBlock {
  id: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'skipped' | 'archived'
  priority: 'low' | 'medium' | 'high'
  dependencies: string[]
  children: string[]
  createdAt: string
  updatedAt: string
  effort?: string
  owner?: string
}

export async function generateRoadmap(projectContext: any, memoryContext: any): Promise<RoadmapBlock[]> {
  const systemPrompt = `
    You are the Execution Coach agent. Your job is to generate a dynamic execution roadmap for a startup founder.
    Project: ${projectContext.name}
    Description: ${projectContext.description}
    Memory Facts: ${JSON.stringify(memoryContext.facts)}

    Requirements:
    - Generate 5-8 high-level roadmap blocks.
    - Each block must be specific to the project.
    - Return valid JSON matching the RoadmapBlock interface but exclude createdAt/updatedAt.
    - Status should be 'not_started'.

    Output format:
    [
      {
        "id": "unique-id",
        "title": "Block Title",
        "description": "Short description",
        "status": "not_started",
        "priority": "high",
        "dependencies": [],
        "children": []
      }
    ]
  `

  try {
    // @ts-ignore
    const response = await window.api.aiChat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the initial execution roadmap.' }
      ]
    })

    const rawContent = response.choices[0].message.content
    // Extract JSON if model wraps it in markdown blocks
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/)
    const blocks: RoadmapBlock[] = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent)

    const now = new Date().toISOString()
    return blocks.map(b => ({
      ...b,
      createdAt: now,
      updatedAt: now
    }))
  } catch (error) {
    console.error('Roadmap generation error:', error)
    throw error
  }
}
