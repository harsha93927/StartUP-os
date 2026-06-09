export interface MemorySchema {
  facts: string[]
  competitors: { name: string; description: string }[]
  risks: string[]
  opportunities: string[]
  decisions: { date: string; decision: string; rationale: string }[]
  roadmaps: string[]
  milestones: string[]
  reports: { agentId: string; filename: string; summary: string }[]
}

export async function updateProjectMemory(projectPath: string, newMemory: Partial<MemorySchema>): Promise<void> {
  try {
    // @ts-ignore
    const currentMemory = await window.api.readJson(projectPath, 'Memory/memory.json')
    const updatedMemory = {
      ...currentMemory,
      ...newMemory,
      facts: [...(currentMemory.facts || []), ...(newMemory.facts || [])],
      competitors: [...(currentMemory.competitors || []), ...(newMemory.competitors || [])],
      risks: [...(currentMemory.risks || []), ...(newMemory.risks || [])],
      opportunities: [...(currentMemory.opportunities || []), ...(newMemory.opportunities || [])],
      decisions: [...(currentMemory.decisions || []), ...(newMemory.decisions || [])],
      reports: [...(currentMemory.reports || []), ...(newMemory.reports || [])],
    }

    // @ts-ignore
    await window.api.writeJson(projectPath, 'Memory/memory.json', updatedMemory)
  } catch (error) {
    console.error('Failed to update project memory:', error)
  }
}
