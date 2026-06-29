// Render the settlement as a receipt-style PNG using a canvas — no deps.

const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`

const COL = {
  paper: '#ffffff',
  ink: '#1f2430',
  muted: '#8a93a3',
  brand: '#4f6bed',
  plus: '#1a9c63',
  minus: '#d6453d',
  line: '#e4e7ec',
}

/**
 * Draw a receipt and return a Promise<Blob> (PNG).
 * @param {{people:string[], activities:any[], balances:Record<string,number>, transfers:any[]}} data
 */
export function renderReceipt({ activities, balances, transfers }) {
  const scale = 2 // crisp on hi-dpi
  const W = 380
  const pad = 24
  const lh = 22 // base line height

  // First pass: measure total height by walking the same layout.
  const names = Object.keys(balances).filter((n) => balances[n] !== 0)
  let h = pad
  h += 34 // title
  h += 18 // subtitle
  h += 16 // gap
  h += 24 // section: 활동
  h += activities.length * (lh + 18) || lh
  h += 16
  h += 24 // section: 잔액
  h += (names.length || 1) * lh
  h += 16
  h += 24 // section: 송금
  h += (transfers.length || 1) * lh
  h += pad + 8

  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = h * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  // Background
  ctx.fillStyle = COL.paper
  ctx.fillRect(0, 0, W, h)

  const font = (size, weight = 400) =>
    `${weight} ${size}px -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`

  let y = pad

  // Title
  ctx.fillStyle = COL.ink
  ctx.font = font(22, 700)
  ctx.textBaseline = 'top'
  ctx.fillText('💸 더치페이 정산', pad, y)
  y += 34

  ctx.fillStyle = COL.muted
  ctx.font = font(12)
  ctx.fillText('SettleUp 정산 영수증', pad, y)
  y += 18 + 16

  const dashed = (yy) => {
    ctx.strokeStyle = COL.line
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(pad, yy)
    ctx.lineTo(W - pad, yy)
    ctx.stroke()
    ctx.setLineDash([])
  }

  const sectionTitle = (t) => {
    ctx.fillStyle = COL.brand
    ctx.font = font(13, 700)
    ctx.fillText(t, pad, y)
    y += 24
  }

  const rightText = (t, color) => {
    ctx.fillStyle = color
    ctx.textAlign = 'right'
    ctx.fillText(t, W - pad, y)
    ctx.textAlign = 'left'
  }

  // Activities
  sectionTitle('활동 내역')
  ctx.font = font(13)
  if (activities.length === 0) {
    ctx.fillStyle = COL.muted
    ctx.fillText('활동 없음', pad, y)
    y += lh
  } else {
    for (const a of activities) {
      ctx.fillStyle = COL.ink
      ctx.font = font(14, 600)
      ctx.fillText(a.name, pad, y)
      rightText(won(a.amount), COL.ink)
      y += lh
      ctx.fillStyle = COL.muted
      ctx.font = font(11.5)
      const meta = `${a.payer} 결제 · ${a.participants.join(', ')} (${a.participants.length}명)`
      ctx.fillText(meta, pad, y)
      y += 18
    }
  }
  y += 16
  dashed(y - 8)

  // Balances
  sectionTitle('개인별 잔액')
  ctx.font = font(13)
  if (names.length === 0) {
    ctx.fillStyle = COL.muted
    ctx.fillText('정산할 금액 없음', pad, y)
    y += lh
  } else {
    for (const n of names) {
      const b = balances[n]
      ctx.fillStyle = COL.ink
      ctx.fillText(n, pad, y)
      const label = b > 0 ? '받을 돈' : '낼 돈'
      rightText(`${won(Math.abs(b))} ${label}`, b > 0 ? COL.plus : COL.minus)
      y += lh
    }
  }
  y += 16
  dashed(y - 8)

  // Transfers
  sectionTitle('송금 내역 (최소 횟수)')
  ctx.font = font(14, 600)
  if (transfers.length === 0) {
    ctx.fillStyle = COL.muted
    ctx.font = font(13)
    ctx.fillText('송금할 내역 없음', pad, y)
    y += lh
  } else {
    for (const t of transfers) {
      ctx.fillStyle = COL.ink
      ctx.fillText(`${t.from} → ${t.to}`, pad, y)
      rightText(won(t.amount), COL.brand)
      y += lh
    }
  }

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
}

/**
 * Share the receipt via Web Share API (with file) when supported,
 * else trigger a PNG download. Returns 'shared' | 'downloaded'.
 */
export async function shareReceipt(data) {
  const blob = await renderReceipt(data)
  const file = new File([blob], 'settleup-receipt.png', { type: 'image/png' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '더치페이 정산 영수증' })
      return 'shared'
    } catch {
      // user cancelled or share failed — fall through to download
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'settleup-receipt.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return 'downloaded'
}
