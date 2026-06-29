const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`

export default function ActivityList({ activities, hasPeople, onAdd, onEdit, onRemove }) {
  return (
    <section className="card">
      <h2>결제 목록</h2>

      {activities.length === 0 ? (
        <p className="muted">아직 등록된 활동이 없어요.</p>
      ) : (
        <ul className="activity-list">
          {activities.map((a) => {
            const isCustom = a.splitMode === 'custom' && a.shares
            const per = Math.round(Number(a.amount) / a.participants.length)
            return (
              <li key={a.id} className="activity">
                <div className="activity-body">
                  <div className="activity-main">
                    <strong>{a.name}</strong>
                    <span className="amount">{won(a.amount)}</span>
                    <span className={`badge${isCustom ? ' custom' : ''}`}>{isCustom ? '각자' : 'N빵'}</span>
                  </div>
                  <div className="activity-meta">
                    <div><b>{a.payer}</b> 결제</div>
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
      )}

      {hasPeople ? (
        <button className="primary add-activity" onClick={onAdd}>
          + 활동 추가
        </button>
      ) : (
        <p className="muted small">먼저 참여 인원을 추가하세요.</p>
      )}
    </section>
  )
}
