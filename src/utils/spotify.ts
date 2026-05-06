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
// Spotify Premium Toggle
export const USE_SPOTIFY_API = false

export async function fetchPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  const res = await fetch(`/api/playlist?id=${playlistId}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}