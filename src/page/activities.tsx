import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchNowPlaying, type NowPlayingData } from '../utils/spotifyNowPlaying'
import './activities.css'

// ✅  ROBLOX IMAGES HERE
const ROBLOX_IMAGES = [
  { src: '/assets/robloximg/roblox1.jpg', caption: 'Roblox Showcase 1' },
  { src: '/assets/robloximg/roblox2.jpg', caption: 'Roblox Showcase 2' },
  { src: '/assets/robloximg/roblox3.jpg', caption: 'Roblox Showcase 3' },
]

// PHOTOGRAPHY IMAGES HERE
const PHOTO_IMAGES = [
  { src: '/assets/photography/photo1.jpg', caption: 'Photography 1' },
  { src: '/assets/photography/photo2.jpg', caption: 'Photography 2' },
  { src: '/assets/photography/photo3.jpg', caption: 'Photography 3' },
]

// ─── Lightbox ───
function Lightbox({ src, caption, onClose }: { src: string; caption: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        <img src={src} alt={caption} className="lightbox-img" />
        <p className="lightbox-caption">{caption}</p>
      </div>
    </div>
  )
}

// ─── Gallery Grid ───
function GalleryGrid({ images, onSelect }: {
  images: { src: string; caption: string }[]
  onSelect: (img: { src: string; caption: string }) => void
}) {
  return (
    <div className="gallery-grid">
      {images.map((img, i) => (
        <div
          key={i}
          className="gallery-item"
          style={{ animationDelay: `${i * 0.08}s` }}
          onClick={() => onSelect(img)}
        >
          <img src={img.src} alt={img.caption} />
          <div className="gallery-overlay">
            <span className="gallery-zoom">🔍</span>
            <p className="gallery-caption">{img.caption}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Progress Bar ───
function ProgressBar({ progressMs, durationMs, accent }: {
  progressMs: number
  durationMs: number
  accent: string
}) {
  const pct = durationMs > 0 ? (progressMs / durationMs) * 100 : 0

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  return (
    <div className="progress-wrapper">
      <span className="progress-time">{fmt(progressMs)}</span>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: accent }}
        />
        <div
          className="progress-dot"
          style={{ left: `${pct}%`, background: accent }}
        />
      </div>
      <span className="progress-time">{fmt(durationMs)}</span>
    </div>
  )
}

// ─── Now Playing Card ───
function NowPlayingCard() {
  const [track, setTrack] = useState<NowPlayingData | null>(null)
  const [progressMs, setProgressMs] = useState(0)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    const data = await fetchNowPlaying()
    setTrack(data)
    setProgressMs(data?.progressMs ?? 0)
    setLoading(false)

    // Tick progress every second
    if (tickRef.current) clearInterval(tickRef.current)
    if (data?.isPlaying) {
      tickRef.current = setInterval(() => {
        setProgressMs(prev => Math.min(prev + 1000, data.durationMs))
      }, 1000)
    }
  }, [])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 15000) // refresh every 15s
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [load])

  const accent = track?.accentColor ?? '#3b82f6'

  if (loading) {
    return (
      <div className="np-card np-skeleton">
        <div className="np-skeleton-art" />
        <div className="np-skeleton-info">
          <div className="np-skeleton-line wide" />
          <div className="np-skeleton-line medium" />
          <div className="np-skeleton-line narrow" />
        </div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="np-card np-offline" style={{ ['--accent']: accent } as React.CSSProperties}>
        <div className="np-offline-icon">🎵</div>
        <p className="np-offline-text">Not playing anything right now.</p>
        <p className="np-offline-sub">Check back later!</p>
      </div>
    )
  }

  return (
    <div
      className="np-card"
      style={{ ['--accent']: accent } as React.CSSProperties}
    >
      {/* Blurred album art background */}
      <div
        className="np-bg"
        style={{ backgroundImage: `url(${track.albumArt})` }}
      />
      <div className="np-bg-overlay" />

      {/* Animated wave bars */}
      <div className="np-waves" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="np-wave-bar"
            style={{
              animationDelay: `${(i * 0.08) % 1.2}s`,
              animationDuration: `${0.8 + (i % 5) * 0.15}s`,
              background: accent,
            }}
          />
        ))}
      </div>

      {/* Card content */}
      <div className="np-content">
        {/* Album art */}
        <div className="np-art-wrapper">
          <img src={track.albumArt} alt={track.album} className="np-art" />
          <div className="np-art-glow" style={{ background: accent }} />
        </div>

        {/* Info */}
        <div className="np-info">
          <div className="np-badge">
            <span className="np-dot" style={{ background: accent }} />
            {track.isPlaying ? 'Now Playing' : 'Paused'}
          </div>
          <h2 className="np-title">{track.title}</h2>
          <p className="np-artist">{track.artist}</p>
          <p className="np-album">{track.album}</p>
          <ProgressBar
            progressMs={progressMs}
            durationMs={track.durationMs}
            accent={accent}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───
function Activities() {
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null)

  return (
    <div className="activities-page">

      {/* Background */}
      <div className="act-bg" />
      <div className="act-bg-overlay" />

      <div className="act-content">

        {/* ── Section 1: Roblox Works ── */}
        <section className="act-section">
          <div className="act-section-header">
            <span className="act-section-tag">Section 01</span>
            <h2 className="act-section-title">Roblox Works</h2>
            <p className="act-section-sub">Games, showcases, and builds.</p>
          </div>
          <GalleryGrid images={ROBLOX_IMAGES} onSelect={setLightbox} />
        </section>

        {/* ── Section 2: Photography ── */}
        <section className="act-section">
          <div className="act-section-header">
            <span className="act-section-tag">Section 02</span>
            <h2 className="act-section-title">Photography</h2>
            <p className="act-section-sub">Moments I captured through a lens.</p>
          </div>
          <GalleryGrid images={PHOTO_IMAGES} onSelect={setLightbox} />
        </section>

        {/* ── Section 3: Now Playing ── */}
        <section className="act-section">
          <div className="act-section-header">
            <span className="act-section-tag">Section 03</span>
            <h2 className="act-section-title">Now Playing</h2>
            <p className="act-section-sub">What's in my ears right now.</p>
          </div>
          <NowPlayingCard />
        </section>

      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          caption={lightbox.caption}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

export default Activities