import type { VercelRequest, VercelResponse } from '@vercel/node'

const CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET!

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing playlist id' })
  }

  try {
    const token = await getAccessToken()
    const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const rawText = await response.text()
    if (!response.ok) {
      return res.status(response.status).json({ error: rawText })
    }

    const data = JSON.parse(rawText)

    const totalMs = (data.tracks?.items ?? []).reduce(
      (acc: number, item: any) => acc + (item?.track?.duration_ms ?? 0), 0
    )
    const totalMinutes = Math.floor(totalMs / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return res.status(200).json({
      id: data.id,
      name: data.name ?? 'Untitled',
      description: data.description ? data.description.replace(/<[^>]+>/g, '') : 'No description.',
      cover: data.images?.[0]?.url ?? '',
      creator: data.owner?.display_name ?? 'Njay',
      songCount: data.tracks?.total ?? 0,
      hours,
      minutes,
      spotifyUrl: data.external_urls?.spotify ?? '#',
    })
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }
}