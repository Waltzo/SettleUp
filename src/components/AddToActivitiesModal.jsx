import { useEffect, useState } from 'react'

const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`

export default function AddToActivitiesModal({ personName, activities, onConfirm, onClose }) {
  const [selected, setSelected] = useState([])

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggle = (id) =>
    setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]))

  const allIds = activities.map((a) => a.id)
  const allOn = selected.length === activities.length
  const toggleAll = () => setSelected(allOn ? [] : allIds)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <strong>{personName}님 참여 활동 선택</strong>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="participants-head">
            <span className="muted small">참여한 활동을 선택하세요</span>
            <span className="link-btns">
              <button type="button" onClick={toggleAll}>
                {allOn ? '전체 해제' : '전체 선택'}
              </button>
            </span>
          </div>
          <ul className="pick-list">
            {activities.map((a) => (
              <li key={a.id}>
                <label className="pick-row">
                  <input
                    type="checkbox"
                    checked={selected.includes(a.id)}
                    onChange={() => toggle(a.id)}
                  />
                  <span className="pick-name">{a.name}</span>
                  <span className="pick-amount">{won(a.amount)}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="muted small">
            각자(쓴만큼) 활동은 사용액 0원으로 추가됩니다. 나중에 수정하세요.
          </p>
        </div>
        <div className="modal-actions">
          <button className="ghost" onClick={onClose}>건너뛰기</button>
          <button className="primary" onClick={() => onConfirm(selected)}>
            추가 ({selected.length})
          </button>
        </div>
      </div>
    </div>
  )
}
