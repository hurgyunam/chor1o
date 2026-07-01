import { onUnmounted, type Ref } from 'vue'
import { useDragStore, type DragSource } from '@/stores/useDragStore'

const DRAG_THRESHOLD_PX = 12
const LONG_PRESS_MS = 300

interface UseDraggableOptions {
  getSource: () => DragSource
  disabled?: Ref<boolean>
  requireLongPress?: boolean
}

export function useDraggable(options: UseDraggableOptions) {
  const dragStore = useDragStore()

  let startX = 0
  let startY = 0
  let pointerId: number | null = null
  let longPressTimer: ReturnType<typeof setTimeout> | null = null
  let dragStarted = false

  function clearLongPressTimer() {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  function onWindowPointerMove(event: PointerEvent) {
    if (pointerId !== event.pointerId) return

    const dx = event.clientX - startX
    const dy = event.clientY - startY
    const distance = Math.hypot(dx, dy)

    if (!dragStarted && distance >= DRAG_THRESHOLD_PX && !options.requireLongPress) {
      beginDrag(event.clientX, event.clientY)
    }

    if (dragStarted) {
      dragStore.movePointer(event.clientX, event.clientY)
    }
  }

  function onWindowPointerUp(event: PointerEvent) {
    if (pointerId !== event.pointerId) return
    finishInteraction()
  }

  function onWindowPointerCancel(event: PointerEvent) {
    if (pointerId !== event.pointerId) return
    finishInteraction(true)
  }

  function addWindowListeners() {
    window.addEventListener('pointermove', onWindowPointerMove)
    window.addEventListener('pointerup', onWindowPointerUp)
    window.addEventListener('pointercancel', onWindowPointerCancel)
  }

  function removeWindowListeners() {
    window.removeEventListener('pointermove', onWindowPointerMove)
    window.removeEventListener('pointerup', onWindowPointerUp)
    window.removeEventListener('pointercancel', onWindowPointerCancel)
  }

  function beginDrag(x: number, y: number) {
    if (dragStarted) return
    dragStarted = true
    clearLongPressTimer()
    dragStore.startDrag(options.getSource(), x, y)
  }

  function finishInteraction(cancelled = false) {
    clearLongPressTimer()
    removeWindowListeners()

    if (dragStarted && !cancelled) {
      resolveDropTarget(dragStore.pointerX, dragStore.pointerY)
    }

    if (dragStarted) {
      dragStore.endDrag()
    }

    pointerId = null
    dragStarted = false
  }

  function onPointerDown(event: PointerEvent) {
    if (options.disabled?.value) return
    if (event.button !== 0) return

    pointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    dragStarted = false

    addWindowListeners()

    if (options.requireLongPress) {
      clearLongPressTimer()
      longPressTimer = setTimeout(() => {
        beginDrag(event.clientX, event.clientY)
      }, LONG_PRESS_MS)
    }
  }

  onUnmounted(() => {
    clearLongPressTimer()
    removeWindowListeners()
  })

  return { onPointerDown }
}

function resolveDropTarget(x: number, y: number) {
  const elements = document.elementsFromPoint(x, y)
  const dropEl = elements.find((el) => el instanceof HTMLElement && el.dataset.dropZone)
  if (!dropEl || !(dropEl instanceof HTMLElement)) return

  dropEl.dispatchEvent(
    new CustomEvent('chor1o-drop', {
      bubbles: true,
      detail: { x, y },
    }),
  )
}
