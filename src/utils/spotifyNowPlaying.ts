export interface NowPlayingData {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string
  progressMs: number
  durationMs: number
  accentColor: string
}

export async function getDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 50
      canvas.height = 50
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve('#3b82f6')
      ctx.drawImage(img, 0, 0, 50, 50)
      const data = ctx.getImageData(0, 0, 50, 50).data
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 16) {
        r += data[i]; g += data[i+1]; b += data[i+2]; count++
      }
      resolve(`rgb(${Math.floor(r/count)},${Math.floor(g/count)},${Math.floor(b/count)})`)
    }
    img.onerror = () => resolve('#3b82f6')
    img.src = imageUrl
  })
}

export async function fetchNowPlaying(): Promise<NowPlayingData | null> {
  try {
    const res = await fetch('/api/now-playing')
    const data = await res.json()

    if (!data.isPlaying) return null

    const accentColor = data.albumArt ? await getDominantColor(data.albumArt) : '#3b82f6'

    return { ...data, accentColor }
  } catch {
    return null
  }
}