import { onUnmounted, type Ref } from 'vue'
import { useDragStore, type DragSource } from '@/stores/useDragStore'
import { resolvePartBlockAtPoint } from '@/utils/partHitTest'

const DRAG_THRESHOLD_PX = 12
const LONG_PRESS_MS = 300

interface UseDraggableOptions {
  getSource: () => DragSource
  disabled?: Ref<boolean>
  requireLongPress?: boolean
  onTap?: () => void
}

export function useDraggable(options: UseDraggableOptions) {
  const dragStore = useDragStore()

  let startX = 0
  let startY = 0
  let startTime = 0
  let pointerId: number | null = null
  let captureTarget: HTMLElement | null = null
  let longPressTimer: ReturnType<typeof setTimeout> | null = null
  let dragStarted = false
  let gestureEndedWithDrag = false
  let touchDragActive = false
  let lastTapAt = 0

  function clearLongPressTimer() {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  function releaseCapture() {
    if (captureTarget && pointerId !== null) {
      try {
        captureTarget.releasePointerCapture(pointerId)
      } catch {
        /* already released */
      }
    }
    captureTarget = null
  }

  function isTapLike(event: PointerEvent) {
    if (dragStarted || gestureEndedWithDrag) return false
    if (Date.now() - startTime >= LONG_PRESS_MS) return false
    return Math.hypot(event.clientX - startX, event.clientY - startY) < DRAG_THRESHOLD_PX
  }

  function tryEmitTap() {
    if (!options.onTap) return
    const now = Date.now()
    if (now - lastTapAt < 350) return
    lastTapAt = now
    options.onTap()
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
    if (touchDragActive) return
    const tap = isTapLike(event)
    finishInteraction()
    if (tap && !('ontouchstart' in window)) tryEmitTap()
  }

  function onWindowPointerCancel(event: PointerEvent) {
    if (pointerId !== event.pointerId) return
    // 모바일: 이동 시 브라우저가 pointercancel을 보내지만 터치로 드래그는 계속된다
    if (dragStarted) return
    const tap = isTapLike(event)
    finishInteraction(true)
    if (tap && !('ontouchstart' in window)) tryEmitTap()
  }

  function onTouchDragMove(event: TouchEvent) {
    if (!dragStarted || event.touches.length !== 1) return
    event.preventDefault()
    const touch = event.touches[0]
    dragStore.movePointer(touch.clientX, touch.clientY)
  }

  function onTouchDragEnd(event: TouchEvent) {
    if (!dragStarted) return
    const touch = event.changedTouches[0]
    if (touch) {
      dragStore.movePointer(touch.clientX, touch.clientY)
    }
    finishInteraction()
  }

  function onTouchDragCancel() {
    if (!dragStarted) return
    finishInteraction(true)
  }

  function addTouchDragListeners() {
    document.addEventListener('touchmove', onTouchDragMove, { passive: false })
    document.addEventListener('touchend', onTouchDragEnd)
    document.addEventListener('touchcancel', onTouchDragCancel)
  }

  function removeTouchDragListeners() {
    document.removeEventListener('touchmove', onTouchDragMove)
    document.removeEventListener('touchend', onTouchDragEnd)
    document.removeEventListener('touchcancel', onTouchDragCancel)
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
    if ('ontouchstart' in window) {
      touchDragActive = true
      addTouchDragListeners()
    }
  }

  function finishInteraction(cancelled = false) {
    clearLongPressTimer()
    removeWindowListeners()
    removeTouchDragListeners()
    touchDragActive = false

    if (dragStarted && !cancelled) {
      resolveDropTarget(dragStore.pointerX, dragStore.pointerY, dragStore.source)
    }

    if (dragStarted) {
      gestureEndedWithDrag = true
      dragStore.endDrag()
    }

    releaseCapture()
    pointerId = null
    dragStarted = false
  }

  function onPointerDown(event: PointerEvent) {
    if (options.disabled?.value) return
    if (event.button !== 0) return

    gestureEndedWithDrag = false
    pointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    startTime = Date.now()
    dragStarted = false

    captureTarget = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    try {
      captureTarget?.setPointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }

    addWindowListeners()

    if (options.requireLongPress) {
      clearLongPressTimer()
      longPressTimer = setTimeout(() => {
        beginDrag(startX, startY)
      }, LONG_PRESS_MS)
    }
  }

  function onClick() {
    if (options.disabled?.value) return
    if (gestureEndedWithDrag) {
      gestureEndedWithDrag = false
      return
    }
    // 터치 기기: touchend에서 탭 처리 + preventDefault로 click 합성 차단
    if ('ontouchstart' in window) return
    tryEmitTap()
  }

  onUnmounted(() => {
    clearLongPressTimer()
    removeWindowListeners()
    removeTouchDragListeners()
    releaseCapture()
  })

  return { onPointerDown, onClick }
}

function resolveDropTarget(x: number, y: number, source: DragSource | null) {
  const partAtPoint = resolvePartBlockAtPoint(x, y)

  if (
    partAtPoint &&
    source?.kind === 'part-block' &&
    partAtPoint.dataset.partName === source.partName
  ) {
    return
  }

  const excludePartName = source?.kind === 'part-block' ? source.partName : null
  const partEl = excludePartName
    ? resolvePartBlockAtPoint(x, y, excludePartName)
    : partAtPoint

  if (partEl) {
    partEl.dispatchEvent(
      new CustomEvent('chor1o-drop', {
        bubbles: true,
        detail: { x, y },
      }),
    )
    return
  }

  const dropEl = document.elementsFromPoint(x, y).find(
    (el) => el instanceof HTMLElement && el.dataset.dropZone && !el.dataset.partName,
  )
  if (!dropEl || !(dropEl instanceof HTMLElement)) return

  dropEl.dispatchEvent(
    new CustomEvent('chor1o-drop', {
      bubbles: true,
      detail: { x, y },
    }),
  )
}
