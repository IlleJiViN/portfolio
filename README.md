# 프로젝트 소개

순수 HTML, CSS, JavaScript로 만든 반응형 개인 개발자 포트폴리오입니다. 이 프로젝트는 프레임워크 없이 **Event → State → Render → DOM** 흐름을 익히는 것을 목표로 합니다.

# 주요 기능

- 모바일 햄버거 메뉴와 부드러운 섹션 이동
- localStorage를 사용하는 다크 모드
- GitHub REST API 기반 프로젝트 카드 생성
- loading / success / error / empty 상태 및 재시도 버튼
- 스크롤에 따른 navbar 스타일, 최상단 이동 버튼
- IntersectionObserver 기반 진입 애니메이션
- 입력 즉시 검증하는 Contact Form

# 사용 기술

- HTML
- CSS
- JavaScript
- GitHub REST API

# 프로젝트 구조

```text
portfolio/
├─ index.html
├─ css/style.css
├─ js/main.js
├─ images/profile.svg
└─ README.md
```

# 상태 관리 구조

```text
Event → State → Render → DOM
```

- Theme: 버튼 click → `themeState` 변경 → `renderTheme()` → `data-theme` 변경
- Projects: API 요청 → `projectState` 변경 → `renderProjects()` → 카드 DOM 변경
- Form: input/submit → `formState` 변경 → `renderFormErrors()` → 오류 DOM 변경

# 실행 방법

1. `portfolio/js/main.js` 상단의 `GITHUB_USERNAME`을 GitHub ID로 바꿉니다.
2. `portfolio/index.html`을 브라우저에서 엽니다. 로컬 서버 사용 시 더 안정적으로 확인할 수 있습니다.

# GitHub Pages 배포 방법

1. GitHub에서 새 저장소를 만들고 `portfolio` 내부 파일을 push합니다.
2. 저장소의 **Settings → Pages**에서 배포 브랜치와 `/ (root)`를 선택합니다.
3. 생성된 GitHub Pages URL을 아래에 기록합니다.

# 배포 URL

(배포 후 작성)

# Screenshot

- Desktop
- Mobile
- Dark Mode

# 구현 기준값

- Navbar 변경: `scrollY > 60px`
- Scroll Top 버튼: `scrollY > 300px`
- IntersectionObserver threshold: `0.2`
- Breakpoints: `768px / 1024px`
