import { useState } from 'react'
import { renderReceipt } from '../lib/receipt.js'
import ReceiptModal from './ReceiptModal.jsx'

export default function ShareActions({ onReset, receiptData }) {
  const [busy, setBusy] = useState(false)
  const [blob, setBlob] = useState(null)

  const hasResult = receiptData.transfers.length > 0
  const openReceipt = async () => {
    setBusy(true)
    try {
      const b = await renderReceipt(receiptData)
      setBlob(b)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="share-actions">
      <button className="primary" onClick={openReceipt} disabled={!hasResult || busy}>
        {busy ? '생성 중…' : '🧾 공유하기'}
      </button>
      <button className="ghost" onClick={onReset}>
        초기화
      </button>

      {blob && <ReceiptModal blob={blob} groupName={receiptData.groupName} onClose={() => setBlob(null)} />}
    </div>
  )
}
