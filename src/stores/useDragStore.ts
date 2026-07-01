import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PartName } from '@/types'
import { updatePartListAutoScroll, stopPartListAutoScroll } from '@/utils/partListAutoScroll'
import { resolvePartNameAtPoint } from '@/utils/partHitTest'

export type DragSource =
  | { kind: 'member-list'; memberId: string }
  | { kind: 'part-block'; partName: PartName; memberId: string }

function resolveHoveredPartName(
  x: number,
  y: number,
  _source: DragSource | null,
): PartName | null {
  return resolvePartNameAtPoint(x, y)
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
    hoveredPartName.value = resolveHoveredPartName(x, y, src)
  }

  function refreshHoveredPart() {
    hoveredPartName.value = resolveHoveredPartName(
      pointerX.value,
      pointerY.value,
      source.value,
    )
  }

  function movePointer(x: number, y: number) {
    pointerX.value = x
    pointerY.value = y
    refreshHoveredPart()
    updatePartListAutoScroll(x, y, refreshHoveredPart)
  }

  function endDrag() {
    stopPartListAutoScroll()
    isDragging.value = false
    source.value = null
    hoveredPartName.value = null
  }

  return { isDragging, source, pointerX, pointerY, hoveredPartName, startDrag, movePointer, endDrag }
})
