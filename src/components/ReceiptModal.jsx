import { useEffect, useMemo, useState } from 'react'
import { shareBlob, downloadBlob } from '../lib/receipt.js'

export default function ReceiptModal({ blob, groupName, onClose }) {
  const [url, setUrl] = useState('')

  // Can this browser share the image file directly (mobile / Web Share API)?
  const shareSupported = useMemo(() => {
    try {
      const file = new File([blob], 'placeholder.png', { type: 'image/png' })
      return !!navigator.canShare && navigator.canShare({ files: [file] })
    } catch {
      return false
    }
  }, [blob])

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
          <button className="brand-outline" onClick={() => downloadBlob(blob, groupName)}>
            다운로드
          </button>
          <button
            className="primary"
            onClick={() => shareBlob(blob, groupName)}
            disabled={!shareSupported}
            title={shareSupported ? '' : '이 브라우저는 이미지 공유를 지원하지 않습니다'}
          >
            공유
          </button>
          <button className="ghost" onClick={onClose}>닫기</button>
        </div>
        {!shareSupported && (
          <p className="muted small share-hint">
            이미지 공유는 모바일 브라우저에서 지원됩니다.
            <br />
            PC에서는 다운로드 후 업로드하세요.
          </p>
        )}
      </div>
    </div>
  )
}
