- 이미 AI를 통해 개발한 소스코드의 로직만을 뽑아놓은 문서
- 최대한 이해하기 쉬운 방향으로 글 또는 수도코드를 사용해 표현


### 작곡팀 곡 카탈로그 (고정 30곡 × 30팀)

구현: `src/utils/teamSongCatalogBuilder.ts`, `src/data/teamSongCatalog.ts`

앱 기동 시 **시드 기반으로 결정론적 생성** → 항상 같은 900곡(30팀 × 30곡).

```
TeamCatalogSong = {
  id:            "moonlight-studio-song-01"  (팀·곡마다 고정)
  teamId, title, structureType
  segments:      파트 라벨·길이 고정
  partAffinities: 파트별 R·G·B 성향 고정 (팀 주특성 70% 반영)
  chartPoint:    음원차트 순위용 고정 점수
}
```

- 곡 제목·구조·파트 성향은 **탐색할 때마다 바뀌지 않음**
- 데모 업로드마다 바뀌는 것: `id`(인스턴스), `cost`(슬라이더 범위에 맞게 파트 밸류만 재배분)
- `catalogSongId`로 데모·차트·구매 곡이 동일 곡임을 식별

#### 카탈로그 곡 구조 생성 (빌드 시 1회)

팀 ID + 곡 인덱스를 시드로 사용 (`createSeededRngFromString("moonlight-studio#0")`).

```
곡 30개 중 약 20% special, 80% main
파트 수 7~14, 세그먼트 길이·벌스 분할도 시드로 고정
chartPoint = compositionSkill × 120 + 랜덤(0~4200) + 슬롯 보정
```

상위 팀 곡일수록 chartPoint가 높아 **주간 차트 상위권**에 자주 진입.


### 작곡팀 데모곡 생성 로직

`generateDemoSong({ costMin, costMax })` — 카탈로그 곡 1개를 꺼내 비용만 맞춘다.

#### 1. 팀·카탈로그 곡 선택

```
team        = pickTeamForCostRange(costMin, costMax)
catalogSong = pickCatalogSongForTeam(team, costMin, costMax)
  → 팀 카탈로그 30곡 중, 팀 능력으로 만들 수 있는 비용과 겹치는 곡만 후보

targetCost  = [costMin, costMax] ∩ [파트수×min, 파트수×max] 에서 균등 랜덤
```

범위와 맞지 않으면 최대 24회 재시도.

#### 2. 파트 고유밸류 배분 (구조는 카탈로그 고정)

```
각 파트 고유밸류 = 52~145 (compositionSkill 티어에 따라)
파트 고유밸류 합 = targetCost

compositionSkill 35 이하: 대부분 낮은 값 + 1~2개 파트만 높게
```

#### 3. 카탈로그 → 데모 파트 블록

```
segments, partAffinities → 카탈로그 그대로
bonusMultiplier만 targetCost 분배 결과로 채움
```

#### 4. 최종 데모곡 객체

```
DemoSong = {
  id,                    // 업로드마다 새 인스턴스 ID
  catalogSongId,         // 카탈로그 고정 ID
  teamId, teamName, teamPrimaryType, compositionSkill
  title,                 // 카탈로그 고정 제목
  structureType, segments, parts, totalDuration, cost
}
```


### 음원차트 연동

구현: `src/data/songChart.ts` ← `getWeeklyChartEntries()`

```
주간 차트 12곡 = 전체 카탈로그 900곡 중 chartPoint 상위 (제목 중복 제외)
```

플레이어가 `/demos`에서 본 곡 제목이 `Fly(가제)` 음원차트에도 그대로 등장.
구조보기로 본 파트 배치와 차트 1위 곡이 **동일 카탈로그**이므로
「아, 데모에서 봤는데 지금 1위네? 살걸…」 경험을 유도.


### 작곡팀 데모 탐색 로직

`/demos` 페이지에서 `useDemoStore`가 탐색 상태를 관리한다.

#### 1. 비용 범위 설정

```
costMin, costMax: 슬라이더로 364~2175 코인 범위 설정 (기본 500~1600)
최소 > 최대가 되지 않도록 서로 자동 보정
canExplore = (costMin <= costMax)
```

