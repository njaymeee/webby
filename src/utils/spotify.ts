const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET

// Get access token using Client Credentials flow
async function getAccessToken(): Promise<string> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  cover: string
  creator: string
  songCount: number
  hours: number
  minutes: number
  spotifyUrl: string
}

export async function fetchPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  const token = await getAccessToken()

  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()

  // Calculate total duration
  const totalMs = (data.tracks?.items ?? []).reduce(
    (acc: number, item: any) => acc + (item?.track?.duration_ms ?? 0), 0
  )

  const totalMinutes = Math.floor(totalMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return {
    id: data.id,
    name: data.name ?? 'Untitled',
    description: data.description ? data.description.replace(/<[^>]+>/g, '') : 'No description.',
    cover: data.images?.[0]?.url ?? '',
    creator: data.owner?.display_name ?? 'Njay',
    songCount: data.tracks?.total ?? 0,
    hours,
    minutes,
    spotifyUrl: data.external_urls?.spotify ?? '#',
  }
}