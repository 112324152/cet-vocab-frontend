export interface Overview {
  totalWords: number
  learnedWords: number
  newWords: number
  totalReviews: number
  studyDays: number
  accuracyPercent: number
  dueNow: number
}

export interface DailyStat {
  date: string
  total: number
  knownCount: number
}

export interface HardestWord {
  wordId: number
  text: string
  phonetic: string
  firstMeaning: string
  lapses: number
  intervalMinutes: number
  easeFactor: number
}

export interface IntervalBucket {
  bucket: string
  count: number
}