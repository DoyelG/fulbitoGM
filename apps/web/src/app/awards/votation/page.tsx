import React, { useState } from 'react'
import { Welcome } from './Welcome'
import { CategoryStep } from './CategoryStep'
import { BallotSummary } from './BallotSummary'
import { FinalMedal } from './FinalMedal'
import { ProgressBar } from './ProgressBar'
import { mockEdition2026, mockNominees } from './mock-editions'
import { AwardBallot } from '@/constants/theme'

// Simula importación de edición desde Firestore
const currentEdition = mockEdition2026
const nominees = mockNominees

export default function AwardsVotationPage() {
  const [step, setStep] = useState<'welcome' | 'vote' | 'review' | 'done'>('welcome')
  const [categoryIdx, setCategoryIdx] = useState(0)
  const [ballot, setBallot] = useState<AwardBallot>({
    edition: currentEdition.year,
    votes: Object.fromEntries(currentEdition.categories.map(c => [c.key, null])),
  })
  // Para demo: usuario
  const userName = 'Martín'

  if (step === 'welcome') {
    return (
      <Welcome onStart={() => { setStep('vote') }} />
    )
  }

  if (step === 'vote') {
    const category = currentEdition.categories[categoryIdx]
    return (
      <>
        <ProgressBar current={categoryIdx + 1} total={currentEdition.categories.length} />
        <CategoryStep
          category={category}
          nominees={nominees}
          selected={ballot.votes[category.key] ?? null}
          onSelect={id => setBallot(b => ({ ...b, votes: { ...b.votes, [category.key]: id } }))}
          onNext={() => {
            if (categoryIdx < currentEdition.categories.length - 1) {
              setCategoryIdx(i => i + 1)
            } else {
              setStep('review')
            }
          }}
          progress={categoryIdx + 1}
          total={currentEdition.categories.length}
        />
      </>
    )
  }

  if (step === 'review') {
    return (
      <BallotSummary
        categories={currentEdition.categories}
        ballot={ballot}
        nominees={nominees}
        onEdit={categoryKey => {
          const idx = currentEdition.categories.findIndex(c => c.key === categoryKey)
          if (idx !== -1) {
            setCategoryIdx(idx)
            setStep('vote')
          }
        }}
        onSubmit={() => setStep('done')}
      />
    )
  }

  if (step === 'done') {
    return (
      <FinalMedal userName={userName} />
    )
  }

  return null
}
