import { useEffect, useState } from 'react'

const STEPS = [
  {
    emoji: '👋',
    title: 'SettleUp 시작하기',
    desc: '모임 비용을 누가 누구에게 얼마 보내면 되는지 자동으로 계산해드려요. 먼저 상단에 모임 이름을 적어보세요.',
  },
  {
    emoji: '👥',
    title: '인원 추가',
    desc: '정산에 참여하는 사람들의 이름을 추가하세요.',
  },
  {
    emoji: '🧾',
    title: '활동·금액 입력',
    desc: '활동마다 결제자·금액·참여자를 입력해요. 나눔 방식은 N빵(균등) 또는 각자(쓴 만큼) 중에 고를 수 있어요.',
  },
  {
    emoji: '💸',
    title: '자동 정산·공유',
    desc: '누가 누구에게 보낼지 송금 내역이 자동으로 계산돼요. 공유하기로 영수증 이미지를 저장하거나 보낼 수 있어요.',
  },
]

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0)

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isLast = step === STEPS.length - 1
  const cur = STEPS[step]
  const next = () => (isLast ? onClose() : setStep((s) => s + 1))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <strong>{cur.title}</strong>
          <span className="onboard-progress">
            {step + 1}/{STEPS.length}
          </span>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body onboard-body">
          <div className="onboard-emoji">{cur.emoji}</div>
          <p className="onboard-desc">{cur.desc}</p>
          <div className="onboard-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={i === step ? 'dot on' : 'dot'} />
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="ghost" onClick={onClose}>건너뛰기</button>
          <button className="primary" onClick={next}>
            {isLast ? '시작하기' : '다음 →'}
          </button>
        </div>
      </div>
    </div>
  )
}
