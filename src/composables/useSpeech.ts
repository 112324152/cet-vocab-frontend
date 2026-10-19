import { ref } from 'vue'

export function useSpeech() {
  const speaking = ref(false)
  let currentAudio: HTMLAudioElement | null = null

  function stop() {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      currentAudio = null
    }
    speaking.value = false
  }

  async function speak(wordId: number) {
    stop()
    const audio = new Audio(`/api/words/${wordId}/audio`)
    currentAudio = audio
    speaking.value = true

    audio.addEventListener('ended', () => { speaking.value = false })
    audio.addEventListener('error', () => { speaking.value = false })

    try {
      await audio.play()
    } catch {
      speaking.value = false
    }
  }

  return { speak, stop, speaking }
}