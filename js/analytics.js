(() => {
  "use strict";

  const configuredSiteId = document.querySelector('meta[name="naver-analytics-id"]')?.content.trim() || "";
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  const siteId = localHosts.has(window.location.hostname) ? "" : configuredSiteId;
  const queuedEvents = [];
  const eventTokenPattern = /^[A-Za-z][A-Za-z0-9]*$/;
  let ready = false;

  function sendEvent(category, name) {
    if (!window.wcs || typeof window.wcs.event !== "function") return false;
    window.wcs.event(category, name);
    return true;
  }

  function track(category, name, { oncePerSession = false } = {}) {
    if (!siteId || !eventTokenPattern.test(category) || !eventTokenPattern.test(name)) return false;
    const sessionKey = `yeobaekAnalytics:${category}:${name}`;
    if (oncePerSession) {
      try {
        if (window.sessionStorage.getItem(sessionKey)) return false;
        window.sessionStorage.setItem(sessionKey, "1");
      } catch {
        // 저장소를 사용할 수 없는 브라우저에서도 이벤트 수집은 계속한다.
      }
    }
    if (ready) return sendEvent(category, name);
    queuedEvents.push({ category, name });
    return true;
  }

  function schoolAcquisitionEventName(search) {
    const schoolCode = new URLSearchParams(search).get("school")?.trim() || "";
    if (!/^[A-Za-z][A-Za-z0-9-]{1,47}$/.test(schoolCode)) return "";
    const normalizedCode = schoolCode
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
    return normalizedCode ? `School${normalizedCode}` : "";
  }

  window.yeobaekAnalytics = Object.freeze({
    enabled: Boolean(siteId),
    track
  });

  if (!siteId) return;

  const schoolAcquisitionEvent = schoolAcquisitionEventName(window.location.search);
  if (schoolAcquisitionEvent) {
    track("Acquisition", schoolAcquisitionEvent, { oncePerSession: true });
  }

  window.wcs_add = window.wcs_add || {};
  window.wcs_add.wa = siteId;

  const script = document.createElement("script");
  script.src = "https://wcs.pstatic.net/wcslog.js";
  script.async = true;
  script.addEventListener("load", () => {
    if (typeof window.wcs_do !== "function") return;
    window.wcs_do();
    ready = true;
    queuedEvents.splice(0).forEach(({ category, name }) => sendEvent(category, name));
  });
  document.head.append(script);
})();
