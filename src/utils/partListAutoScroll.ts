const EDGE_ZONE_PX = 56
const MAX_SCROLL_PX = 12

let rafId: number | null = null
let scrollList: HTMLElement | null = null
let scrollSpeed = 0
let onScrollTick: (() => void) | null = null

function getPartBlockList(): HTMLElement | null {
  return document.querySelector('.part-block-list')
}

function clampScrollSpeed(x: number, rect: DOMRect): number {
  if (x < rect.left + EDGE_ZONE_PX) {
    const depth = Math.min(1, (rect.left + EDGE_ZONE_PX - x) / EDGE_ZONE_PX)
    return -MAX_SCROLL_PX * depth
  }

  if (x > rect.right - EDGE_ZONE_PX) {
    const depth = Math.min(1, (x - (rect.right - EDGE_ZONE_PX)) / EDGE_ZONE_PX)
    return MAX_SCROLL_PX * depth
  }

  return 0
}

function tick() {
  if (!scrollList || scrollSpeed === 0) {
    stopPartListAutoScroll()
    return
  }

  const prevScrollLeft = scrollList.scrollLeft
  scrollList.scrollLeft += scrollSpeed

  if (scrollList.scrollLeft !== prevScrollLeft) {
    onScrollTick?.()
  }

  if (scrollSpeed < 0 && scrollList.scrollLeft <= 0) {
    stopPartListAutoScroll()
    return
  }

  const maxScrollLeft = scrollList.scrollWidth - scrollList.clientWidth
  if (scrollSpeed > 0 && scrollList.scrollLeft >= maxScrollLeft) {
    stopPartListAutoScroll()
    return
  }

  rafId = requestAnimationFrame(tick)
}

function startPartListAutoScroll(list: HTMLElement, speed: number) {
  scrollList = list
  scrollSpeed = speed

  if (rafId === null) {
    rafId = requestAnimationFrame(tick)
  }
}

export function stopPartListAutoScroll() {
  scrollSpeed = 0
  scrollList = null
  onScrollTick = null

  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

export function updatePartListAutoScroll(
  x: number,
  y: number,
  onScroll?: () => void,
) {
  const list = getPartBlockList()
  if (!list) {
    stopPartListAutoScroll()
    return
  }

  const rect = list.getBoundingClientRect()
  if (y < rect.top || y > rect.bottom) {
    stopPartListAutoScroll()
    return
  }

  const speed = clampScrollSpeed(x, rect)
  if (speed === 0) {
    stopPartListAutoScroll()
    return
  }

  onScrollTick = onScroll ?? null
  startPartListAutoScroll(list, speed)
}
