import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PartBlock, PartName } from '@/types'
import { getPartRerollCost, useGameStore } from '@/stores/useGameStore'
import { useMemberStore } from '@/stores/useMemberStore'
import { rollRandomAffinity } from '@/utils/partAffinity'
import { isChorusPart } from '@/utils/partKinds'
import { calcPartPointBreakdown, calcPartPointWithPenalty, calcSongPoint } from '@/utils/pointCalc'
import { rerollPartBonus } from '@/utils/partBonus'
import { loadTempSongPart, saveTempSongPart, type TempSongPartSnapshot } from '@/utils/tempSongPartStorage'

export interface AssignFeedback {
  partName: PartName
  point: number
  strongCount: number
  seq: number
}

export interface RerollFeedback {
  partName: PartName
  chorusGroup: boolean
  bonusChanges: { partName: PartName; delta: number }[]
  seq: number
}

const PART_DEFINITIONS: Pick<PartBlock, 'name' | 'label' | 'duration' | 'bonusMultiplier' | 'strongType' | 'neutralType' | 'weakType'>[] = [
  { name: 'intro',   label: '인트로',   duration: 20, bonusMultiplier: 1.05, strongType: 'R', neutralType: 'G', weakType: 'B' },
  { name: 'part1-1', label: '파트1-1',  duration: 22, bonusMultiplier: 0.97, strongType: 'G', neutralType: 'B', weakType: 'R' },
  { name: 'part1-2', label: '파트1-2',  duration: 22, bonusMultiplier: 1.02, strongType: 'B', neutralType: 'R', weakType: 'G' },
  { name: 'chorus1', label: '싸비',     duration: 30, bonusMultiplier: 1.08, strongType: 'R', neutralType: 'B', weakType: 'G' },
  { name: 'part2-1', label: '파트2-1',  duration: 22, bonusMultiplier: 0.94, strongType: 'G', neutralType: 'R', weakType: 'B' },
  { name: 'part2-2', label: '파트2-2',  duration: 22, bonusMultiplier: 1.00, strongType: 'B', neutralType: 'G', weakType: 'R' },
  { name: 'chorus2', label: '싸비',     duration: 30, bonusMultiplier: 1.06, strongType: 'R', neutralType: 'B', weakType: 'G' },
  { name: 'bridge',  label: '브릿지',   duration: 18, bonusMultiplier: 1.10, strongType: 'G', neutralType: 'R', weakType: 'B' },
  { name: 'chorus3', label: '싸비',     duration: 30, bonusMultiplier: 0.98, strongType: 'R', neutralType: 'B', weakType: 'G' },
]

function createDefaultParts(): PartBlock[] {
  return PART_DEFINITIONS.map((def) => ({ ...def, assignedMemberId: null }))
}

function applySnapshot(
  snapshot: TempSongPartSnapshot,
  validMemberIds: Set<string>,
): { parts: PartBlock[]; songTitle: string; isConfirmed: boolean } {
  const savedByName = new Map(snapshot.parts.map((part) => [part.name, part]))
  const parts = createDefaultParts().map((def) => {
    const saved = savedByName.get(def.name)
    if (!saved) return def

    const assignedMemberId =
      saved.assignedMemberId && validMemberIds.has(saved.assignedMemberId)
        ? saved.assignedMemberId
        : null

    return {
      ...def,
      assignedMemberId,
      bonusMultiplier: saved.bonusMultiplier ?? def.bonusMultiplier,
      strongType: saved.strongType ?? def.strongType,
      neutralType: saved.neutralType ?? def.neutralType,
      weakType: saved.weakType ?? def.weakType,
    }
  })

  const isComplete = parts.every((part) => part.assignedMemberId !== null)
  const isConfirmed = snapshot.isConfirmed === true && isComplete

  return {
    parts,
    songTitle: snapshot.songTitle ?? 'Fly(가제)',
    isConfirmed,
  }
}

function buildInitialState(validMemberIds: Set<string>) {
  const snapshot = loadTempSongPart()
  if (!snapshot) {
    return {
      parts: createDefaultParts(),
      songTitle: 'Fly(가제)',
      isConfirmed: false,
    }
  }
  return applySnapshot(snapshot, validMemberIds)
}

