import { useEffect, useMemo, useState } from 'react'
import PeoplePanel from './components/PeoplePanel.jsx'
import ActivityForm from './components/ActivityForm.jsx'
import ActivityList from './components/ActivityList.jsx'
import SettlementResult from './components/SettlementResult.jsx'
import ShareBar from './components/ShareBar.jsx'
import { computeBalances, minimizeTransfers } from './lib/settle.js'
import { decodeState, writeHash } from './lib/urlState.js'

let _id = 0
const newId = () => `a${Date.now()}_${_id++}`

export default function App() {
  const [state, setState] = useState(() => decodeState())
  const [editingId, setEditingId] = useState(null)

  // Keep the URL hash in sync so the link always reflects current data.
  useEffect(() => {
    writeHash(state)
  }, [state])

  const balances = useMemo(() => computeBalances(state), [state])
  const transfers = useMemo(() => minimizeTransfers(balances), [balances])

  const addPerson = (name) => {
    const n = name.trim()
    if (!n || state.people.includes(n)) return
    setState((s) => ({ ...s, people: [...s.people, n] }))
  }

  const removePerson = (name) => {
    setState((s) => ({
      people: s.people.filter((p) => p !== name),
      // Drop the person from activities; clear payer if it was them.
      activities: s.activities.map((a) => ({
        ...a,
        payer: a.payer === name ? '' : a.payer,
        participants: a.participants.filter((p) => p !== name),
      })),
    }))
  }

  const addActivity = (act) => {
    setState((s) => ({ ...s, activities: [...s.activities, { ...act, id: newId() }] }))
  }

  const updateActivity = (id, act) => {
    setState((s) => ({
      ...s,
      activities: s.activities.map((a) => (a.id === id ? { ...act, id } : a)),
    }))
    setEditingId(null)
  }

  const removeActivity = (id) => {
    if (editingId === id) setEditingId(null)
    setState((s) => ({ ...s, activities: s.activities.filter((a) => a.id !== id) }))
  }

  const editing = state.activities.find((a) => a.id === editingId) || null

  const reset = () => {
    if (confirm('모든 데이터를 지울까요?')) setState({ people: [], activities: [] })
  }

  return (
    <div className="app">
      <header>
        <h1>💸 더치페이 정산</h1>
        <p className="sub">누가 누구에게 얼마를 보내면 되는지 계산해드려요.</p>
      </header>

      <PeoplePanel people={state.people} onAdd={addPerson} onRemove={removePerson} />

      <ActivityForm
        people={state.people}
        onAdd={addActivity}
        editing={editing}
        onUpdate={updateActivity}
        onCancelEdit={() => setEditingId(null)}
      />

      <ActivityList
        activities={state.activities}
        editingId={editingId}
        onEdit={setEditingId}
        onRemove={removeActivity}
      />

      <SettlementResult
        people={state.people}
        activities={state.activities}
        balances={balances}
        transfers={transfers}
      />

      <ShareBar
        onReset={reset}
        receiptData={{
          people: state.people,
          activities: state.activities,
          balances,
          transfers,
        }}
      />

      <footer>
        <span>데이터는 서버에 저장되지 않고 URL 링크에만 담깁니다.</span>
      </footer>
    </div>
  )
}
