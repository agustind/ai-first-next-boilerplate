import { ImageResponse } from 'next/og'

/** Default social card: /api/og?title=...&site=... (1200×630). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get('title') ?? '').slice(0, 120)
  const site = (searchParams.get('site') ?? '').slice(0, 60)

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: 'linear-gradient(135deg, #0f1020 0%, #2b2c6e 100%)',
        color: '#fff',
      }}
    >
      <div style={{ fontSize: 32, opacity: 0.7 }}>{site}</div>
      <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
        {title}
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
