import type { VercelRequest, VercelResponse } from '@vercel/node'

const CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET!
const REFRESH_TOKEN = process.env.VITE_SPOTIFY_REFRESH_TOKEN!

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  })
  const rawText = await res.text()
  const data = JSON.parse(rawText)
  if (!data.access_token) throw new Error(`Token failed: ${rawText}`)
  return data.access_token
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')

  try {
    const token = await getAccessToken()
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 204 = no active player
    if (response.status === 204) {
      return res.status(200).json({ isPlaying: false, stopped: true })
    }

    const rawText = await response.text()
    if (!rawText) {
      return res.status(200).json({ isPlaying: false, stopped: true })
    }

    const data = JSON.parse(rawText)
    if (!data?.item) {
      return res.status(200).json({ isPlaying: false, stopped: true })
    }

    return res.status(200).json({
      isPlaying: data.is_playing,        // true = playing, false = paused
      stopped: false,
      title: data.item.name,
      artist: data.item.artists.map((a: any) => a.name).join(', '),
      album: data.item.album.name,
      albumArt: data.item.album.images?.[0]?.url ?? '',
      progressMs: data.progress_ms ?? 0,
      durationMs: data.item.duration_ms ?? 0,
      trackId: data.item.id,             // used to detect song change
      timestamp: Date.now(),             // client uses this for clock estimation
    })
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }
}