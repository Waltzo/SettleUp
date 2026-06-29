import { useEffect, useState } from 'react'
import { shareBlob, downloadBlob } from '../lib/receipt.js'

export default function ReceiptModal({ blob, onClose }) {
  const [url, setUrl] = useState('')
  const canShare = typeof navigator !== 'undefined' && !!navigator.canShare

  useEffect(() => {
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <strong>영수증 미리보기</strong>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {url && <img src={url} alt="정산 영수증 미리보기" className="receipt-img" />}
        </div>
        <div className="modal-actions">
          {canShare && (
            <button className="primary" onClick={() => shareBlob(blob)}>
              공유하기
            </button>
          )}
          <button className="brand-outline" onClick={() => downloadBlob(blob)}>
            {canShare ? '다운로드' : '이미지 다운로드'}
          </button>
          <button className="ghost" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}
