const SETTINGS_KEY = "slf-settings";
const DEFAULT_SETTINGS = {
  sidebarWidth: 420,
  videoMaxWidth: 1500,
  textMaxWidth: 1200
};

const fields = [
  ["sidebarWidth", "sidebarWidthValue"],
  ["videoMaxWidth", "videoMaxWidthValue"],
  ["textMaxWidth", "textMaxWidthValue"]
];

function storageGet(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => resolve(result[key] ?? null));
  });
}

function storageSet(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

function renderValues(settings) {
  for (const [inputId, outputId] of fields) {
    const input = document.getElementById(inputId);
    const output = document.getElementById(outputId);
    input.value = settings[inputId];
    output.value = `${settings[inputId]}px`;
  }
}

async function saveFromInputs() {
  const next = {};

  for (const [inputId] of fields) {
    next[inputId] = Number(document.getElementById(inputId).value);
  }

  await storageSet(SETTINGS_KEY, next);
  renderValues(next);
}

async function boot() {
  const stored = await storageGet(SETTINGS_KEY);
  const settings = {
    ...DEFAULT_SETTINGS,
    ...(stored && typeof stored === "object" ? stored : {})
  };

  renderValues(settings);

  for (const [inputId] of fields) {
    document.getElementById(inputId).addEventListener("input", saveFromInputs);
  }

  document.getElementById("resetButton").addEventListener("click", async () => {
    await storageSet(SETTINGS_KEY, DEFAULT_SETTINGS);
    renderValues(DEFAULT_SETTINGS);
  });
}

boot();
