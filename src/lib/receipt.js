// Render the settlement as a receipt-style PNG using a canvas.
import QRCode from 'qrcode'

const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`

function makeReceiptFilename(groupName) {
  const safeGroupName = (groupName || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')

  return `settleup-${safeGroupName || 'receipt'}.png`
}

// QR size (px) drawn at the bottom of the receipt.
const QR = 132

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Build a QR data-URL for the app's home page (no state hash → shortest QR).
async function makeQR() {
  try {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}`
    return await QRCode.toDataURL(url, { margin: 1, width: QR * 2, errorCorrectionLevel: 'L' })
  } catch {
    return null
  }
}

const COL = {
  paper: '#ffffff',
  ink: '#1f2430',
  muted: '#8a93a3',
  brand: '#4f6bed',
  plus: '#1a9c63',
  minus: '#d6453d',
  line: '#e4e7ec',
}

const FONT = (size, weight = 400) =>
  `${weight} ${size}px -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`

// Word-wrap a string to a max pixel width, returns array of lines.
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

// Truncate to a max pixel width, appending '…' if cut.
function truncate(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1)
  return t + '…'
}

function activityMeta(a) {
  if (a.splitMode === 'custom' && a.shares) {
    const list = Object.entries(a.shares).map(([n, v]) => `${n} ${won(v)}`).join(', ')
    return `${a.payer} 결제 · 각자 · ${list}`
  }
  return `${a.payer} 결제 · N빵 · ${a.participants.join(', ')} (${a.participants.length}명)`
}

/**
 * Draw a receipt and return a Promise<Blob> (PNG).
 * @param {{groupName?:string, people:string[], activities:any[], balances:Record<string,number>, transfers:any[]}} data
 */
export async function renderReceipt({ groupName, people = [], activities = [], balances = {}, transfers = [] }) {
  const scale = 2
  const W = 380
  const pad = 24
  const lh = 22
  const contentW = W - pad * 2

  const names = Object.keys(balances).filter((n) => balances[n] !== 0)

  // QR for the share link (drawn at the very bottom).
  const qrUrl = await makeQR()
  const qrImg = qrUrl ? await loadImage(qrUrl) : null

  // Measuring context to pre-compute wrapped line counts.
  const meas = document.createElement('canvas').getContext('2d')
  meas.font = FONT(12.5)
  const peopleLines = wrapText(meas, people.join(', ') || '없음', contentW)
  meas.font = FONT(11.5)
  const actMetaLines = activities.map((a) => wrapText(meas, activityMeta(a), contentW))

  // Height pass.
  let h = pad
  h += 30 // title
  h += 18 // subtitle
  h += 16
  h += 24 // 참여 인원 title
  h += peopleLines.length * 18
  h += 16
  h += 24 // 활동 title
  if (activities.length === 0) h += lh
  else activities.forEach((_, i) => { h += lh + actMetaLines[i].length * 16 + 4 })
  h += 16
  h += 24 // 잔액 title
  h += (names.length || 1) * lh
  h += 16
  h += 24 // 송금 title
  h += (transfers.length || 1) * lh
  if (qrImg) {
    h += 16 // divider gap
    h += QR // qr image
    h += 18 // caption
  }
  h += pad + 8

  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = h * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.textBaseline = 'top'

  ctx.fillStyle = COL.paper
  ctx.fillRect(0, 0, W, h)

  let y = pad

  // Title = group name (fallback to default).
  ctx.fillStyle = COL.ink
  ctx.textAlign = 'center'
  ctx.fillStyle = COL.ink
  ctx.font = FONT(20, 700)
  ctx.fillText('SettleUp 정산 영수증', W / 2, y)
  y += 30

  ctx.fillStyle = COL.muted
  ctx.font = FONT(12)
  ctx.fillText(groupName?.trim() || '💸 더치페이 정산', W / 2, y)
  ctx.textAlign = 'left'
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
    ctx.font = FONT(13, 700)
    ctx.fillText(t, pad, y)
    y += 24
  }

  const rightText = (t, color) => {
    ctx.fillStyle = color
    ctx.textAlign = 'right'
    ctx.fillText(t, W - pad, y)
    ctx.textAlign = 'left'
  }

  // Participants
  sectionTitle(`참여 인원 (${people.length}명)`)
  ctx.fillStyle = COL.ink
  ctx.font = FONT(12.5)
  for (const ln of peopleLines) {
    ctx.fillText(ln, pad, y)
    y += 18
  }
  y += 16
  dashed(y - 8)

  // Activities
  sectionTitle('활동 내역')
  if (activities.length === 0) {
    ctx.fillStyle = COL.muted
    ctx.font = FONT(13)
    ctx.fillText('활동 없음', pad, y)
    y += lh
  } else {
    activities.forEach((a, i) => {
      ctx.fillStyle = COL.ink
      ctx.font = FONT(14, 600)
      // Reserve room for the right-aligned amount, ellipsize the name.
      const amtW = ctx.measureText(won(a.amount)).width
      const nameW = contentW - amtW - 12
      ctx.fillText(truncate(ctx, a.name, nameW), pad, y)
      rightText(won(a.amount), COL.ink)
      y += lh
      ctx.fillStyle = COL.muted
      ctx.font = FONT(11.5)
      for (const ln of actMetaLines[i]) {
        ctx.fillText(ln, pad, y)
        y += 16
      }
      y += 4
    })
  }
  y += 16
  dashed(y - 8)

  // Balances
  sectionTitle('개인별 정산 금액')
  ctx.font = FONT(13)
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
  sectionTitle('정산 방법')
  ctx.font = FONT(14, 600)
  if (transfers.length === 0) {
    ctx.fillStyle = COL.muted
    ctx.font = FONT(13)
    ctx.fillText('정산할 내역 없음', pad, y)
    y += lh
  } else {
    for (const t of transfers) {
      ctx.fillStyle = COL.ink
      ctx.fillText(`${t.from} → ${t.to}`, pad, y)
      rightText(won(t.amount), COL.brand)
      y += lh
    }
  }

  // QR code linking to the share URL.
  if (qrImg) {
    y += 16
    dashed(y - 8)
    const qx = (W - QR) / 2
    ctx.drawImage(qrImg, qx, y, QR, QR)
    y += QR + 2
    ctx.fillStyle = COL.muted
    ctx.font = FONT(11)
    ctx.textAlign = 'center'
    ctx.fillText('스캔하면 SettleUp으로 이동합니다', W / 2, y)
    ctx.textAlign = 'left'
  }

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
}

// Force a PNG download of the blob.
export function downloadBlob(blob, groupName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = makeReceiptFilename(groupName)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Share an already-rendered blob via Web Share API (with file) when
 * supported, else fall back to download. Returns 'shared' | 'cancelled' | 'downloaded'.
 */
export async function shareBlob(blob, groupName) {
  const file = new File([blob], makeReceiptFilename(groupName), { type: 'image/png' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '더치페이 정산 영수증' })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }

  downloadBlob(blob, groupName)
  return 'downloaded'
}
