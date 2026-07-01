import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PartBlock, PartName } from '@/types'
import { useMemberStore } from '@/stores/useMemberStore'
import { calcSongPoint } from '@/utils/pointCalc'

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

  const totalPoint = computed(() => {
    const memberMap = new Map(memberStore.members.map((m) => [m.id, m]))
    return calcSongPoint(memberMap, parts.value)
  })

  const isComplete = computed(() => parts.value.every((p) => p.assignedMemberId !== null))

  function assignMember(partName: PartName, memberId: string) {
    const part = parts.value.find((p) => p.name === partName)
    if (part) part.assignedMemberId = memberId
  }

  function unassignMember(partName: PartName) {
    const part = parts.value.find((p) => p.name === partName)
    if (part) part.assignedMemberId = null
  }

  return { parts, totalPoint, isComplete, assignMember, unassignMember }
})
