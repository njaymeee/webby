import type { VercelRequest, VercelResponse } from '@vercel/node'

const CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET!
const REFRESH_TOKEN = process.env.VITE_SPOTIFY_REFRESH_TOKEN!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    // Step 1 - Check env vars are loaded
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      return res.status(500).json({ 
        error: 'Missing env vars',
        hasClientId: !!CLIENT_ID,
        hasClientSecret: !!CLIENT_SECRET,
        hasRefreshToken: !!REFRESH_TOKEN,
      })
    }

    // Step 2 - Get token and show raw response
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
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

    const rawText = await tokenRes.text()

    // Return raw response so we can see exactly what Spotify says
    return res.status(200).json({
      status: tokenRes.status,
      rawResponse: rawText,
    })

  } catch (err) {
    return res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  }
}