export const useSongStore = defineStore('song', () => {
  const memberStore = useMemberStore()
  const gameStore = useGameStore()

  const validMemberIds = new Set(memberStore.members.map((member) => member.id))
  const initialState = buildInitialState(validMemberIds)

  const parts = ref<PartBlock[]>(initialState.parts)

  const songTitle = ref(initialState.songTitle)
  const isConfirmed = ref(initialState.isConfirmed)

  function createSnapshot(): TempSongPartSnapshot {
    return {
      parts: parts.value.map((part) => ({
        name: part.name,
        assignedMemberId: part.assignedMemberId,
        bonusMultiplier: part.bonusMultiplier,
        strongType: part.strongType,
        neutralType: part.neutralType,
        weakType: part.weakType,
      })),
      songTitle: songTitle.value,
      isConfirmed: isConfirmed.value,
    }
  }

  function persistParts() {
    saveTempSongPart(createSnapshot())
  }

  let feedbackSeq = 0
  let rerollSeq = 0
  const assignFeedback = ref<AssignFeedback | null>(null)
  const rerollFeedback = ref<RerollFeedback | null>(null)

  const totalPoint = computed(() => {
    const memberMap = new Map(memberStore.members.map((m) => [m.id, m]))
    return calcSongPoint(memberMap, parts.value)
  })

  const isComplete = computed(() => parts.value.every((p) => p.assignedMemberId !== null))

  function assignMember(partName: PartName, memberId: string) {
    const part = parts.value.find((p) => p.name === partName)
    if (!part) return

    part.assignedMemberId = memberId
    isConfirmed.value = false

    const member = memberStore.getMemberById(memberId)
    if (!member) {
      persistParts()
      return
    }

    const breakdown = calcPartPointBreakdown(member, part)
    const strongCount = breakdown.filter((row) => row.tier === 'strong').length

    assignFeedback.value = {
      partName,
      point: calcPartPointWithPenalty(member, part, parts.value),
      strongCount,
      seq: ++feedbackSeq,
    }

    if (strongCount >= 2 && typeof navigator.vibrate === 'function') {
      navigator.vibrate(12)
    }

    persistParts()
  }

  function unassignMember(partName: PartName) {
    const part = parts.value.find((p) => p.name === partName)
    if (part) part.assignedMemberId = null
    isConfirmed.value = false
    persistParts()
  }

  function confirmSong() {
    if (!isComplete.value || isConfirmed.value) return
    isConfirmed.value = true
    persistParts()
  }

  function rerollPartAffinity(partName: PartName): boolean {
    const part = parts.value.find((p) => p.name === partName)
    if (!part) return false

    const cost = getPartRerollCost(partName)
    if (!gameStore.spendCoins(cost)) return false

    const rolled = rollRandomAffinity()
    const chorusGroup = isChorusPart(partName)
    const targets = chorusGroup
      ? parts.value.filter((p) => isChorusPart(p.name))
      : [part]

    const bonusChanges: { partName: PartName; delta: number }[] = []

    for (const target of targets) {
      target.strongType = rolled.strongType
      target.neutralType = rolled.neutralType
      target.weakType = rolled.weakType

      const { next, delta } = rerollPartBonus(target.bonusMultiplier)
      target.bonusMultiplier = next
      if (delta !== 0) {
        bonusChanges.push({ partName: target.name, delta })
      }
    }
    isConfirmed.value = false

    rerollFeedback.value = { partName, chorusGroup, bonusChanges, seq: ++rerollSeq }

    const memberId = part.assignedMemberId
    if (memberId) {
      const member = memberStore.getMemberById(memberId)
      if (member) {
        const breakdown = calcPartPointBreakdown(member, part)
        const strongCount = breakdown.filter((row) => row.tier === 'strong').length

        assignFeedback.value = {
          partName,
          point: calcPartPointWithPenalty(member, part, parts.value),
          strongCount,
          seq: ++feedbackSeq,
        }
      }
    }

    persistParts()
    return true
  }

  return {
    parts,
    songTitle,
    isConfirmed,
    totalPoint,
    isComplete,
    assignFeedback,
    rerollFeedback,
    assignMember,
    unassignMember,
    confirmSong,
    rerollPartAffinity,
  }
})
