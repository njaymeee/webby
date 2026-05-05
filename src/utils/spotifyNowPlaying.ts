const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
const REFRESH_TOKEN = import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN

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

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  })
  if (!res.ok) throw new Error('Failed to refresh Spotify token')
  const data = await res.json()
  return data.access_token
}

// Extract dominant color from album art using canvas
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
      r = Math.floor(r / count)
      g = Math.floor(g / count)
      b = Math.floor(b / count)
      resolve(`rgb(${r},${g},${b})`)
    }
    img.onerror = () => resolve('#3b82f6')
    img.src = imageUrl
  })
}

export async function fetchNowPlaying(): Promise<NowPlayingData | null> {
  try {
    const token = await getAccessToken()
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 204 || !res.ok) return null

    const data = await res.json()
    if (!data?.item) return null

    const albumArt = data.item.album.images?.[0]?.url ?? ''
    const accentColor = albumArt ? await getDominantColor(albumArt) : '#3b82f6'

    return {
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map((a: any) => a.name).join(', '),
      album: data.item.album.name,
      albumArt,
      progressMs: data.progress_ms ?? 0,
      durationMs: data.item.duration_ms ?? 0,
      accentColor,
    }
  } catch {
    return null
  }
}