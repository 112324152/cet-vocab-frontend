export interface Word {
  id: number
  text: string
  phonetic: string
  meanings: string[]
  example: string
  level: 'CET4' | 'CET6'
}

export interface Stats {
  total: number
  marked: number
  known: number
  unknown: number
}