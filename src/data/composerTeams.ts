import type { ComposerTeam } from '@/types/composerTeam'

/** 작곡팀 30개 — compositionSkill 분포로 저가·고가 곡 담당 팀이 나뉜다. */
export const COMPOSER_TEAMS: readonly ComposerTeam[] = [
  // 상위 (66~100) — 고비용·고품질 곡
  { id: 'moonlight-studio', name: '문라이트 스튜디오', compositionSkill: 100, primaryType: 'R' },
  { id: 'crimson-pulse', name: '크림슨 펄스', compositionSkill: 95, primaryType: 'R' },
  { id: 'neon-wave', name: '네온 웨이브', compositionSkill: 92, primaryType: 'R' },
  { id: 'silverlight', name: '실버라이트', compositionSkill: 90, primaryType: 'G' },
  { id: 'skyline-sound', name: '스카이라인 사운드', compositionSkill: 88, primaryType: 'B' },
  { id: 'coral-rhythm', name: '코랄 리듬', compositionSkill: 85, primaryType: 'G' },
  { id: 'echo-factory', name: '에코 팩토리', compositionSkill: 82, primaryType: 'B' },
  { id: 'pulse-maker', name: '펄스 메이커', compositionSkill: 78, primaryType: 'R' },
  { id: 'signal-works', name: '시그널 웍스', compositionSkill: 75, primaryType: 'B' },
  { id: 'tide-wave', name: '타이드 웨이브', compositionSkill: 72, primaryType: 'B' },

  // 중위 (36~65)
  { id: 'midnight-beat', name: '미드나잇 비트', compositionSkill: 68, primaryType: 'R' },
  { id: 'bluenote-lab', name: '블루노트 랩', compositionSkill: 65, primaryType: 'B' },
  { id: 'harmonic-room', name: '하모닉 룸', compositionSkill: 62, primaryType: 'G' },
  { id: 'green-note', name: '그린 노트', compositionSkill: 60, primaryType: 'G' },
  { id: 'velvet-track', name: '벨벳 트랙', compositionSkill: 58, primaryType: 'R' },
  { id: 'crystal-line', name: '크리스탈 라인', compositionSkill: 55, primaryType: 'B' },
  { id: 'aurora-beat', name: '오로라 비트', compositionSkill: 50, primaryType: 'G' },
  { id: 'flash-studio', name: '플래시 스튜디오', compositionSkill: 48, primaryType: 'R' },
  { id: 'luna-sound', name: '루나 사운드', compositionSkill: 46, primaryType: 'B' },
  { id: 'dream-hill', name: '드림힐', compositionSkill: 45, primaryType: 'G' },
  { id: 'dust-loop', name: '더스트 루프', compositionSkill: 44, primaryType: 'G' },

  // 하위 (22~35) — 저비용 곡 위주
  { id: 'rookie-maker', name: '루키 메이커', compositionSkill: 40, primaryType: 'R' },
  { id: 'patchwork', name: '패치워크', compositionSkill: 38, primaryType: 'B' },
  { id: 'street-melody', name: '거리의 멜로디', compositionSkill: 35, primaryType: 'G' },
  { id: 'teen-tune', name: '틴에이지 튠', compositionSkill: 32, primaryType: 'R' },
  { id: 'basecamp', name: '베이스캠프', compositionSkill: 30, primaryType: 'B' },
  { id: 'sketch-room', name: '스케치룸', compositionSkill: 28, primaryType: 'G' },
  { id: 'home-recording', name: '홈레코딩', compositionSkill: 26, primaryType: 'R' },
  { id: 'underdog-sound', name: '언더독 사운드', compositionSkill: 24, primaryType: 'B' },
  { id: 'freelance-beat', name: '프리랜서 비트', compositionSkill: 22, primaryType: 'G' },
] as const

export function getComposerTeamById(id: string): ComposerTeam | undefined {
  return COMPOSER_TEAMS.find((team) => team.id === id)
}
