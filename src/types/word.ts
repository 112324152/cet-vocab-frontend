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
export interface FamilyMember {
  text: string
  relation: string
  phonetic: string
  meaning: string
}

export interface WordFamily {
  lemmaId: number
  lemma: string
  members: FamilyMember[]
}
