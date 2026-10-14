export interface Word {
  id: number
  text: string
  phonetic: string
  meanings: string[]
  example: string
  level: string
}

export interface Stats {
  total: number
  newCount: number
  dueNow: number
  known: number
  unknown: number
}