export type WordState = 'new' | 'known' | 'unknown'

export interface Word {
  id: number
  text: string
  phonetic: string
  meanings: string[]
  example: string
  level: 'CET4' | 'CET6'
}