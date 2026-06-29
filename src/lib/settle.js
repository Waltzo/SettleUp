// Settlement calculation — pure functions, unit-testable.

// Round to whole currency unit to avoid floating-point noise.
const round = (n) => Math.round(n)

/**
 * Compute net balance per person across all activities.
 * Each activity splits its amount equally among its participants;
 * each participant owes amount/N to the payer.
 *
 * @returns {Record<string, number>} name -> net balance (paid - owed).
 *   Positive = should receive money. Negative = should pay.
 */
export function computeBalances(state) {
  const balances = {}
  for (const name of state.people) balances[name] = 0

  for (const act of state.activities) {
    const participants = act.participants.filter((p) => state.people.includes(p))
    const amount = Number(act.amount)
    if (!participants.length || !amount || !state.people.includes(act.payer)) continue

    const share = amount / participants.length
    // Payer fronted the full amount.
    balances[act.payer] += amount
    // Each participant owes their share.
    for (const p of participants) balances[p] -= share
  }

  for (const name of Object.keys(balances)) balances[name] = round(balances[name])
  return balances
}

/**
 * Greedy minimal-transfer settlement.
 * Repeatedly match the largest debtor with the largest creditor.
 *
 * @param {Record<string, number>} balances
 * @returns {{from: string, to: string, amount: number}[]}
 */
export function minimizeTransfers(balances) {
  const creditors = [] // { name, amount > 0 }
  const debtors = []   // { name, amount > 0 } (absolute owed)

  for (const [name, bal] of Object.entries(balances)) {
    if (bal > 0) creditors.push({ name, amount: bal })
    else if (bal < 0) debtors.push({ name, amount: -bal })
  }

  // Largest first so big debts clear in fewest hops.
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const transfers = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i]
    const c = creditors[j]
    const pay = Math.min(d.amount, c.amount)
    if (pay > 0) {
      transfers.push({ from: d.name, to: c.name, amount: round(pay) })
    }
    d.amount -= pay
    c.amount -= pay
    if (d.amount <= 0.5) i++
    if (c.amount <= 0.5) j++
  }

  return transfers.filter((t) => t.amount > 0)
}
