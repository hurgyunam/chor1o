import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PartBlock, PartName } from '@/types'
import { useMemberStore } from '@/stores/useMemberStore'
import { calcPartPoint, calcPartPointBreakdown, calcSongPoint } from '@/utils/pointCalc'

export interface AssignFeedback {
  partName: PartName
  point: number
  strongCount: number
  seq: number
}

const PART_DEFINITIONS: Pick<PartBlock, 'name' | 'label' | 'strongType' | 'neutralType' | 'weakType'>[] = [
  { name: 'intro',   label: '인트로',   strongType: 'R', neutralType: 'G', weakType: 'B' },
  { name: 'part1-1', label: '파트1-1',  strongType: 'G', neutralType: 'B', weakType: 'R' },
  { name: 'part1-2', label: '파트1-2',  strongType: 'B', neutralType: 'R', weakType: 'G' },
  { name: 'chorus1', label: '싸비',     strongType: 'R', neutralType: 'B', weakType: 'G' },
  { name: 'part2-1', label: '파트2-1',  strongType: 'G', neutralType: 'R', weakType: 'B' },
  { name: 'part2-2', label: '파트2-2',  strongType: 'B', neutralType: 'G', weakType: 'R' },
  { name: 'chorus2', label: '싸비',     strongType: 'R', neutralType: 'B', weakType: 'G' },
  { name: 'bridge',  label: '브릿지',   strongType: 'G', neutralType: 'R', weakType: 'B' },
  { name: 'chorus3', label: '싸비',     strongType: 'R', neutralType: 'B', weakType: 'G' },
]

export const useSongStore = defineStore('song', () => {
  const memberStore = useMemberStore()

  const parts = ref<PartBlock[]>(
    PART_DEFINITIONS.map((def) => ({ ...def, assignedMemberId: null })),
  )

  const songTitle = ref('Fly(가제)')
  const isConfirmed = ref(false)

  let feedbackSeq = 0
  const assignFeedback = ref<AssignFeedback | null>(null)

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
    if (!member) return

    const breakdown = calcPartPointBreakdown(member, part)
    const strongCount = breakdown.filter((row) => row.tier === 'strong').length

    assignFeedback.value = {
      partName,
      point: calcPartPoint(member, part),
      strongCount,
      seq: ++feedbackSeq,
    }

    if (strongCount >= 2 && typeof navigator.vibrate === 'function') {
      navigator.vibrate(12)
    }
  }

  function unassignMember(partName: PartName) {
    const part = parts.value.find((p) => p.name === partName)
    if (part) part.assignedMemberId = null
    isConfirmed.value = false
  }

  function confirmSong() {
    if (!isComplete.value || isConfirmed.value) return
    isConfirmed.value = true
  }

  return {
    parts,
    songTitle,
    isConfirmed,
    totalPoint,
    isComplete,
    assignFeedback,
    assignMember,
    unassignMember,
    confirmSong,
  }
})
