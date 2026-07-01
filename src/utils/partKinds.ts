import type { PartName } from '@/types'

export const CHORUS_PART_NAMES = ['chorus1', 'chorus2', 'chorus3'] as const satisfies readonly PartName[]

export function isChorusPart(name: PartName): boolean {
  return (CHORUS_PART_NAMES as readonly PartName[]).includes(name)
}
