const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const analyticsSource = fs.readFileSync(path.join(__dirname, "..", "js", "analytics.js"), "utf8");

function loadAnalytics(siteId, hostname = "example.com", search = "") {
  let appendedScript = null;
  const window = {};
  const sessionValues = new Map();
  window.location = { hostname, search };
  window.sessionStorage = {
    getItem: (key) => sessionValues.get(key) || null,
    setItem: (key, value) => sessionValues.set(key, value)
  };
  const document = {
    querySelector: () => ({ content: siteId }),
    createElement: () => ({ addEventListener(type, handler) { this[`on${type}`] = handler; } }),
    head: { append(script) { appendedScript = script; } }
  };
  vm.runInNewContext(analyticsSource, { document, URLSearchParams, window });
  return { window, getScript: () => appendedScript };
}

test("분석 ID가 없으면 네이버 스크립트를 불러오지 않는다", () => {
  const { window, getScript } = loadAnalytics("");
  assert.equal(window.yeobaekAnalytics.enabled, false);
  assert.equal(window.yeobaekAnalytics.track("Funnel", "ReadingStarted"), false);
  assert.equal(getScript(), null);
});

test("로컬 개발 주소에서는 분석 스크립트를 불러오지 않는다", () => {
  const { window, getScript } = loadAnalytics("sample123", "127.0.0.1");
  assert.equal(window.yeobaekAnalytics.enabled, false);
  assert.equal(getScript(), null);
});

test("스크립트 로드 전 이벤트를 보관하고 페이지뷰 이후 전송한다", () => {
  const { window, getScript } = loadAnalytics("sample123");
  const events = [];
  let pageviews = 0;

  assert.equal(window.yeobaekAnalytics.track("Funnel", "ReadingStarted"), true);
  assert.equal(getScript().src, "https://wcs.pstatic.net/wcslog.js");
  window.wcs = { event: (category, name) => events.push([category, name]) };
  window.wcs_do = () => { pageviews += 1; };
  getScript().onload();

  assert.equal(pageviews, 1);
  assert.deepEqual(events, [["Funnel", "ReadingStarted"]]);
});

test("네이버 규격에 맞지 않는 이벤트 이름은 전송하지 않는다", () => {
  const { window } = loadAnalytics("sample123");
  assert.equal(window.yeobaekAnalytics.track("Funnel", "댓글확인"), false);
  assert.equal(window.yeobaekAnalytics.track("Book", "Selected1984"), true);
});

test("같은 방문 세션의 동일 행동은 한 번만 집계한다", () => {
  const { window } = loadAnalytics("sample123");
  assert.equal(window.yeobaekAnalytics.track("Funnel", "CommentViewed", { oncePerSession: true }), true);
  assert.equal(window.yeobaekAnalytics.track("Funnel", "CommentViewed", { oncePerSession: true }), false);
});

test("학교 링크 파라미터를 학교 유입 이벤트로 전송한다", () => {
  const { window, getScript } = loadAnalytics("sample123", "example.com", "?school=yonsei-university");
  const events = [];
  window.wcs = { event: (category, name) => events.push([category, name]) };
  window.wcs_do = () => {};
  getScript().onload();

  assert.deepEqual(events, [["Acquisition", "SchoolYonseiUniversity"]]);
});

test("허용되지 않은 학교 파라미터는 이벤트로 전송하지 않는다", () => {
  const { window, getScript } = loadAnalytics("sample123", "example.com", "?school=연세대학교");
  const events = [];
  window.wcs = { event: (category, name) => events.push([category, name]) };
  window.wcs_do = () => {};
  getScript().onload();

  assert.deepEqual(events, []);
});
