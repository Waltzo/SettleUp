const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`

export default function SettlementResult({ balances, transfers }) {
  const names = Object.keys(balances)
  const hasData = names.length > 0 && names.some((n) => balances[n] !== 0)

  return (
    <section className="card result">
      <h2>정산 결과</h2>

      {!hasData ? (
        <p className="muted">활동을 추가하면 정산 결과가 나타납니다.</p>
      ) : (
        <>
          <h3>개인별 정산 금액</h3>
          <ul className="balance-list">
            {names.map((n) => {
              const b = balances[n]
              const cls = b > 0 ? 'plus' : b < 0 ? 'minus' : 'zero'
              const label = b > 0 ? '받을 돈' : b < 0 ? '낼 돈' : '정산 완료'
              return (
                <li key={n} className={`balance ${cls}`}>
                  <span>{n}</span>
                  <span>
                    {b !== 0 ? won(Math.abs(b)) : '-'} <em>{label}</em>
                  </span>
                </li>
              )
            })}
          </ul>

          <h3>송금 내역 (최소 횟수)</h3>
          {transfers.length === 0 ? (
            <p className="muted">송금할 내역이 없습니다.</p>
          ) : (
            <ul className="transfer-list">
              {transfers.map((t, i) => (
                <li key={i} className="transfer">
                  <span className="from">{t.from}</span>
                  <span className="arrow">→</span>
                  <span className="to">{t.to}</span>
                  <span className="t-amount">{won(t.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
