const ROOT_CLASS = "slf-root";
const TOGGLE_ID = "slf-sidebar-toggle";
const STORAGE_KEY = "slf-sidebar-collapsed";
const SETTINGS_KEY = "slf-settings";
const VIDEO_SELECTOR = ".video-player-fresh_playerAndRightPanelWrapper_Ear";
const TEXT_SELECTOR = ".tiptap.ProseMirror.skool-editor2";
const SIDEBAR_SELECTOR = ".sc-4fca386d-11";
const DEFAULT_SETTINGS = {
  sidebarWidth: 420,
  videoMaxWidth: 1500,
  textMaxWidth: 1200
};

function getStorageArea() {
  if (globalThis.chrome?.storage?.local) {
    return chrome.storage.local;
  }

  return null;
}

function storageGet(key) {
  const area = getStorageArea();
  if (!area) {
    try {
      const raw = window.localStorage.getItem(key);
      return Promise.resolve(raw ? JSON.parse(raw) : null);
    } catch {
      return Promise.resolve(null);
    }
  }

  return new Promise((resolve) => {
    area.get([key], (result) => resolve(result[key] ?? null));
  });
}

function storageSet(key, value) {
  const area = getStorageArea();
  if (!area) {
    window.localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    area.set({ [key]: value }, () => resolve());
  });
}

function markLayout() {
  document.documentElement.classList.add(ROOT_CLASS);
  document.body.classList.add(ROOT_CLASS);
  document.body.setAttribute("data-slf-active", "true");
}

async function applyCollapsedState() {
  const collapsed = (await storageGet(STORAGE_KEY)) === true;
  document.body.classList.toggle("slf-sidebar-collapsed", collapsed);

  const button = document.getElementById(TOGGLE_ID);
  if (button) {
    button.textContent = collapsed ? "Show" : "Hide";
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
    button.addEventListener("click", async () => {
      const collapsed = document.body.classList.contains("slf-sidebar-collapsed");
      await storageSet(STORAGE_KEY, !collapsed);
      await applyCollapsedState();
    });
    document.body.appendChild(button);
  }
}

async function applySettings() {
  const stored = await storageGet(SETTINGS_KEY);
  const settings = {
    ...DEFAULT_SETTINGS,
    ...(stored && typeof stored === "object" ? stored : {})
  };

  document.documentElement.style.setProperty("--slf-sidebar-width", `${settings.sidebarWidth}px`);
  document.documentElement.style.setProperty("--slf-video-max-width", `${settings.videoMaxWidth}px`);
  document.documentElement.style.setProperty("--slf-text-max-width", `${settings.textMaxWidth}px`);
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

async function boot() {
  markLayout();
  ensureToggle();
  markContainers();
  await applySettings();
  await applyCollapsedState();
}

boot();

const observer = new MutationObserver(() => {
  boot();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

if (globalThis.chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
      return;
    }

    if (changes[SETTINGS_KEY] || changes[STORAGE_KEY]) {
      boot();
    }
  });
}
