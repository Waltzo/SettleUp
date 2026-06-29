import { useEffect, useState } from 'react'

const emptyForm = { name: '', payer: '', amount: '' }

export default function ActivityForm({ people, onAdd }) {
  const [form, setForm] = useState(emptyForm)
  const [participants, setParticipants] = useState([])
  const [error, setError] = useState('')

  // When everyone is removed, keep participant selection valid.
  useEffect(() => {
    setParticipants((sel) => sel.filter((p) => people.includes(p)))
  }, [people])

  const toggle = (name) => {
    setParticipants((sel) =>
      sel.includes(name) ? sel.filter((p) => p !== name) : [...sel, name],
    )
  }

  const selectAll = () => setParticipants(people)
  const clearAll = () => setParticipants([])

  const submit = (e) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.name.trim()) return setError('활동 이름을 입력하세요.')
    if (!form.payer) return setError('결제자를 선택하세요.')
    if (!(amount > 0)) return setError('금액은 0보다 커야 합니다.')
    if (participants.length === 0) return setError('참여자를 한 명 이상 선택하세요.')

    onAdd({
      name: form.name.trim(),
      payer: form.payer,
      amount,
      participants,
    })
    setForm(emptyForm)
    setParticipants([])
    setError('')
  }

  if (people.length === 0) {
    return (
      <section className="card">
        <h2>2. 활동 추가</h2>
        <p className="muted">먼저 참여 인원을 추가하세요.</p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>2. 활동 추가</h2>
      <form onSubmit={submit} className="form-grid">
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

        <label>
          금액 (원)
          <input
            type="number"
            min="0"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </label>

        <div className="participants">
          <div className="participants-head">
            <span>참여자</span>
            <span className="link-btns">
              <button type="button" onClick={selectAll}>전체</button>
              <button type="button" onClick={clearAll}>해제</button>
            </span>
          </div>
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
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary">활동 추가</button>
      </form>
    </section>
  )
}
