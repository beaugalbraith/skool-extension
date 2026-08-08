const ROOT_CLASS = "slf-root";
const BADGE_ID = "slf-debug-badge";
const TOGGLE_ID = "slf-sidebar-toggle";
const STORAGE_KEY = "slf-sidebar-collapsed";
const VIDEO_SELECTOR = ".video-player-fresh_playerAndRightPanelWrapper_Ear";
const TEXT_SELECTOR = ".tiptap.ProseMirror.skool-editor2";
const SIDEBAR_SELECTOR = ".sc-4fca386d-11";

function markLayout() {
  document.documentElement.classList.add(ROOT_CLASS);
  document.body.classList.add(ROOT_CLASS);
  document.body.setAttribute("data-slf-active", "true");
}

function ensureBadge() {
  if (!document.body || document.getElementById(BADGE_ID)) {
    return;
  }

  const badge = document.createElement("div");
  badge.id = BADGE_ID;
  badge.textContent = "Skool Layout Fix active";
  document.body.appendChild(badge);
}

function applyCollapsedState() {
  const collapsed = window.localStorage.getItem(STORAGE_KEY) === "true";
  document.body.classList.toggle("slf-sidebar-collapsed", collapsed);

  const button = document.getElementById(TOGGLE_ID);
  if (button) {
    button.textContent = collapsed ? "→" : "←";
    button.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    button.setAttribute("title", collapsed ? "Expand sidebar" : "Collapse sidebar");
  }
}

function ensureToggle() {
  if (!document.body) {
    return;
  }

  let button = document.getElementById(TOGGLE_ID);
  if (!button) {
    button = document.createElement("button");
    button.id = TOGGLE_ID;
    button.type = "button";
    button.addEventListener("click", () => {
      const collapsed = document.body.classList.contains("slf-sidebar-collapsed");
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "false" : "true");
      applyCollapsedState();
    });
    document.body.appendChild(button);
  }

  applyCollapsedState();
}

function getAncestors(node) {
  const ancestors = [];
  let current = node;

  while (current) {
    ancestors.push(current);
    current = current.parentElement;
  }

  return ancestors;
}

function findLowestCommonAncestor(a, b) {
  if (!a || !b) {
    return null;
  }

  const aAncestors = new Set(getAncestors(a));
  let current = b;

  while (current) {
    if (aAncestors.has(current)) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function findDirectChildAncestor(container, node) {
  if (!container || !node || !container.contains(node)) {
    return null;
  }

  let current = node;
  while (current && current.parentElement && current.parentElement !== container) {
    current = current.parentElement;
  }

  return current && current.parentElement === container ? current : null;
}

function markContainers() {
  document.querySelectorAll(".slf-sidebar").forEach((node) => node.classList.remove("slf-sidebar"));
  document.querySelectorAll(".slf-video").forEach((node) => node.classList.remove("slf-video"));
  document.querySelectorAll(".slf-text").forEach((node) => node.classList.remove("slf-text"));
  document.querySelectorAll(".slf-lesson-stack").forEach((node) => node.classList.remove("slf-lesson-stack"));
  document.querySelectorAll(".slf-classroom-layout").forEach((node) => node.classList.remove("slf-classroom-layout"));
  document.querySelectorAll(".slf-main-column").forEach((node) => node.classList.remove("slf-main-column"));
  document.querySelectorAll(".slf-sidebar-column").forEach((node) => node.classList.remove("slf-sidebar-column"));

  const sidebar = document.querySelector(SIDEBAR_SELECTOR);
  const video = document.querySelector(VIDEO_SELECTOR);
  const text = document.querySelector(TEXT_SELECTOR);

  if (sidebar) {
    sidebar.classList.add("slf-sidebar");
  }

  if (video) {
    video.classList.add("slf-video");
  }

  if (text) {
    text.classList.add("slf-text");
  }

  const lessonStack = findLowestCommonAncestor(video, text);
  if (lessonStack) {
    lessonStack.classList.add("slf-lesson-stack");
  }

  const classroomLayout = findLowestCommonAncestor(sidebar, lessonStack || video || text);
  if (classroomLayout) {
    classroomLayout.classList.add("slf-classroom-layout");
  }

  const sidebarColumn = findDirectChildAncestor(classroomLayout, sidebar);
  if (sidebarColumn) {
    sidebarColumn.classList.add("slf-sidebar-column");
  }

  const mainColumn = findDirectChildAncestor(classroomLayout, video || text);

  if (mainColumn) {
    mainColumn.classList.add("slf-main-column");
  }

  if (!lessonStack && mainColumn) {
    mainColumn.classList.add("slf-lesson-stack");
  }
}

function boot() {
  markLayout();
  ensureBadge();
  ensureToggle();
  markContainers();
}

boot();

const observer = new MutationObserver(() => {
  markLayout();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
