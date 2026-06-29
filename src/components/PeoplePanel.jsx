import { useState } from 'react'

export default function PeoplePanel({ people, onAdd, onRemove }) {
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onAdd(name)
    setName('')
  }

  return (
    <section className="card">
      <h2>1. 참여 인원</h2>
      <form className="row" onSubmit={submit}>
        <input
          type="text"
          placeholder="이름 입력"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">추가</button>
      </form>
      {people.length === 0 ? (
        <p className="muted">아직 인원이 없어요. 이름을 추가하세요.</p>
      ) : (
        <ul className="chips">
          {people.map((p) => (
            <li key={p} className="chip">
              {p}
              <button
                className="chip-x"
                title="삭제"
                onClick={() => onRemove(p)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
