const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`

export default function ActivityList({ activities, onRemove }) {
  if (activities.length === 0) {
    return (
      <section className="card">
        <h2>3. 활동 목록</h2>
        <p className="muted">아직 등록된 활동이 없어요.</p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>3. 활동 목록</h2>
      <ul className="activity-list">
        {activities.map((a) => {
          const per = Math.round(Number(a.amount) / a.participants.length)
          return (
            <li key={a.id} className="activity">
              <div className="activity-main">
                <strong>{a.name}</strong>
                <span className="amount">{won(a.amount)}</span>
              </div>
              <div className="activity-meta">
                <span><b>{a.payer}</b> 결제</span>
                <span>·</span>
                <span>{a.participants.join(', ')} ({a.participants.length}명)</span>
                <span>·</span>
                <span>1인 {won(per)}</span>
              </div>
              <button className="del" onClick={() => onRemove(a.id)}>삭제</button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
