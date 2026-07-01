import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PartName } from '@/types'

export type DragSource =
  | { kind: 'member-list'; memberId: string }
  | { kind: 'part-block'; partName: PartName; memberId: string }

function resolveHoveredPartName(x: number, y: number): PartName | null {
  const hit = document.elementsFromPoint(x, y).find(
    (el) => el instanceof HTMLElement && el.dataset.partName,
  )
  if (!hit || !(hit instanceof HTMLElement)) return null
  return hit.dataset.partName as PartName
}

export const useDragStore = defineStore('drag', () => {
  const isDragging = ref(false)
  const source = ref<DragSource | null>(null)
  const pointerX = ref(0)
  const pointerY = ref(0)
  const hoveredPartName = ref<PartName | null>(null)

  function startDrag(src: DragSource, x: number, y: number) {
    isDragging.value = true
    source.value = src
    pointerX.value = x
    pointerY.value = y
    hoveredPartName.value = resolveHoveredPartName(x, y)
  }

  function movePointer(x: number, y: number) {
    pointerX.value = x
    pointerY.value = y
    hoveredPartName.value = resolveHoveredPartName(x, y)
  }

  function endDrag() {
    isDragging.value = false
    source.value = null
    hoveredPartName.value = null
  }

  return { isDragging, source, pointerX, pointerY, hoveredPartName, startDrag, movePointer, endDrag }
})
