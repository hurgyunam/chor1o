import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Member } from '@/types'

export const useMemberStore = defineStore('member', () => {
  const members = ref<Member[]>([
    {
      id: 'm1',
      name: '이수아',
      imageUrl: '',
      appearance: { type: 'R', level: 8 },
      vocal: { type: 'G', level: 6 },
      choreography: { type: 'B', level: 5 },
    },
    {
      id: 'm2',
      name: '박지유',
      imageUrl: '',
      appearance: { type: 'G', level: 5 },
      vocal: { type: 'R', level: 9 },
      choreography: { type: 'G', level: 4 },
    },
    {
      id: 'm3',
      name: '최다은',
      imageUrl: '',
      appearance: { type: 'B', level: 7 },
      vocal: { type: 'B', level: 5 },
      choreography: { type: 'R', level: 10 },
    },
  ])

  function getMemberById(id: string): Member | undefined {
    return members.value.find((m) => m.id === id)
  }

  return { members, getMemberById }
})
