import { useState } from 'react'
import { shareReceipt } from '../lib/receipt.js'

export default function ShareBar({ onReset, receiptData }) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // Fallback for browsers blocking clipboard API.
      const ta = document.createElement('textarea')
      ta.value = window.location.href
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const hasResult = receiptData.transfers.length > 0
  const shareImage = async () => {
    setBusy(true)
    try {
      await shareReceipt(receiptData)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card share">
      <h2>5. 공유</h2>
      <p className="muted">
        링크를 복사해 보내거나, 영수증 이미지로 정산 결과를 공유하세요.
      </p>
      <div className="row wrap">
        <button className="primary" onClick={copy}>
          {copied ? '복사됨 ✓' : '공유 링크 복사'}
        </button>
        <button className="brand-outline" onClick={shareImage} disabled={!hasResult || busy}>
          {busy ? '생성 중…' : '🧾 영수증 이미지 공유'}
        </button>
        <button className="ghost" onClick={onReset}>
          전체 초기화
        </button>
      </div>
      {!hasResult && (
        <p className="muted small">활동을 추가하면 영수증을 만들 수 있어요.</p>
      )}
    </section>
  )
}
