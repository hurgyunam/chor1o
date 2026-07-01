import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PartName } from '@/types'

export type DragSource =
  | { kind: 'member-list'; memberId: string }
  | { kind: 'part-block'; partName: PartName; memberId: string }

export const useDragStore = defineStore('drag', () => {
  const isDragging = ref(false)
  const source = ref<DragSource | null>(null)
  const pointerX = ref(0)
  const pointerY = ref(0)

  function startDrag(src: DragSource, x: number, y: number) {
    isDragging.value = true
    source.value = src
    pointerX.value = x
    pointerY.value = y
  }

  function movePointer(x: number, y: number) {
    pointerX.value = x
    pointerY.value = y
  }

  function endDrag() {
    isDragging.value = false
    source.value = null
  }

  return { isDragging, source, pointerX, pointerY, startDrag, movePointer, endDrag }
})
