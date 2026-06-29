import { useEffect, useState } from 'react'

const emptyForm = { name: '', payer: '', amount: '', splitMode: 'equal' }
const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`

export default function ActivityForm({ people, onAdd, editing, onUpdate, onClose }) {
  const [form, setForm] = useState(emptyForm)
  const [participants, setParticipants] = useState([])
  const [shares, setShares] = useState({}) // name -> string amount (custom mode)
  const [error, setError] = useState('')

  const isEditing = !!editing

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Populate the form when an activity is selected for editing.
  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        payer: editing.payer,
        amount: String(editing.amount),
        splitMode: editing.splitMode || 'equal',
      })
      setParticipants(editing.participants || [])
      const sh = {}
      if (editing.shares) for (const [k, v] of Object.entries(editing.shares)) sh[k] = String(v)
      setShares(sh)
      setError('')
    } else {
      setForm(emptyForm)
      setParticipants([])
      setShares({})
    }
  }, [editing])

  // Keep selection valid when people change.
  useEffect(() => {
    setParticipants((sel) => sel.filter((p) => people.includes(p)))
    setShares((sh) => {
      const next = {}
      for (const k of Object.keys(sh)) if (people.includes(k)) next[k] = sh[k]
      return next
    })
  }, [people])

  const isCustom = form.splitMode === 'custom'

  const toggle = (name) => {
    setParticipants((sel) =>
      sel.includes(name) ? sel.filter((p) => p !== name) : [...sel, name],
    )
    // Clear custom amount when unchecking.
    setShares((sh) => {
      if (!participants.includes(name)) return sh
      const next = { ...sh }
      delete next[name]
      return next
    })
  }

  const selectAll = () => setParticipants(people)
  const clearAll = () => {
    setParticipants([])
    setShares({})
  }

  const setShare = (name, val) => setShares((sh) => ({ ...sh, [name]: val }))

  // Running sum of custom amounts for the live validation hint.
  const customSum = participants.reduce((acc, p) => acc + (Number(shares[p]) || 0), 0)
  const total = Number(form.amount) || 0

  const submit = (e) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.name.trim()) return setError('활동 이름을 입력하세요.')
    if (!form.payer) return setError('결제자를 선택하세요.')
    if (!(amount > 0)) return setError('금액은 0보다 커야 합니다.')
    if (participants.length === 0) return setError('참여자를 한 명 이상 선택하세요.')

    const act = {
      name: form.name.trim(),
      payer: form.payer,
      amount,
      splitMode: form.splitMode,
      participants,
    }

    if (isCustom) {
      const sh = {}
      for (const p of participants) sh[p] = Number(shares[p]) || 0
      const sum = Object.values(sh).reduce((a, c) => a + c, 0)
      if (Math.round(sum) !== Math.round(amount)) {
        return setError(
          `참여자 사용액 합계(${won(sum)})가 총 금액(${won(amount)})과 일치해야 합니다.`,
        )
      }
      act.shares = sh
    }

    if (isEditing) onUpdate(editing.id, act)
    else onAdd(act)

    setForm(emptyForm)
    setParticipants([])
    setShares({})
    setError('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <strong>{isEditing ? '활동 수정' : '활동 추가'}</strong>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="modal-form-el">
          <div className="form-grid modal-body">
        <div className="pair">
          <label>
            활동 이름
            <input
              type="text"
              placeholder="예: 저녁식사"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label>
            결제자
            <select
              value={form.payer}
              onChange={(e) => setForm({ ...form, payer: e.target.value })}
            >
              <option value="">선택</option>
              {people.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="pair">
          <label className="grow">
            금액 (원)
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label className="split-select">
            분할 방식
            <select
              value={form.splitMode}
              onChange={(e) => setForm({ ...form, splitMode: e.target.value })}
            >
              <option value="equal">N빵</option>
              <option value="custom">쓴만큼</option>
            </select>
          </label>
        </div>

        <div className="participants">
          <div className="participants-head">
            <span>참여자{isCustom ? ' / 사용액' : ''}</span>
            <span className="link-btns">
              <button type="button" onClick={selectAll}>전체</button>
              <button type="button" onClick={clearAll}>해제</button>
            </span>
          </div>

          {isCustom ? (
            <div className="custom-list">
              {people.map((p) => {
                const on = participants.includes(p)
                return (
                  <div key={p} className={`custom-row${on ? ' on' : ''}`}>
                    <label className="chk">
                      <input type="checkbox" checked={on} onChange={() => toggle(p)} />
                      {p}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="사용액"
                      disabled={!on}
                      value={shares[p] ?? ''}
                      onChange={(e) => setShare(p, e.target.value)}
                    />
                  </div>
                )
              })}
              {participants.length > 0 && (
                <div className={`sum-hint${Math.round(customSum) === Math.round(total) && total > 0 ? ' ok' : ''}`}>
                  합계 {won(customSum)} / 총 {won(total)}
                </div>
              )}
            </div>
          ) : (
            <div className="chk-list">
              {people.map((p) => (
                <label key={p} className="chk">
                  <input
                    type="checkbox"
                    checked={participants.includes(p)}
                    onChange={() => toggle(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          )}
        </div>

            {error && <p className="error">{error}</p>}
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="primary">
              {isEditing ? '수정 완료' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
