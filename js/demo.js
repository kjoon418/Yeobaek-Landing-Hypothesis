(() => {
  "use strict";

  const FALLBACK_BOOK = {
    title: "천천히 읽는 마음",
    publisher: "여백의 책들",
    publishedYear: 2026,
    authors: ["한여름"],
    chapters: [
      { title: "마음이 머무는 속도", passages: [
        { content: "우리는 종종 책장을 넘긴 수로 독서를 기억한다. 그러나 오래 남는 것은 다 읽은 책의 권수가 아니라, 한동안 넘기지 못했던 어느 한 페이지다." },
        { content: "천천히 읽는다는 건 문장을 늦게 이해한다는 뜻이 아니다. 내 안에서 그 문장이 앉을 자리를 마련해 주는 일에 가깝다." },
        { content: "같은 문장을 읽고도 서로 다른 곳에 밑줄을 긋는 사람들과 함께라면, 한 권의 책은 여러 갈래의 길이 된다." }
      ]},
      { title: "서로의 여백", passages: [
        { content: "대화는 정답을 더하는 일이 아니라 여백을 건네는 일인지도 모른다. 상대가 자신의 생각을 놓을 수 있도록 조금 비워 두는 것." },
        { content: "좋은 질문은 문장의 끝에서 시작된다. 우리는 무엇을 읽었는지보다 어디에서 멈추었는지를 나누며 가까워진다." }
      ]}
    ]
  };

  const CLUBS = [
    {
      id: "slow", name: "느린 독서 생활", description: "직접 읽고 생각을 나눠봐요.", icon: "느", members: ["나", "소연", "민준", "해나"],
      bookIds: ["1984", "old-man-and-the-sea", "demian", "no-longer-human", "pride-and-prejudice"]
    },
    {
      id: "night", name: "밤의 책장", description: "하루 끝, 낯설고 선명한 이야기를 함께 읽어요.", icon: "밤", members: ["나", "유진", "정우"],
      bookIds: ["metamorphosis", "sherlock-holmes", "the-great-gatsby", "alice-in-wonderland", "jekyll-and-hyde"]
    }
  ];

  const PROFILE_IMAGES = {
    "나": "/images/avatars/me.jpg",
    "소연": "/images/avatars/soyeon.jpg",
    "민준": "/images/avatars/minjun.jpg",
    "해나": "/images/avatars/haena.jpg",
    "유진": "/images/avatars/yujin.jpg",
    "정우": "/images/avatars/jeongwoo.jpg"
  };

  const TUTORIAL_STEPS = [
    { symbol: "01", kicker: "마음 가는 책을 고르고", title: "원하는 책을 펼쳐보세요", description: "지금 읽고 싶은 책을 선택하면 곧바로 이야기를 시작할 수 있어요." },
    { symbol: "02", kicker: "문장에 머물고", title: "읽으며 내 생각을 남겨요", description: "마음에 남는 문단을 선택해, 그 순간 떠오른 생각을 여백에 기록해 보세요." },
    { symbol: "03", kicker: "서로의 시선을 만나고", title: "다른 사람의 생각도 발견해요", description: "같은 문장을 읽은 사람들의 생각을 확인하며, 혼자 읽을 때와는 다른 이야기를 만나보세요." }
  ];

  const WAITLIST_ERROR_MESSAGES = {
    INVALID_REQUEST: "입력한 이메일 주소를 다시 확인해 주세요.",
    PRE_REGISTRATION_ALREADY_EXISTS: "이미 사전신청한 이메일이에요. 여백이 출시되면 알려드릴게요.",
    RATE_LIMIT_EXCEEDED: "신청이 잠시 몰리고 있어요. 잠시 후 다시 시도해 주세요."
  };

  const analytics = window.yeobaekAnalytics || { track: () => false };

  function trackBehavior(category, name) {
    analytics.track(category, name, { oncePerSession: true });
  }

  function bookSelectionEventName(bookId) {
    const normalizedId = String(bookId)
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    return `Selected${normalizedId || "Unknown"}`;
  }

  const BOOK_COMMENT_SEEDS = {
    "1984": [
      "열세 시라는 한 단어만으로 세계가 낯설어졌어요.",
      "감시가 특별한 사건이 아니라 일상의 배경처럼 놓여 있어서 더 불편해요.",
      "윈스턴의 작은 선택들이 왜 이렇게 큰 저항처럼 느껴질까요.",
      "두려움이 행동뿐 아니라 생각까지 바꾼다는 점이 오래 남아요."
    ],
    "old-man-and-the-sea": [
      "노인의 눈만은 늙지 않았다는 묘사가 오래 남아요.",
      "소년과 노인의 믿음은 설명보다 행동에서 더 선명하게 보여요.",
      "바다를 이겨야 할 적이 아니라 함께 견뎌야 할 존재로 보는 시선이 인상적이에요.",
      "결과보다 끝까지 버틴 시간이 이 사람을 설명하는 것 같아요."
    ],
    demian: [
      "자기 자신에게 이르는 길이라는 문장이 책 전체의 문처럼 느껴져요.",
      "밝은 세계와 어두운 세계를 나누려는 마음이 오히려 더 불안하게 보여요.",
      "익숙한 기준을 의심하게 만드는 대화가 흥미로워요.",
      "성장한다는 건 자기 안의 목소리를 외면하지 않는 일일까요."
    ],
    "no-longer-human": [
      "사진을 바라보는 시선만으로 인물과 멀어지는 느낌이 들어요.",
      "웃음이 친밀함보다 자신을 숨기는 방법처럼 읽혀서 서늘해요.",
      "타인의 기대에 맞출수록 자기 모습은 더 흐려지는 것 같아요.",
      "고백처럼 들리지만 끝내 닿을 수 없는 거리감이 남아요."
    ],
    "pride-and-prejudice": [
      "첫 문장이 사회의 규칙을 농담처럼 드러내는 방식이 재치 있어요.",
      "첫인상이 얼마나 빠르게 판단으로 굳어지는지 보게 돼요.",
      "말보다 침묵과 오해가 관계를 더 크게 움직이는 것 같아요.",
      "상대가 아니라 자신의 시선을 고쳐 보는 과정처럼 읽혀요."
    ],
    metamorphosis: [
      "엄청난 변화보다 출근 걱정을 먼저 하는 모습이 더 충격적이에요.",
      "가족의 걱정과 필요가 뒤섞이는 순간이 불편하게 현실적이에요.",
      "방이라는 익숙한 공간이 점점 경계처럼 느껴져요.",
      "누가 괴물인지 쉽게 말할 수 없게 만드는 장면이에요."
    ],
    "sherlock-holmes": [
      "관찰한 사실과 해석을 구분하는 태도가 흥미로워요.",
      "사소해 보인 단서가 전혀 다른 이야기를 열어 가네요.",
      "홈즈의 확신보다 왓슨의 놀람을 따라갈 때 더 재미있어요.",
      "사건이 풀린 뒤에도 인물의 선택은 단순히 정리되지 않는 것 같아요."
    ],
    "the-great-gatsby": [
      "타인을 판단하지 말라는 충고가 앞으로의 시선을 미리 흔드는 것 같아요.",
      "화려한 풍경일수록 그 안의 고독이 더 선명하게 느껴져요.",
      "개츠비가 바라보는 빛은 희망과 집착 사이 어딘가에 있는 것 같아요.",
      "과거를 되돌리려는 마음이 현재를 얼마나 멀리 밀어내는지 생각하게 돼요."
    ],
    "alice-in-wonderland": [
      "아무렇지 않게 이상한 일을 따라가는 호기심이 이야기를 움직여요.",
      "몸의 크기가 바뀔 때마다 자신을 보는 기준도 흔들리는 것 같아요.",
      "논리가 무너진 세계인데도 이상하게 익숙한 규칙들이 보여요.",
      "질문을 멈추지 않는 태도가 앨리스를 계속 앞으로 데려가네요."
    ],
    "jekyll-and-hyde": [
      "단정한 겉모습과 낡은 문이 한 사람의 두 얼굴처럼 대비돼요.",
      "설명되지 않는 불쾌감이 단서보다 먼저 다가오는 장면이에요.",
      "선과 악을 나누려는 욕망 자체가 더 위험해 보이기 시작해요.",
      "숨기려 할수록 두 인격이 더 단단히 묶이는 역설이 느껴져요."
    ]
  };

  const COMMENT_POSITIONS = [
    { chapterIndex: 0, ratio: 0 },
    { chapterIndex: 0, ratio: 0.58 },
    { chapterIndex: 1, ratio: 0.32 },
    { chapterIndex: 1, ratio: 0.78 }
  ];

  function seedComments(book) {
    const seeded = Object.fromEntries(CLUBS.map((club) => [club.id, {}]));
    const club = CLUBS.find((item) => item.bookIds.includes(book.id));
    const contents = BOOK_COMMENT_SEEDS[book.id];
    if (!club || !contents) return seeded;

    const authors = club.members.filter((name) => name !== "나");
    COMMENT_POSITIONS.forEach(({ chapterIndex, ratio }, index) => {
      const passages = book.chapters[chapterIndex]?.passages || [];
      if (!passages.length || !contents[index]) return;
      const passageIndex = Math.round((passages.length - 1) * ratio);
      const key = `${chapterIndex}:${passageIndex}`;
      seeded[club.id][key] = [{
        id: `seed-${book.id}-${chapterIndex}-${passageIndex}`,
        author: authors[index % authors.length] || "함께 읽는 사람",
        content: contents[index],
        mine: false
      }];
    });
    return seeded;
  }

  function booksForClub(club, books) {
    const curatedBooks = books.filter((book) => club.bookIds.includes(book.id));
    if (curatedBooks.length) return curatedBooks;
    return books.filter((book) => book.id === "fallback");
  }

  const initialState = (books = []) => {
    const selectedBookByClub = Object.fromEntries(CLUBS.map((club) => [
      club.id,
      booksForClub(club, books)[0]?.id || ""
    ]));
    const book = books.find((item) => item.id === selectedBookByClub[CLUBS[0].id]) || books[0] || null;
    const bookId = book?.id || "";
    const progressByBook = {};
    CLUBS.forEach((club, index) => {
      const selectedBookId = selectedBookByClub[club.id];
      if (!selectedBookId) return;
      if (!progressByBook[selectedBookId]) progressByBook[selectedBookId] = Object.fromEntries(CLUBS.map((item) => [item.id, 0]));
      progressByBook[selectedBookId][club.id] = index === 0 ? 34 : 12;
    });
    return {
      books,
      book,
      bookId,
      clubId: CLUBS[0].id,
      selectedBookByClub,
      view: "home",
      chapterIndex: 0,
      selectedPassage: null,
      progressByBook,
      fontSize: 19,
      comments: Object.fromEntries(books.map((item) => [item.id, seedComments(item)])),
      editingId: null,
      nextCommentId: 1,
      panelOpen: false
    };
  };

  let state = initialState();
  let toastTimer;
  let progressFrame;
  let tutorialOpen = false;
  let waitlistOpen = false;
  let waitlistReturnFocus = null;
  let waitlistRequestController = null;
  let waitlistRequestToken = 0;
  let tutorialStep = 0;

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    app: $("#app"), topbar: $(".topbar"), loading: $("#loading"), home: $("#home-view"), reader: $("#reader-view"),
    clubList: $("#club-list"), clubKicker: $("#club-kicker"), clubTitle: $("#club-title"),
    clubDescription: $("#club-description"), memberStack: $("#member-stack"), bookCover: $("#book-cover"),
    bookTitle: $("#book-title"), bookMeta: $("#book-meta"), bookCatalog: $("#book-catalog"), bookCount: $("#book-count"), homeProgressText: $("#home-progress-text"),
    homeProgressBar: $("#home-progress-bar"), activityList: $("#activity-list"), readerCover: $("#reader-cover"),
    readerBookTitle: $("#reader-book-title"), readerBookAuthor: $("#reader-book-author"), chapterList: $("#chapter-list"),
    chapterNumber: $("#chapter-number"), chapterTitle: $("#chapter-title"), passageList: $("#passage-list"),
    mobileChapter: $("#mobile-chapter"),
    progress: $("#reading-progress"), progressBar: $("#reading-progress-bar"), progressText: $("#reader-progress-text"), bookPage: $(".book-page"), commentPanel: $("#comment-panel"),
    scrim: $("#panel-scrim"), selectedPassage: $("#selected-passage"), commentList: $("#comment-list"),
    form: $("#comment-form"), input: $("#comment-input"), count: $("#comment-count"), submit: $("#submit-comment"),
    cancelEdit: $("#cancel-edit"), tutorialBackdrop: $("#tutorial-backdrop"), tutorialDialog: $("#tutorial-dialog"), tutorialSkip: $("#tutorial-skip"),
    tutorialSymbol: $("#tutorial-symbol"), tutorialKicker: $("#tutorial-kicker"), tutorialTitle: $("#tutorial-title"),
    tutorialDescription: $("#tutorial-description"), tutorialStatus: $("#tutorial-step-status"), tutorialDots: $("#tutorial-dots"),
    tutorialPrevious: $("#tutorial-previous"), tutorialNext: $("#tutorial-next"),
    waitlistBackdrop: $("#waitlist-backdrop"), waitlistDialog: $("#waitlist-dialog"), waitlistForm: $("#waitlist-form"),
    waitlistEmail: $("#waitlist-email"), waitlistPrivacyConsent: $("#waitlist-privacy-consent"),
    waitlistSubmit: $("#waitlist-submit"), waitlistStatus: $("#waitlist-status"),
    waitlistSuccess: $("#waitlist-success"), toast: $("#toast")
  };

  function normalizeBook(raw, bookId = "demo-book") {
    if (!raw || typeof raw !== "object") throw new Error("도서 데이터가 객체가 아닙니다.");
    let chapters = Array.isArray(raw.chapters) ? raw.chapters.map((chapter, chapterIndex) => {
      const sourcePassages = Array.isArray(chapter?.passages) ? chapter.passages : [];
      const passages = sourcePassages.map((passage) => {
        const content = typeof passage === "string" ? passage : passage?.content;
        return typeof content === "string" ? content.trim() : "";
      }).filter(Boolean).map((content, passageIndex) => ({ id: `${chapterIndex}:${passageIndex}`, content }));
      return { id: `chapter-${chapterIndex}`, title: String(chapter?.title || `${chapterIndex + 1}장`), passages };
    }).filter((chapter) => chapter.passages.length) : [];

    if (!chapters.length) throw new Error("읽을 수 있는 문단이 없습니다.");
    if (chapters.length === 1) {
      const source = chapters[0];
      if (source.passages.length < 2) throw new Error("두 개의 읽기 구간을 만들 문단이 부족합니다.");
      const midpoint = Math.ceil(source.passages.length / 2);
      chapters = [
        { id: "chapter-0", title: `${source.title} · 전반부`, passages: source.passages.slice(0, midpoint).map((passage, index) => ({ ...passage, id: `0:${index}` })) },
        { id: "chapter-1", title: `${source.title} · 후반부`, passages: source.passages.slice(midpoint).map((passage, index) => ({ ...passage, id: `1:${index}` })) }
      ];
    } else {
      chapters = chapters.slice(0, 2);
    }
    const authors = Array.isArray(raw.authors) ? raw.authors.map((author) => {
      if (typeof author === "string") return author.trim();
      if (typeof author?.name === "string") return author.name.trim();
      if (typeof author?.displayName === "string") return author.displayName.trim();
      return Number.isInteger(author?.authorId) ? `등록 작가 #${author.authorId}` : "";
    }).filter(Boolean) : [];
    return {
      id: bookId,
      title: String(raw.title || "제목 없는 책"),
      publisher: String(raw.publisher || "출판사 미상"),
      publishedYear: raw.publishedYear ? String(raw.publishedYear) : "",
      authors: authors.length ? authors : ["작자 미상"],
      cover: bookId === "fallback" ? "" : `/images/covers/${encodeURIComponent(bookId)}.png`,
      chapters
    };
  }

  function makeButton(className, text, action, dataset = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    button.dataset.action = action;
    Object.entries(dataset).forEach(([key, value]) => { button.dataset[key] = value; });
    return button;
  }

  function createAvatar(name, className, { decorative = false } = {}) {
    const avatar = document.createElement("span");
    avatar.className = className;
    avatar.textContent = name.slice(0, 1);
    if (decorative) {
      avatar.setAttribute("aria-hidden", "true");
    } else {
      avatar.setAttribute("role", "img");
      avatar.setAttribute("aria-label", `${name} 프로필 사진`);
      avatar.title = name;
    }

    const imageSrc = PROFILE_IMAGES[name];
    if (!imageSrc) return avatar;

    const image = document.createElement("img");
    image.src = imageSrc;
    image.alt = "";
    image.decoding = "async";
    image.addEventListener("error", () => image.remove(), { once: true });
    avatar.append(image);
    return avatar;
  }

  function renderBookCover(container, book, { lazy = false } = {}) {
    container.replaceChildren();
    container.classList.remove("has-image");
    if (!book.cover) {
      container.textContent = book.title;
      return;
    }

    const image = document.createElement("img");
    image.src = book.cover;
    image.alt = "";
    image.decoding = "async";
    image.loading = lazy ? "lazy" : "eager";
    image.addEventListener("error", () => {
      container.classList.remove("has-image");
      container.textContent = book.title;
    }, { once: true });
    container.classList.add("has-image");
    container.append(image);
  }

  function commentKey(chapterIndex = state.chapterIndex, passageIndex = state.selectedPassage) {
    return `${chapterIndex}:${passageIndex}`;
  }

  function commentsFor(chapterIndex, passageIndex) {
    return state.comments[state.bookId]?.[state.clubId]?.[commentKey(chapterIndex, passageIndex)] || [];
  }

  function ensureBookInteractionState(bookId = state.bookId) {
    if (!state.progressByBook[bookId]) state.progressByBook[bookId] = Object.fromEntries(CLUBS.map((club) => [club.id, 0]));
    if (!state.comments[bookId]) state.comments[bookId] = Object.fromEntries(CLUBS.map((club) => [club.id, {}]));
  }

  function activeClub() {
    return CLUBS.find((club) => club.id === state.clubId) || CLUBS[0];
  }

  function availableBooksForClub() {
    return booksForClub(activeClub(), state.books);
  }

  function activateBook(bookId) {
    const book = availableBooksForClub().find((item) => item.id === bookId);
    if (!book) return false;
    state.bookId = book.id;
    state.book = book;
    state.selectedBookByClub[state.clubId] = book.id;
    state.chapterIndex = 0;
    state.selectedPassage = null;
    state.panelOpen = false;
    ensureBookInteractionState();
    return true;
  }

  function reconcileDemoComments() {
    Object.entries(state.comments).forEach(([bookId, commentsByClub]) => {
      const book = state.books.find((item) => item.id === bookId);
      if (!book) {
        delete state.comments[bookId];
        return;
      }
      const passageExists = (key) => {
        const [chapterIndex, passageIndex] = key.split(":").map(Number);
        return Boolean(book.chapters[chapterIndex]?.passages[passageIndex]);
      };
      Object.keys(commentsByClub).forEach((clubId) => {
        commentsByClub[clubId] = Object.fromEntries(
          Object.entries(commentsByClub[clubId]).filter(([key]) => passageExists(key))
        );
      });
    });
  }

  function currentProgress() {
    return state.progressByBook[state.bookId]?.[state.clubId] || 0;
  }

  function renderReadingProgress() {
    const progress = currentProgress();
    elements.progressText.textContent = `${progress}%`;
    elements.progressBar.style.width = `${progress}%`;
    elements.progress.setAttribute("aria-valuenow", String(progress));
    elements.progress.setAttribute("aria-valuetext", `독서 진행률 ${progress}퍼센트`);
  }

  function updateReadingProgressFromScroll() {
    progressFrame = null;
    if (state.view !== "reader" || !state.book?.chapters.length) return;
    const pageRect = elements.bookPage.getBoundingClientRect();
    const pageTop = window.scrollY + pageRect.top;
    const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const chapterStartY = Math.min(pageTop, maxScrollY);
    const readableDistance = maxScrollY - chapterStartY;
    const isLastChapter = state.chapterIndex === state.book.chapters.length - 1;
    let chapterProgress = readableDistance > 1
      ? Math.min(1, Math.max(0, (window.scrollY - chapterStartY) / readableDistance))
      : (isLastChapter ? 1 : 0);
    if (readableDistance > 1 && window.scrollY >= maxScrollY - 2) chapterProgress = 1;
    const estimatedProgress = Math.round(((state.chapterIndex + chapterProgress) / state.book.chapters.length) * 100);
    if (estimatedProgress <= currentProgress()) return;
    ensureBookInteractionState();
    state.progressByBook[state.bookId][state.clubId] = estimatedProgress;
    renderReadingProgress();
  }

  function scheduleReadingProgressUpdate() {
    if (progressFrame) return;
    progressFrame = requestAnimationFrame(updateReadingProgressFromScroll);
  }

  function scrollToChapterStart() {
    window.scrollTo({ top: 0, behavior: "auto" });
    requestAnimationFrame(scheduleReadingProgressUpdate);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
  }

  function renderTutorial() {
    const step = TUTORIAL_STEPS[tutorialStep];
    elements.tutorialDialog.dataset.step = String(tutorialStep);
    elements.tutorialSymbol.textContent = step.symbol;
    elements.tutorialKicker.textContent = step.kicker;
    elements.tutorialTitle.textContent = step.title;
    elements.tutorialDescription.textContent = step.description;
    elements.tutorialStatus.textContent = `${tutorialStep + 1} / ${TUTORIAL_STEPS.length}`;
    elements.tutorialPrevious.hidden = tutorialStep === 0;
    elements.tutorialNext.textContent = tutorialStep === TUTORIAL_STEPS.length - 1 ? "책 골라보기" : "다음";
    elements.tutorialDots.replaceChildren(...TUTORIAL_STEPS.map((_, index) => {
      const dot = document.createElement("span");
      dot.className = `tutorial-dot${index === tutorialStep ? " is-current" : ""}`;
      return dot;
    }));
  }

  function openTutorial() {
    if (waitlistOpen || tutorialOpen) return;
    tutorialOpen = true;
    tutorialStep = 0;
    renderTutorial();
    elements.tutorialBackdrop.hidden = false;
    syncPageInteractionState();
    requestAnimationFrame(() => elements.tutorialSkip.focus());
  }

  function closeTutorial() {
    tutorialOpen = false;
    elements.tutorialBackdrop.hidden = true;
    syncPageInteractionState();
    requestAnimationFrame(() => document.querySelector('.book-choice[aria-current="true"]')?.focus());
  }

  function syncPageInteractionState() {
    const modalOpen = tutorialOpen || waitlistOpen;
    [elements.topbar, elements.home, elements.reader].forEach((element) => {
      if (modalOpen) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
    });
    const compactCommentsOpen = state.panelOpen && matchMedia("(max-width: 1000px)").matches;
    document.body.style.overflow = modalOpen || compactCommentsOpen ? "hidden" : "";
  }

  function invalidateWaitlistRequest() {
    waitlistRequestToken += 1;
    waitlistRequestController?.abort();
    waitlistRequestController = null;
  }

  function resetWaitlistForm() {
    invalidateWaitlistRequest();
    elements.waitlistForm.reset();
    elements.waitlistForm.hidden = false;
    elements.waitlistSuccess.hidden = true;
    elements.waitlistEmail.removeAttribute("aria-invalid");
    elements.waitlistPrivacyConsent.removeAttribute("aria-invalid");
    elements.waitlistStatus.textContent = "";
    elements.waitlistSubmit.disabled = false;
    elements.waitlistSubmit.textContent = "사전신청하기";
  }

  function openWaitlist(trigger) {
    if (tutorialOpen || waitlistOpen) return;
    if (state.panelOpen) {
      state.panelOpen = false;
      document.querySelector('.passage[aria-pressed="true"]')?.setAttribute("aria-expanded", "false");
      updatePanel();
    }
    waitlistOpen = true;
    trackBehavior("Funnel", "WaitlistOpened");
    waitlistReturnFocus = trigger || document.activeElement;
    resetWaitlistForm();
    elements.waitlistBackdrop.hidden = false;
    syncPageInteractionState();
    requestAnimationFrame(() => elements.waitlistEmail.focus());
  }

  function closeWaitlist() {
    if (!waitlistOpen) return;
    invalidateWaitlistRequest();
    waitlistOpen = false;
    elements.waitlistBackdrop.hidden = true;
    syncPageInteractionState();
    const returnFocus = waitlistReturnFocus;
    waitlistReturnFocus = null;
    requestAnimationFrame(() => returnFocus?.focus());
  }

  function trapFocus(event, dialog) {
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll("button:not([disabled]):not([hidden]), input:not([disabled]):not([hidden]), summary, a[href], [tabindex]:not([tabindex='-1'])")]
      .filter((element) => !element.closest("[hidden]"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!focusable.includes(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function moveTutorial(direction) {
    const nextStep = tutorialStep + direction;
    if (nextStep >= TUTORIAL_STEPS.length) {
      closeTutorial();
      return;
    }
    tutorialStep = Math.max(0, nextStep);
    renderTutorial();
    requestAnimationFrame(() => elements.tutorialTitle.focus?.());
  }

  function renderHome() {
    const club = activeClub();
    elements.clubList.replaceChildren(...CLUBS.map((item) => {
      const button = makeButton("club-button", "", "select-club", { clubId: item.id });
      button.setAttribute("aria-current", String(item.id === state.clubId));
      const icon = document.createElement("span");
      icon.className = "club-icon";
      icon.setAttribute("aria-hidden", "true");
      const selectedBook = state.books.find((book) => book.id === state.selectedBookByClub[item.id]);
      if (selectedBook) renderBookCover(icon, selectedBook, { lazy: true });
      else icon.textContent = item.icon;
      const copy = document.createElement("span"); copy.className = "club-copy";
      const strong = document.createElement("strong"); strong.textContent = item.name;
      const detail = document.createElement("span"); detail.textContent = `${item.members.length}명이 함께 읽는 중`;
      copy.append(strong, detail); button.append(icon, copy); return button;
    }));
    elements.clubKicker.textContent = `${club.members.length}명의 작은 독서 모임`;
    elements.clubTitle.textContent = club.name;
    elements.clubDescription.textContent = club.description;
    elements.memberStack.replaceChildren(...club.members.map((name) => {
      return createAvatar(name, "member-avatar");
    }));
    renderBookCover(elements.bookCover, state.book);
    elements.bookTitle.textContent = state.book.title;
    elements.bookMeta.textContent = `${state.book.authors.join(", ")} · ${state.book.publisher}${state.book.publishedYear ? ` · ${state.book.publishedYear}` : ""}`;
    elements.homeProgressText.textContent = `${currentProgress()}%`;
    elements.homeProgressBar.style.width = `${currentProgress()}%`;
    renderBookCatalog();
    renderActivities();
  }

  function renderBookCatalog() {
    const books = availableBooksForClub();
    elements.bookCount.textContent = `${books.length}권 · ${activeClub().name}의 서재`;
    elements.bookCatalog.replaceChildren(...books.map((book) => {
      const button = makeButton("book-choice", "", "select-book", { bookId: book.id });
      button.setAttribute("aria-current", String(book.id === state.bookId));
      button.setAttribute("aria-label", `${book.title}, ${book.authors.join(", ")} 선택`);
      const cover = document.createElement("span"); cover.className = "book-choice-cover"; renderBookCover(cover, book, { lazy: true });
      const title = document.createElement("strong"); title.textContent = book.title;
      const author = document.createElement("span"); author.textContent = book.authors.join(", ");
      button.append(cover, title, author);
      return button;
    }));
  }

  function renderActivities() {
    const activities = Object.entries(state.comments[state.bookId]?.[state.clubId] || {})
      .flatMap(([key, comments]) => comments.map((comment) => ({ key, comment }))).slice(0, 4);
    elements.activityList.replaceChildren(...activities.map(({ key, comment }) => {
      const [chapterIndex, passageIndex] = key.split(":").map(Number);
      const passage = state.book.chapters[chapterIndex]?.passages[passageIndex];
      const button = makeButton("activity-card", "", "open-activity", { chapterIndex, passageIndex, commentId: comment.id });
      const quote = document.createElement("blockquote"); quote.textContent = passage?.content || "함께 읽은 문장";
      const meta = document.createElement("div"); meta.className = "activity-meta";
      const author = document.createElement("span"); author.textContent = `${comment.author}의 댓글`;
      const chapter = document.createElement("span"); chapter.textContent = state.book.chapters[chapterIndex]?.title || "";
      meta.append(author, chapter); button.append(quote, meta); return button;
    }));
  }

  function renderReader() {
    const chapter = state.book.chapters[state.chapterIndex];
    renderBookCover(elements.readerCover, state.book);
    elements.readerBookTitle.textContent = state.book.title;
    elements.readerBookAuthor.textContent = state.book.authors.join(", ");
    elements.chapterList.replaceChildren(...state.book.chapters.map((item, index) => {
      const button = makeButton("chapter-button", "", "select-chapter", { chapterIndex: index });
      button.setAttribute("aria-current", String(index === state.chapterIndex));
      const number = document.createElement("span"); number.className = "chapter-number"; number.textContent = String(index + 1).padStart(2, "0");
      const title = document.createElement("span"); title.textContent = item.title;
      button.append(number, title); return button;
    }));
    elements.mobileChapter.replaceChildren(...state.book.chapters.map((item, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${index + 1}. ${item.title}`;
      option.selected = index === state.chapterIndex;
      return option;
    }));
    elements.chapterNumber.textContent = `${state.chapterIndex + 1}장`;
    elements.chapterTitle.textContent = chapter.title;
    elements.passageList.replaceChildren(...chapter.passages.map((passage, index) => {
      const count = commentsFor(state.chapterIndex, index).length;
      const button = makeButton(`passage${count ? " has-comments" : ""}`, passage.content, "select-passage", { passageIndex: index });
      button.id = `passage-${passage.id}`;
      button.setAttribute("aria-pressed", String(index === state.selectedPassage));
      button.setAttribute("aria-controls", "comment-panel");
      button.setAttribute("aria-expanded", String(index === state.selectedPassage && state.panelOpen));
      if (count) {
        const badge = document.createElement("span"); badge.className = "passage-badge"; badge.textContent = `${count}`; badge.setAttribute("aria-label", `댓글 ${count}개`); button.append(badge);
      }
      return button;
    }));
    renderReadingProgress();
    document.documentElement.style.setProperty("--reader-size", `${state.fontSize}px`);
    renderComments();
  }

  function renderComments() {
    const selected = Number.isInteger(state.selectedPassage);
    const passage = selected ? state.book.chapters[state.chapterIndex].passages[state.selectedPassage] : null;
    const comments = selected ? commentsFor(state.chapterIndex, state.selectedPassage) : [];
    elements.commentPanel.setAttribute("aria-hidden", String(!selected));
    elements.selectedPassage.textContent = passage?.content || "";
    elements.commentList.replaceChildren();
    if (!selected) {
      const empty = document.createElement("p"); empty.className = "comment-empty"; empty.textContent = "본문의 문단을 선택하면 이곳에서 댓글을 확인하고 남길 수 있어요."; elements.commentList.append(empty);
    } else if (!comments.length) {
      const empty = document.createElement("p"); empty.className = "comment-empty"; empty.textContent = "아직 댓글이 없어요. 이 문장에 첫 생각을 남겨 보세요."; elements.commentList.append(empty);
    } else {
      comments.forEach((comment) => {
        const article = document.createElement("article"); article.className = "comment"; article.dataset.commentId = comment.id;
        const top = document.createElement("div"); top.className = "comment-top";
        const author = document.createElement("div"); author.className = "comment-author";
        const avatar = createAvatar(comment.mine ? "나" : comment.author, "tiny-avatar", { decorative: true });
        const name = document.createElement("span"); name.textContent = comment.mine ? "나" : comment.author; author.append(avatar, name); top.append(author);
        if (comment.mine) {
          const actions = document.createElement("div"); actions.className = "comment-actions";
          actions.append(makeButton("", "수정", "edit-comment", { commentId: comment.id }), makeButton("", "삭제", "delete-comment", { commentId: comment.id })); top.append(actions);
        }
        const body = document.createElement("p"); body.textContent = comment.content; article.append(top, body); elements.commentList.append(article);
      });
    }
    elements.form.hidden = !selected;
  }

  function renderView() {
    const isHome = state.view === "home";
    elements.app.dataset.view = state.view;
    elements.home.hidden = !isHome;
    elements.reader.hidden = isHome;
    if (isHome) renderHome(); else renderReader();
  }

  function revealActivity(passageIndex, commentId) {
    const passage = document.querySelector(`[data-action="select-passage"][data-passage-index="${passageIndex}"]`);
    if (!passage) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    passage.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
    passage.focus({ preventScroll: true });

    const comment = [...elements.commentList.querySelectorAll(".comment")]
      .find((item) => item.dataset.commentId === commentId);
    if (!comment) return;
    comment.classList.add("is-targeted");
    elements.commentList.scrollTop = Math.max(0, comment.offsetTop - elements.commentList.clientHeight / 3);
    window.setTimeout(() => comment.classList.remove("is-targeted"), reducedMotion ? 0 : 1800);
  }

  function openReader(chapterIndex = state.chapterIndex, passageIndex = null, commentId = null) {
    trackBehavior("Funnel", "ReadingStarted");
    if (Number.isInteger(passageIndex) && commentsFor(chapterIndex, passageIndex).length) {
      trackBehavior("Funnel", "CommentViewed");
    }
    state.view = "reader";
    state.chapterIndex = chapterIndex;
    state.selectedPassage = Number.isInteger(passageIndex) ? passageIndex : null;
    state.panelOpen = Number.isInteger(passageIndex);
    renderView();
    updatePanel();
    if (Number.isInteger(passageIndex)) {
      requestAnimationFrame(() => requestAnimationFrame(() => revealActivity(passageIndex, commentId)));
    } else {
      setTimeout(() => elements.chapterTitle.focus(), 0);
      const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    }
  }

  function updatePanel() {
    const compact = matchMedia("(max-width: 1000px)").matches;
    const panelVisible = Number.isInteger(state.selectedPassage) && (!compact || state.panelOpen);
    elements.commentPanel.classList.toggle("is-open", state.panelOpen);
    elements.commentPanel.setAttribute("aria-hidden", String(!panelVisible));
    if (compact && !panelVisible) elements.commentPanel.setAttribute("inert", "");
    else elements.commentPanel.removeAttribute("inert");
    if (compact) {
      elements.commentPanel.setAttribute("role", "dialog");
      elements.commentPanel.setAttribute("aria-modal", "true");
    } else {
      elements.commentPanel.removeAttribute("role");
      elements.commentPanel.removeAttribute("aria-modal");
    }
    elements.scrim.classList.toggle("is-open", state.panelOpen);
    syncPageInteractionState();
  }

  function closeComments() {
    state.panelOpen = false;
    const passage = document.querySelector('.passage[aria-pressed="true"]');
    updatePanel();
    passage?.setAttribute("aria-expanded", "false");
    if (passage) requestAnimationFrame(() => passage.focus({ preventScroll: true }));
  }

  function resetForm() {
    state.editingId = null;
    elements.input.value = "";
    elements.cancelEdit.hidden = true;
    elements.submit.textContent = "댓글 남기기";
    updateFormState();
  }

  function updateFormState() {
    const length = elements.input.value.length;
    elements.count.textContent = `${length} / 1000`;
    elements.submit.disabled = !elements.input.value.trim() || length > 1000;
  }

  function resetDemo() {
    const books = state.books;
    state = initialState(books);
    reconcileDemoComments();
    resetForm();
    updatePanel();
    renderView();
    showToast("데모를 처음 상태로 되돌렸어요.");
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "open-instagram") { trackBehavior("Funnel", "InstagramOpened"); return; }
    if (action === "open-waitlist") { openWaitlist(target); return; }
    if (action === "close-waitlist") { closeWaitlist(); return; }
    if (action === "tutorial-close") { closeTutorial(); return; }
    if (action === "tutorial-previous") { moveTutorial(-1); return; }
    if (action === "tutorial-next") { moveTutorial(1); return; }
    if (action === "go-home") { state.view = "home"; state.panelOpen = false; resetForm(); updatePanel(); renderView(); }
    if (action === "reset-demo") resetDemo();
    if (action === "select-club") {
      const club = CLUBS.find((item) => item.id === target.dataset.clubId);
      if (club && club.id !== state.clubId) {
        state.clubId = club.id;
        activateBook(state.selectedBookByClub[club.id]);
        resetForm(); updatePanel(); renderHome();
        requestAnimationFrame(() => document.querySelector(`[data-action="select-club"][data-club-id="${club.id}"]`)?.focus());
      }
      return;
    }
    if (action === "select-book") {
      const nextBookId = target.dataset.bookId;
      if (nextBookId !== state.bookId && activateBook(nextBookId)) {
        trackBehavior("Book", bookSelectionEventName(nextBookId));
        resetForm(); updatePanel(); renderHome(); showToast(`『${state.book.title}』을 펼쳤어요.`);
        requestAnimationFrame(() => document.querySelector(`[data-action="select-book"][data-book-id="${state.bookId}"]`)?.focus());
      }
      return;
    }
    if (action === "start-reading") openReader();
    if (action === "open-activity") openReader(Number(target.dataset.chapterIndex), Number(target.dataset.passageIndex), target.dataset.commentId);
    if (action === "select-chapter") {
      state.chapterIndex = Number(target.dataset.chapterIndex); state.selectedPassage = null; state.panelOpen = false;
      resetForm(); updatePanel(); renderReader(); scrollToChapterStart(); setTimeout(() => elements.chapterTitle.focus(), 0);
    }
    if (action === "select-passage") {
      state.selectedPassage = Number(target.dataset.passageIndex); state.panelOpen = true; resetForm(); renderReader(); updatePanel();
      if (commentsFor(state.chapterIndex, state.selectedPassage).length) trackBehavior("Funnel", "CommentViewed");
      if (matchMedia("(max-width: 1000px)").matches) setTimeout(() => elements.input.focus(), 230);
    }
    if (action === "close-comments") closeComments();
    if (action === "font-decrease") { state.fontSize = Math.max(17, state.fontSize - 1); renderReader(); showToast(`본문 글자 크기 ${state.fontSize}px`); }
    if (action === "font-increase") { state.fontSize = Math.min(23, state.fontSize + 1); renderReader(); showToast(`본문 글자 크기 ${state.fontSize}px`); }
    if (action === "cancel-edit") resetForm();
    if (action === "edit-comment") {
      const comment = commentsFor(state.chapterIndex, state.selectedPassage).find((item) => item.id === target.dataset.commentId && item.mine);
      if (comment) { state.editingId = comment.id; elements.input.value = comment.content; elements.cancelEdit.hidden = false; elements.submit.textContent = "수정 완료"; updateFormState(); elements.input.focus(); }
    }
    if (action === "delete-comment") {
      const key = commentKey();
      state.comments[state.bookId][state.clubId][key] = commentsFor(state.chapterIndex, state.selectedPassage)
        .filter((item) => !(item.id === target.dataset.commentId && item.mine));
      resetForm(); renderReader(); showToast("내 댓글을 삭제했어요.");
    }
  });

  elements.mobileChapter.addEventListener("change", () => {
    state.chapterIndex = Number(elements.mobileChapter.value);
    state.selectedPassage = null;
    state.panelOpen = false;
    resetForm();
    updatePanel();
    renderReader();
    scrollToChapterStart();
    setTimeout(() => elements.chapterTitle.focus(), 0);
  });
  elements.input.addEventListener("input", updateFormState);
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const content = elements.input.value.trim();
    if (!content || content.length > 1000 || !Number.isInteger(state.selectedPassage)) return;
    const key = commentKey();
    const comments = [...commentsFor(state.chapterIndex, state.selectedPassage)];
    if (state.editingId) {
      const index = comments.findIndex((comment) => comment.id === state.editingId && comment.mine);
      if (index >= 0) comments[index] = { ...comments[index], content };
    } else {
      comments.push({ id: `mine-${state.nextCommentId++}`, author: "나", content, mine: true });
      trackBehavior("Funnel", "CommentWritten");
    }
    ensureBookInteractionState();
    state.comments[state.bookId][state.clubId][key] = comments;
    const message = state.editingId ? "내 댓글을 수정했어요." : "문장 곁에 내 생각을 남겼어요.";
    resetForm(); renderReader(); showToast(message);
  });

  elements.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      elements.form.requestSubmit();
    }
  });

  elements.waitlistBackdrop.addEventListener("click", (event) => {
    if (event.target === elements.waitlistBackdrop) closeWaitlist();
  });

  elements.waitlistEmail.addEventListener("input", () => {
    elements.waitlistEmail.removeAttribute("aria-invalid");
    elements.waitlistStatus.textContent = "";
  });

  elements.waitlistPrivacyConsent.addEventListener("change", () => {
    elements.waitlistPrivacyConsent.removeAttribute("aria-invalid");
    elements.waitlistStatus.textContent = "";
  });

  elements.waitlistForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (waitlistRequestController) return;
    elements.waitlistStatus.textContent = "";
    if (!elements.waitlistEmail.checkValidity()) {
      elements.waitlistEmail.setAttribute("aria-invalid", "true");
      elements.waitlistStatus.textContent = "올바른 이메일 주소를 입력해 주세요.";
      elements.waitlistEmail.focus();
      return;
    }
    if (!elements.waitlistPrivacyConsent.checked) {
      elements.waitlistPrivacyConsent.setAttribute("aria-invalid", "true");
      elements.waitlistStatus.textContent = "필수 동의 항목을 확인해 주세요.";
      elements.waitlistPrivacyConsent.focus();
      return;
    }

    const endpoint = document.querySelector('meta[name="waitlist-endpoint"]')?.content.trim();
    if (!endpoint) {
      elements.waitlistStatus.textContent = "사전신청 접수 연결을 준비 중이에요.";
      return;
    }

    elements.waitlistSubmit.disabled = true;
    elements.waitlistSubmit.textContent = "전송 중…";
    const requestToken = ++waitlistRequestToken;
    const controller = new AbortController();
    waitlistRequestController = controller;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: elements.waitlistEmail.value.trim().toLowerCase()
        }),
        signal: controller.signal
      });
      if (requestToken !== waitlistRequestToken || !waitlistOpen) return;
      if (!response.ok) {
        let errorCode = "";
        try {
          errorCode = String((await response.json())?.code || "");
        } catch {
          errorCode = `HTTP_${response.status}`;
        }
        throw new Error(errorCode || `HTTP_${response.status}`);
      }
      elements.waitlistForm.hidden = true;
      elements.waitlistSuccess.hidden = false;
      requestAnimationFrame(() => elements.waitlistSuccess.querySelector("button")?.focus());
    } catch (error) {
      if (requestToken !== waitlistRequestToken || error.name === "AbortError" || !waitlistOpen) return;
      console.error("사전신청 전송에 실패했습니다.", error);
      elements.waitlistStatus.textContent = WAITLIST_ERROR_MESSAGES[error.message]
        || "전송하지 못했어요. 잠시 후 다시 시도해 주세요.";
      elements.waitlistSubmit.disabled = false;
      elements.waitlistSubmit.textContent = "다시 시도하기";
    } finally {
      if (requestToken === waitlistRequestToken) waitlistRequestController = null;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (waitlistOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeWaitlist();
        return;
      }
      trapFocus(event, elements.waitlistDialog);
      return;
    }
    if (tutorialOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeTutorial();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...elements.tutorialDialog.querySelectorAll("button:not([disabled]):not([hidden]), [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!focusable.includes(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.key === "Escape" && state.panelOpen) {
      closeComments();
      return;
    }
    if (event.key !== "Tab" || !state.panelOpen || !matchMedia("(max-width: 1000px)").matches) return;
    const focusable = [...elements.commentPanel.querySelectorAll("button:not([disabled]), textarea:not([disabled])")]
      .filter((element) => !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("scroll", scheduleReadingProgressUpdate, { passive: true });
  window.addEventListener("resize", () => {
    updatePanel();
    scheduleReadingProgressUpdate();
  });

  async function initialize() {
    let usedFallback = false;
    let books;
    try {
      const catalogResponse = await fetch("/data/books/catalog.json", { cache: "no-store" });
      if (!catalogResponse.ok) throw new Error(`도서 목록 요청 실패: HTTP ${catalogResponse.status}`);
      const catalog = await catalogResponse.json();
      if (!Array.isArray(catalog) || !catalog.length) throw new Error("도서 목록이 비어 있습니다.");
      books = await Promise.all(catalog.map(async (entry) => {
        if (!entry?.id || !entry?.file) throw new Error("도서 목록 항목이 올바르지 않습니다.");
        const response = await fetch(`/data/books/${encodeURIComponent(entry.file)}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`${entry.file} 요청 실패: HTTP ${response.status}`);
        return normalizeBook(await response.json(), String(entry.id));
      }));
      const incompleteClub = CLUBS.find((club) => booksForClub(club, books).length === 0);
      if (incompleteClub) throw new Error(`${incompleteClub.name}의 도서 목록이 비어 있습니다.`);
    } catch (error) {
      if (error instanceof TypeError) {
        console.warn("도서 JSON 요청이 불가능해 내장 샘플을 사용합니다.", error);
        books = [normalizeBook(FALLBACK_BOOK, "fallback")];
        usedFallback = true;
      } else {
        console.error("도서 JSON을 읽을 수 없습니다.", error);
        elements.loading.textContent = "도서 JSON을 읽을 수 없습니다. 인제스트 형식과 UTF-8 인코딩을 확인해 주세요.";
        elements.loading.classList.add("is-error");
        return;
      }
    }
    state = initialState(books);
    reconcileDemoComments();
    elements.loading.hidden = true;
    renderView();
    requestAnimationFrame(() => {
      if (!waitlistOpen && !tutorialOpen) openTutorial();
    });
    if (usedFallback) showToast("도서 파일을 불러오지 못해 내장 샘플로 시작했어요.");
  }

  initialize();
})();
