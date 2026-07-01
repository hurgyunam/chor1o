import { type Ref } from 'vue'
import { useDragStore } from '@/stores/useDragStore'

const TAP_MOVE_THRESHOLD_PX = 12
const LONG_PRESS_MS = 300

interface UseChipTapOptions {
  disabled?: Ref<boolean>
  onTap: () => void
}

/**
 * 모바일(터치) 탭 판정. 스크롤 컨테이너가 pointer 이벤트를 취소해도 touchend로 탭을 감지한다.
 */
export function useChipTap(options: UseChipTapOptions) {
  const dragStore = useDragStore()

  let startX = 0
  let startY = 0
  let startTime = 0
  let moved = false
  let active = false

  function onTouchStart(event: TouchEvent) {
    if (options.disabled?.value) return
    if (event.touches.length !== 1) return

    const touch = event.touches[0]
    active = true
    moved = false
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
  }

  function onTouchMove(event: TouchEvent) {
    if (!active || event.touches.length !== 1) return

    const touch = event.touches[0]
    if (Math.hypot(touch.clientX - startX, touch.clientY - startY) >= TAP_MOVE_THRESHOLD_PX) {
      moved = true
    }
  }

  function onTouchEnd(event: TouchEvent) {
    if (!active) return
    active = false

    const elapsed = Date.now() - startTime
    if (moved || elapsed >= LONG_PRESS_MS) return
    if (dragStore.isDragging) return

    event.preventDefault()
    options.onTap()
  }

  function onTouchCancel() {
    active = false
  }

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel }
}
