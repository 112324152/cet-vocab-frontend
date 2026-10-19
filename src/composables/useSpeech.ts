import { onMounted, ref } from 'vue'

export function useSpeech() {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const voices = ref<SpeechSynthesisVoice[]>([])

  function loadVoices() {
    if (!supported) return
    const list = window.speechSynthesis.getVoices()
    if (list.length > 0) {
      voices.value = list
    }
  }

  function pickEnglishVoice(): SpeechSynthesisVoice | null {
    if (voices.value.length === 0) return null
    const english = voices.value.filter((v) =>
      v.lang.toLowerCase().startsWith('en'),
    )
    if (english.length === 0) return null
    return (
      english.find((v) => v.lang === 'en-US') ||
      english.find((v) => v.lang === 'en-GB') ||
      english[0]
    )
  }

  function speak(text: string, rate = 0.9) {
    if (!supported || !text) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    utter.rate = rate
    utter.pitch = 1
    const voice = pickEnglishVoice()
    if (voice) utter.voice = voice
    window.speechSynthesis.speak(utter)
  }

  onMounted(() => {
    if (!supported) return
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
  })

  return { supported, speak }
}