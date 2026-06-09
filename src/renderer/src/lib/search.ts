export interface SearchResult {
  id: string
  type: 'report' | 'roadmap' | 'memory' | 'milestone'
  title: string
  snippet: string
}

export async function globalSearch(projectPath: string, query: string): Promise<SearchResult[]> {
  try {
    // @ts-ignore
    const memory = await window.api.readJson(projectPath, 'Memory/memory.json')
    // @ts-ignore
    const roadmap = await window.api.readJson(projectPath, 'Memory/memory.json').then(m => m.roadmaps || [])

    const results: SearchResult[] = []

    // Search in Memory Facts
    if (memory.facts) {
      memory.facts.forEach((fact: string, index: number) => {
        if (fact.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: `fact-${index}`,
            type: 'memory',
            title: 'Memory Fact',
            snippet: fact
          })
        }
      })
    }

    // Search in Reports
    if (memory.reports) {
      memory.reports.forEach((report: any) => {
        if (report.summary.toLowerCase().includes(query.toLowerCase()) ||
            report.agentId.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: report.agentId,
            type: 'report',
            title: `${report.agentId.replace('_', ' ')} Report`,
            snippet: report.summary
          })
        }
      })
    }

    return results
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}
