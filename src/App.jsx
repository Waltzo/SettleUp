import { useEffect, useMemo, useState } from 'react'
import PeoplePanel from './components/PeoplePanel.jsx'
import ActivityForm from './components/ActivityForm.jsx'
import ActivityList from './components/ActivityList.jsx'
import SettlementResult from './components/SettlementResult.jsx'
import ShareActions from './components/ShareActions.jsx'
import AddToActivitiesModal from './components/AddToActivitiesModal.jsx'
import OnboardingModal from './components/OnboardingModal.jsx'
import { computeBalances, minimizeTransfers } from './lib/settle.js'
import { loadState, saveState, isOnboarded, markOnboarded } from './lib/storage.js'

let _id = 0
const newId = () => `a${Date.now()}_${_id++}`

export default function App() {
  const [state, setState] = useState(() => loadState())
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [pendingPerson, setPendingPerson] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboarded())

  const closeOnboarding = () => {
    markOnboarded()
    setShowOnboarding(false)
  }

  // Persist to localStorage so a reload restores the draft.
  useEffect(() => {
    saveState(state)
  }, [state])

  const balances = useMemo(() => computeBalances(state), [state])
  const transfers = useMemo(() => minimizeTransfers(balances), [balances])

  const addPerson = (name) => {
    const n = name.trim()
    if (!n || state.people.includes(n)) return
    setState((s) => ({ ...s, people: [...s.people, n] }))
    // If activities already exist, ask which ones this person joined.
    if (state.activities.length > 0) setPendingPerson(n)
  }

  // Add a (new) person to the selected existing activities as a participant.
  const addPersonToActivities = (name, ids) => {
    if (ids.length > 0) {
      setState((s) => ({
        ...s,
        activities: s.activities.map((a) => {
          if (!ids.includes(a.id) || a.participants.includes(name)) return a
          const next = { ...a, participants: [...a.participants, name] }
          // 각자(custom): seed used amount as 0 — user edits later.
          if (a.splitMode === 'custom' && a.shares) {
            next.shares = { ...a.shares, [name]: 0 }
          }
          return next
        }),
      }))
    }
    setPendingPerson(null)
  }

  const removePerson = (name) => {
    // Warn if this person is tied to any activity (payer/participant/share).
    const involved = state.activities.filter(
      (a) =>
        a.payer === name ||
        a.participants.includes(name) ||
        (a.shares && name in a.shares),
    )
    if (involved.length > 0) {
      const ok = confirm(
        `'${name}' 님은 ${involved.length}개 활동에 포함되어 있어요.\n` +
          `삭제하면 해당 활동의 결제자·참여자에서도 제거됩니다. 계속할까요?`,
      )
      if (!ok) return
    }

    setState((s) => ({
      ...s, // keep groupName and other fields intact
      people: s.people.filter((p) => p !== name),
      // Drop the person from activities; clear payer if it was them.
      activities: s.activities.map((a) => {
        const next = {
          ...a,
          payer: a.payer === name ? '' : a.payer,
          participants: a.participants.filter((p) => p !== name),
        }
        // 각자(custom): also drop their used-amount entry.
        if (a.shares && name in a.shares) {
          const { [name]: _drop, ...rest } = a.shares
          next.shares = rest
        }
        return next
      }),
    }))
  }

  const addActivity = (act) => {
    setState((s) => ({ ...s, activities: [...s.activities, { ...act, id: newId() }] }))
    closeForm()
  }

  const updateActivity = (id, act) => {
    setState((s) => ({
      ...s,
      activities: s.activities.map((a) => (a.id === id ? { ...act, id } : a)),
    }))
    closeForm()
  }

  const removeActivity = (id) => {
    setState((s) => ({ ...s, activities: s.activities.filter((a) => a.id !== id) }))
  }

  const openAdd = () => {
    setEditingId(null)
    setFormOpen(true)
  }
  const openEdit = (id) => {
    setEditingId(id)
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  const editing = state.activities.find((a) => a.id === editingId) || null

  const setGroupName = (name) => setState((s) => ({ ...s, groupName: name }))

  const reset = () => {
    if (confirm('모든 데이터를 지울까요?'))
      setState({ groupName: '', people: [], activities: [] })
  }

  return (
    <div className="app">
      <header>
        <h1>💸SettleUp 정산 영수증</h1>
        <p className="sub">누가 누구에게 얼마를 보내면 되는지 계산해드려요.</p>
        <div className="group-name-wrap">
          <input
            className="group-name"
            type="text"
            placeholder="모임 이름"
            maxLength={20}
            value={state.groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <span className="char-count">{state.groupName.length}/20</span>
        </div>
      </header>

      <div className="columns">
        <div className="col">
          <PeoplePanel people={state.people} onAdd={addPerson} onRemove={removePerson} />

          <ActivityList
            activities={state.activities}
            hasPeople={state.people.length > 0}
            onAdd={openAdd}
            onEdit={openEdit}
            onRemove={removeActivity}
          />
        </div>

        <div className="col">
          <SettlementResult
            people={state.people}
            activities={state.activities}
            balances={balances}
            transfers={transfers}
          />
        </div>
      </div>

      {formOpen && (
        <ActivityForm
          people={state.people}
          onAdd={addActivity}
          editing={editing}
          onUpdate={updateActivity}
          onClose={closeForm}
        />
      )}

      {pendingPerson && (
        <AddToActivitiesModal
          personName={pendingPerson}
          activities={state.activities}
          onConfirm={(ids) => addPersonToActivities(pendingPerson, ids)}
          onClose={() => setPendingPerson(null)}
        />
      )}

      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}

      <ShareActions
        onReset={reset}
        receiptData={{
          groupName: state.groupName,
          people: state.people,
          activities: state.activities,
          balances,
          transfers,
        }}
      />

      <footer>
        <div>데이터는 서버에 저장되지 않고 이 브라우저에만 보관됩니다.</div>
        <div>오류 및 건의사항 @waltz_owo</div>
      </footer>
    </div>
  )
}
