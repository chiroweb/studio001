# BLISS CONTENTS

BLISS CONTENTS의 영화·드라마·광고 콘텐츠를 위한 인터랙티브 원페이지 포트폴리오 히어로입니다.

검은 공간의 코스모스 영상을 중심으로 대표작 8개가 타원 궤도를 돌며, 중앙 작품만 선명하게 초점이 맞습니다. 앞쪽 작품은 꽃 앞으로, 뒤쪽 작품은 꽃 마스크 뒤로 지나갑니다.

## 실행

```bash
npm install
npm run dev
```

프로덕션 빌드:

```bash
npm run build
npm start
```

## 주요 구성

- Next.js App Router
- React + TypeScript
- GSAP ScrollTrigger
- Lenis smooth scroll
- 반응형 타원 궤도
- 배경·전경 영상 동기화
- 코스모스 꽃 마스크 가림
- Reduced Motion 대응
- 프로젝트 전체화면 미리보기

## 에셋

- 배경 영상: `public/media/`
- 꽃 마스크: `public/masks/cosmos-flower-mask.png`
- 대표작 이미지: `public/projects/project-01` ~ `project-08`
- 프로젝트 데이터: `src/data/projects.ts`

현재 대표작 이미지는 인터랙션 검수를 위한 임시 시네마틱 스틸입니다. 실제 프로젝트 자료가 준비되면 동일한 경로의 이미지와 `src/data/projects.ts` 내용을 교체하면 됩니다.
