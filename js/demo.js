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
      id: "slow", name: "느린 독서 생활", description: "각자의 속도로 읽고, 오래 머문 문장을 나눠요.", icon: "느", members: ["나", "소연", "민준", "해나"],
      bookIds: ["1984", "old-man-and-the-sea", "demian", "no-longer-human", "pride-and-prejudice"]
    },
    {
      id: "night", name: "밤의 책장", description: "하루 끝, 낯설고 선명한 이야기를 함께 읽어요.", icon: "밤", members: ["나", "유진", "정우"],
      bookIds: ["metamorphosis", "sherlock-holmes", "the-great-gatsby", "alice-in-wonderland", "jekyll-and-hyde"]
    }
  ];

  const TUTORIAL_STEPS = [
    { symbol: "01", kicker: "모임과 책을 고르고", title: "모임마다 다른 책장을 둘러봐요", description: "두 모임에는 서로 다른 다섯 권이 준비되어 있어요. 마음이 가는 모임과 책을 고르면 앞 두 챕터를 바로 읽을 수 있어요." },
    { symbol: "02", kicker: "문장에 머물고", title: "문단을 누르며 읽어요", description: "본문을 아래로 읽으면 진도가 자동으로 쌓여요. 마음에 남는 문단을 누르면 함께 읽는 사람들의 생각도 열려요." },
    { symbol: "03", kicker: "생각을 나누고", title: "나만의 여백을 남겨요", description: "다른 독자의 댓글을 발견하고 내 생각도 남겨 보세요. 이 체험의 기록은 새로고침하면 모두 초기화돼요." }
  ];

  const seedComments = () => ({
    slow: {
      "0:0": [
        { id: "seed-1", author: "소연", content: "이 문장에서 잠시 멈췄어요. 오늘은 여기까지만 천천히 생각해 보려고 해요.", mine: false },
        { id: "seed-2", author: "민준", content: "같은 문장을 읽어도 서로 다른 마음이 남는다는 게 재미있어요.", mine: false }
      ],
      "0:1": [{ id: "seed-3", author: "해나", content: "내가 지나친 문장에 누군가 머물렀다는 사실이 책을 다시 보게 해요.", mine: false }]
    },
    night: {
      "0:0": [{ id: "seed-4", author: "유진", content: "짧은 문장 하나를 함께 나누니 혼자 읽을 때보다 오래 남네요.", mine: false }]
    }
  });

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
      comments: Object.fromEntries(books.map((item) => [item.id, seedComments()])),
      editingId: null,
      nextCommentId: 1,
      panelOpen: false
    };
  };

  let state = initialState();
  let toastTimer;
  let progressFrame;
  let tutorialOpen = false;
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
    tutorialPrevious: $("#tutorial-previous"), tutorialNext: $("#tutorial-next"), toast: $("#toast")
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
    tutorialOpen = true;
    tutorialStep = 0;
    renderTutorial();
    elements.tutorialBackdrop.hidden = false;
    elements.topbar.setAttribute("inert", "");
    elements.home.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => elements.tutorialSkip.focus());
  }

  function closeTutorial() {
    tutorialOpen = false;
    elements.tutorialBackdrop.hidden = true;
    elements.topbar.removeAttribute("inert");
    elements.home.removeAttribute("inert");
    document.body.style.overflow = "";
    requestAnimationFrame(() => document.querySelector('.book-choice[aria-current="true"]')?.focus());
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
      const icon = document.createElement("span"); icon.className = "club-icon"; icon.textContent = item.icon;
      const copy = document.createElement("span");
      const strong = document.createElement("strong"); strong.textContent = item.name;
      const detail = document.createElement("span"); detail.textContent = `${item.members.length}명이 함께 읽는 중`;
      copy.append(strong, detail); button.append(icon, copy); return button;
    }));
    elements.clubKicker.textContent = `${club.members.length}명의 작은 독서 모임`;
    elements.clubTitle.textContent = club.name;
    elements.clubDescription.textContent = club.description;
    elements.memberStack.replaceChildren(...club.members.map((name) => {
      const avatar = document.createElement("span"); avatar.className = "member-avatar"; avatar.textContent = name.slice(0, 1); avatar.title = name; return avatar;
    }));
    elements.bookCover.textContent = state.book.title;
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
      const cover = document.createElement("span"); cover.className = "book-choice-cover"; cover.textContent = book.title;
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
      const button = makeButton("activity-card", "", "open-activity", { chapterIndex, passageIndex });
      const quote = document.createElement("blockquote"); quote.textContent = passage?.content || "함께 읽은 문장";
      const meta = document.createElement("div"); meta.className = "activity-meta";
      const author = document.createElement("span"); author.textContent = `${comment.author}의 댓글`;
      const chapter = document.createElement("span"); chapter.textContent = state.book.chapters[chapterIndex]?.title || "";
      meta.append(author, chapter); button.append(quote, meta); return button;
    }));
  }

  function renderReader() {
    const chapter = state.book.chapters[state.chapterIndex];
    elements.readerCover.textContent = "";
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
        const article = document.createElement("article"); article.className = "comment";
        const top = document.createElement("div"); top.className = "comment-top";
        const author = document.createElement("div"); author.className = "comment-author";
        const avatar = document.createElement("span"); avatar.className = "tiny-avatar"; avatar.textContent = comment.author.slice(0, 1);
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

  function openReader(chapterIndex = state.chapterIndex, passageIndex = null) {
    state.view = "reader";
    state.chapterIndex = chapterIndex;
    state.selectedPassage = Number.isInteger(passageIndex) ? passageIndex : null;
    state.panelOpen = Number.isInteger(passageIndex);
    renderView();
    updatePanel();
    setTimeout(() => elements.chapterTitle.focus(), 0);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
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
    document.body.style.overflow = tutorialOpen || (state.panelOpen && compact) ? "hidden" : "";
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
        resetForm(); updatePanel(); renderHome(); showToast(`『${state.book.title}』을 펼쳤어요.`);
        requestAnimationFrame(() => document.querySelector(`[data-action="select-book"][data-book-id="${state.bookId}"]`)?.focus());
      }
      return;
    }
    if (action === "start-reading") openReader();
    if (action === "open-activity") openReader(Number(target.dataset.chapterIndex), Number(target.dataset.passageIndex));
    if (action === "select-chapter") {
      state.chapterIndex = Number(target.dataset.chapterIndex); state.selectedPassage = null; state.panelOpen = false;
      resetForm(); updatePanel(); renderReader(); scrollToChapterStart(); setTimeout(() => elements.chapterTitle.focus(), 0);
    }
    if (action === "select-passage") {
      state.selectedPassage = Number(target.dataset.passageIndex); state.panelOpen = true; resetForm(); renderReader(); updatePanel();
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

  document.addEventListener("keydown", (event) => {
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
    requestAnimationFrame(openTutorial);
    if (usedFallback) showToast("도서 파일을 불러오지 못해 내장 샘플로 시작했어요.");
  }

  initialize();
})();
