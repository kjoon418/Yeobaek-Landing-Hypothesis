# Yeobaek Landing Hypothesis

여백의 핵심 흐름인 **모임 → 독서 → 댓글**을 서버나 회원가입 없이 브라우저에서 직접 체험하는 인터랙티브 데모입니다.

## 주요 경험

- 첫 방문자를 위한 짧은 온보딩
- 모임별로 구분된 도서 목록
- 각 도서의 앞 2개 챕터 읽기
- 읽기 화면 스크롤에 따른 진도 자동 반영
- 문장 선택과 댓글 작성 체험
- 새로고침 시 초기화되는 의도된 비영속 데모 데이터

## 로컬 실행

별도의 빌드 과정은 필요하지 않습니다. 저장소 루트에서 정적 파일 서버를 실행하세요.

```bash
npx serve .
```

사이트는 루트 경로(`/`)에 배포되며, 도서 데이터는 `data/books`에 있습니다.

## 네이버 애널리틱스

`index.html`의 `naver-analytics-id` 메타 태그에 네이버 애널리틱스에서 발급한 분석 ID를 설정하면 방문자와 페이지뷰가 수집됩니다. 사용자 행동은 다음 이벤트로 확인할 수 있습니다.

- `Funnel / ReadingStarted`: 책 읽기 화면 진입
- `Funnel / CommentViewed`: 기존 댓글이 있는 문단의 댓글 확인
- `Funnel / CommentWritten`: 새 댓글 작성
- `Funnel / WaitlistOpened`: 사전신청 모달 열기
- `Funnel / InstagramOpened`: 여백 팀 Instagram 열기
- `Book / Selected{BookId}`: 도서별 선택
- `Acquisition / School{SchoolCode}`: 학교 커뮤니티별 유입

이벤트에는 이메일, 댓글 내용, 사용자 이름을 포함하지 않습니다.
동일한 방문 세션에서 같은 행동은 한 번만 집계하며, 로컬 개발 주소에서는 분석 스크립트를 실행하지 않습니다.

학교 커뮤니티에 링크를 공유할 때는 다음처럼 `school` 파라미터를 추가합니다.

```text
https://yeobaek-landing-hypothesis.vercel.app/?school=yonsei-university
```

학교 코드는 영문으로 시작하는 영문·숫자·하이픈 조합을 사용합니다. 위 링크로 유입되면 네이버 애널리틱스의 이벤트 보고서에서 `Acquisition / SchoolYonseiUniversity`로 확인할 수 있습니다. 같은 방문 세션에서 링크를 여러 번 열어도 해당 학교 유입은 한 번만 집계됩니다.

## 배포

Vercel의 정적 사이트로 배포합니다. `main` 브랜치의 변경 사항을 Vercel 프로젝트에 연결해 운영할 수 있습니다.

최종 선택된 도서 표지 10종은 `/cover-gallery`에서 한눈에 확인할 수 있습니다.

원본은 `2026-yeobaek` 저장소의 `landing-page` 브랜치, 커밋 `cad8cc6`에서 분리했습니다.
