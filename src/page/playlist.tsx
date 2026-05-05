import { useEffect, useState } from 'react'
import { fetchPlaylist, type SpotifyPlaylist } from '../utils/spotify'
import './Playlist.css'

// ✅ ONLY EDIT THESE — paste your Spotify playlist IDs here
const PLAYLIST_IDS: string[] = [
  '1NK7dtDd3n63TveSWXdOVP',
  '3FGD24VPdy15NsgEHNIFHs',
  '4slv9IGJWzkqxbt0naAtmk',
]

// ✅ Accent colors — one per playlist
const ACCENT_COLORS: string[] = [
  '#6e8efb',
  '#f5a623',
  '#f472b6'
]

// ─── Vinyl Disc Component ───
function VinylDisc({ size = 120, accent = '#fff', spinning = false }: {
  size?: number
  accent?: string
  spinning?: boolean
}) {
  return (
    <div
      className={`vinyl-disc${spinning ? ' spinning' : ''}`}
      style={{ width: size, height: size, ['--accent']: accent } as React.CSSProperties}
    >
      <div className="vinyl-inner" />
    </div>
  )
}

// ─── Playlist Card ───
function PlaylistCard({ playlist, accent, index }: {
  playlist: SpotifyPlaylist
  accent: string
  index: number
}) {
  const [hovered, setHovered] = useState(false)

  const cardStyle = {
    ['--accent']: accent,
    ['--accent-faint']: accent + '18',
    ['--accent-mid']: accent + '44',
    animationDelay: `${index * 0.1}s`,
  } as React.CSSProperties

  return (
    <a
      href={playlist.spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="playlist-card"
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow layer */}
      <div className="card-glow" />

      {/* Cover + Vinyl */}
      <div className="card-cover-wrapper">
        {playlist.cover
          ? <img src={playlist.cover} alt={playlist.name} className="card-cover" />
          : <div className="card-cover-placeholder">🎵</div>
        }
        <div className="vinyl-peek-wrapper">
          <VinylDisc size={110} accent={accent} spinning={hovered} />
        </div>
        <div className="card-cover-overlay" />
      </div>

      {/* Info */}
      <div className="card-info">
        <h3 className="card-name">{playlist.name}</h3>
        {playlist.description && playlist.description !== 'No description.' && (
          <p className="card-description">{playlist.description}</p>
        )}
        <div className="card-creator">
          by <strong>{playlist.creator}</strong>
        </div>
        <div className="card-stats">
          <span className="stat">
            <span className="stat-icon">🎵</span>
            {playlist.songCount} songs
          </span>
          <span className="stat-divider">·</span>
          <span className="stat">
            <span className="stat-icon">🕐</span>
            {playlist.hours > 0 ? `${playlist.hours}h ` : ''}{playlist.minutes}m
          </span>
        </div>
        <div className="card-cta">
          <span>Open in Spotify</span>
          <span className="cta-arrow">↗</span>
        </div>
      </div>
    </a>
  )
}

// ─── Skeleton Loader ───
function PlaylistSkeleton() {
  return (
    <div className="playlist-card skeleton">
      <div className="skeleton-cover" />
      <div className="skeleton-info">
        <div className="skeleton-line wide" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line narrow" />
      </div>
    </div>
  )
}

// ─── Main Page ───
function Playlist() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const results = await Promise.all(PLAYLIST_IDS.map(id => fetchPlaylist(id)))
        setPlaylists(results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load playlists.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="playlist-page">

      {/* Animated wave background */}
      <div className="waves-bg" aria-hidden="true">
        <div className="wave wave1" />
        <div className="wave wave2" />
        <div className="wave wave3" />
      </div>

      <div className="playlist-content">

        {/* Page Header */}
        <header className="playlist-header">
          <VinylDisc size={72} accent="#a78bfa" spinning={true} />
          <div>
            <h1 className="playlist-title">My Playlists</h1>
            <p className="playlist-subtitle">Music is the only thing that makes sense.</p>
          </div>
        </header>

        {/* Error state */}
        {error && (
          <div className="status-box error">
            <span>⚠️</span>
            <p>{error}</p>
            <p className="status-hint">Check your Spotify credentials in <code>.env</code></p>
          </div>
        )}

        {/* Grid */}
        <div className="playlist-grid">
          {loading
            ? PLAYLIST_IDS.map((_, i) => <PlaylistSkeleton key={i} />)
            : playlists.map((pl, i) => (
                <PlaylistCard
                  key={pl.id}
                  playlist={pl}
                  accent={ACCENT_COLORS[i] ?? '#ffffff'}
                  index={i}
                />
              ))
          }
        </div>

      </div>
    </div>
  )
}

export default Playlist