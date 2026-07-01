import type { PartName } from '@/types'

interface PartSlot {
  element: HTMLElement
  partName: PartName
  centerX: number
  rect: DOMRect
}

function collectPartSlots(excludePartName?: PartName | null): PartSlot[] {
  const list = document.querySelector('.part-block-list')
  if (!list) return []

  return Array.from(list.querySelectorAll<HTMLElement>('[data-part-name]'))
    .map((element) => {
      const partName = element.dataset.partName as PartName
      const rect = element.getBoundingClientRect()
      return {
        element,
        partName,
        centerX: rect.left + rect.width / 2,
        rect,
      }
    })
    .filter((slot) => slot.partName !== excludePartName)
}

function pickNearestSlot(slots: PartSlot[], x: number): PartSlot | null {
  if (slots.length === 0) return null

  return slots.reduce<PartSlot | null>((best, slot) => {
    if (!best) return slot
    return Math.abs(x - slot.centerX) < Math.abs(x - best.centerX) ? slot : best
  }, null)
}

export function resolvePartBlockAtPoint(
  x: number,
  y: number,
  excludePartName?: PartName | null,
): HTMLElement | null {
  const list = document.querySelector('.part-block-list')
  if (!list) return null

  const listRect = list.getBoundingClientRect()
  if (y < listRect.top || y > listRect.bottom) return null

  const slots = collectPartSlots(excludePartName)
  if (slots.length === 0) return null

  const containing = slots.filter(
    (slot) =>
      x >= slot.rect.left &&
      x <= slot.rect.right &&
      y >= slot.rect.top &&
      y <= slot.rect.bottom,
  )

  if (containing.length === 1) return containing[0].element

  const verticallyAligned = slots.filter((slot) => y >= slot.rect.top && y <= slot.rect.bottom)
  const candidates = containing.length > 1 ? containing : verticallyAligned

  return pickNearestSlot(candidates.length > 0 ? candidates : slots, x)?.element ?? null
}

export function resolvePartNameAtPoint(
  x: number,
  y: number,
  excludePartName?: PartName | null,
): PartName | null {
  const element = resolvePartBlockAtPoint(x, y, excludePartName)
  return (element?.dataset.partName as PartName | undefined) ?? null
}
