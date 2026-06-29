const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`

export default function ActivityList({ activities, editingId, onEdit, onRemove }) {
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
          const isCustom = a.splitMode === 'custom' && a.shares
          const per = Math.round(Number(a.amount) / a.participants.length)
          return (
            <li
              key={a.id}
              className={`activity${editingId === a.id ? ' editing' : ''}`}
            >
              <div className="activity-body">
                <div className="activity-main">
                  <strong>{a.name}</strong>
                  <span className="amount">{won(a.amount)}</span>
                </div>
                <div className="activity-meta">
                  <span><b>{a.payer}</b> 결제</span>
                  <span>·</span>
                  <span className="badge">{isCustom ? '쓴만큼' : 'N빵'}</span>
                  <span>·</span>
                  {isCustom ? (
                    <span>
                      {Object.entries(a.shares)
                        .map(([n, v]) => `${n} ${won(v)}`)
                        .join(', ')}
                    </span>
                  ) : (
                    <span>{a.participants.join(', ')} ({a.participants.length}명) · 1인 {won(per)}</span>
                  )}
                </div>
              </div>
              <div className="activity-actions">
                <button className="edit" onClick={() => onEdit(a.id)}>수정</button>
                <button className="del" onClick={() => onRemove(a.id)}>삭제</button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
