export interface LookupResult {
  word: string
  phonetic: string
  translation: string
  tag: string
}

export interface CollectedWord {
  id: number
  word: string
  phonetic: string
  translation: string
  context: string
  collectedAt: string
}