#### 2. 탐색 시작 / 취소

```
탐색 버튼 클릭:
  isExploring = true
  demos 목록 초기화 (빈 배열)
  scheduleNextUpload() 시작

탐색 취소 버튼 클릭:
  isExploring = false
  업로드 타이머 해제 (더 이상 데모 생성 안 함)
  이미 테이블에 올라온 데모는 그대로 유지
```

#### 3. 데모 업로드 (폴링)

```
UPLOAD_INTERVAL_MS = 1400 (1.4초마다 반복)

scheduleNextUpload():
  if not isExploring → 종료

  demo = generateDemoSong({ costMin, costMax })
  demos에 demo 추가 (항상 범위 안 — 생성 시 보장)

  1.4초 후 다시 scheduleNextUpload() 호출 (재귀 타이머)
```

생성 후 필터링하지 않는다. 비용 범위를 생성 파라미터로 넘겨 무한 로딩을 방지한다.

#### 4. UI 로딩 표시

```
탐색 중 + demos 비어 있음 → 테이블 전체에 로딩 스피너
탐색 중 + demos 1개 이상  → 하단에 "추가 데모 탐색 중" 인라인 로딩
탐색 중이 아님           → 탐색 버튼 표시
탐색 중                  → 탐색 취소 버튼 표시
```

#### 5. 구조보기

```
row의 "구조보기" 클릭 → /demo/song/:id 로 이동
useDemoStore.getDemoById(id)로 메모리 내 데모 조회
(탐색 세션 동안만 유효 — 새 탐색 시작 시 목록이 초기화됨)
```

#### 6. 구매

```
purchaseDemo(demoId):
  1. 데모 존재 여부, 이미 구매했는지(songs localStorage) 확인
  2. gameStore.spendCoins(demo.cost) — 코인 부족 시 실패
  3. songs localStorage에 구매 곡 추가 (purchasedAt 타임스탬프 포함)
  4. demos 목록에서 해당 row 제거

구매 버튼 활성 조건:
  - 아직 구매하지 않음
  - 보유 코인 >= 곡 비용
```

#### 7. 코인 영속화

```
localStorage key "game" → { coins: number }
  - 앱 시작 시 로드, 없으면 초기값 100
  - spendCoins() 시 즉시 저장

localStorage key "songs" → PurchasedSong[] (JSON)
  - 구매 시 append 후 저장
```


### 작곡팀 프로필 로직

구현: `src/data/composerTeams.ts`, `src/utils/composerTeamUtils.ts`

#### 1. 작곡팀 프로필 (30개 고정)

각 팀은 밸런스 데이터로 정의된다.

```
ComposerTeam = {
  id:           고유 식별자 (예: "moonlight-studio")
  name:         표시 이름 (예: "문라이트 스튜디오")
  compositionSkill: 1~100 작곡 능력
  primaryType:  주 특성 R | G | B
}
```

예시:
- 문라이트 스튜디오 — compositionSkill 100, primaryType R (빨강)
- 프리랜서 비트 — compositionSkill 22, primaryType G (저가 곡 위주)

티어 분포 (대략):
- 상위 10팀 (66~100): 고비용·고품질
- 중위 11팀 (36~65)
- 하위 9팀 (22~35): 저비용 곡 위주

#### 2. 비용 범위에 맞는 팀 선택 (`pickTeamForCostRange`)

```
팀 비용 구간 = [7 × 파트min, 15 × 파트max]  (compositionSkill 티어로 결정)

후보 = 탐색 슬라이더 [costMin, costMax]와 겹치는 팀
없으면 30팀 전체에서 선택

가중치 = 1 / (1 + |팀비용중심 - 목표비용중심| / 200)
  → 저가 탐색 시 하위 팀, 고가 탐색 시 상위 팀이 자주 등장
```

#### 3. 팀 주 특성 → 카탈로그 파트 성향 (빌드 시 고정)

```
각 카탈로그 곡 파트마다:
  70%: strongType = team.primaryType
  30%: R·G·B 완전 셔플
```