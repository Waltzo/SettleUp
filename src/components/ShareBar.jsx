import { useState } from 'react'

export default function ShareBar({ onReset }) {
  const [copied, setCopied] = useState(false)

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

  return (
    <section className="card share">
      <h2>5. 공유</h2>
      <p className="muted">
        링크를 복사해 친구들에게 보내면 같은 정산 내역을 볼 수 있어요.
      </p>
      <div className="row">
        <button className="primary" onClick={copy}>
          {copied ? '복사됨 ✓' : '공유 링크 복사'}
        </button>
        <button className="ghost" onClick={onReset}>
          전체 초기화
        </button>
      </div>
    </section>
  )
}
