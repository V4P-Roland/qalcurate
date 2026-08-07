'use strict';

/* ==========================================================================
   Qalcurate — Aufnahme, Live-Transkription, Offline-Warteschlange, Webhook-Sync
   ========================================================================== */

/* ---------------- DOM refs ---------------- */
const $ = (sel) => document.querySelector(sel);
const els = {
  themeToggle: $('#themeToggle'),
  statusChip: $('#statusChip'),
  statusChipLabel: $('#statusChipLabel'),
  navBtns: document.querySelectorAll('.nav-btn'),
  views: document.querySelectorAll('.view'),
  navHistoryBadge: $('#navHistoryBadge'),
  bottomNav: $('.bottom-nav'),
  appShell: $('.app-shell'),

  menuToggle: $('#menuToggle'),
  sideMenu: $('#sideMenu'),
  sideMenuBackdrop: $('#sideMenuBackdrop'),
  sideMenuClose: $('#sideMenuClose'),
  sideMenuItems: document.querySelectorAll('.side-menu-item'),

  recorderCard: $('#recorderCard'),
  titleInput: $('#titleInput'),
  waveformCanvas: $('#waveform'),
  waveformIdleLabel: $('#waveformIdleLabel'),
  timer: $('#timer'),
  recordBtn: $('#recordBtn'),
  recordHint: $('#recordHint'),
  transcriptBox: $('#transcriptBox'),
  asrBanner: $('#asrBanner'),
  asrBannerText: $('#asrBannerText'),
  asrSupportBadge: $('#asrSupportBadge'),

  deleteAllBtn: $('#deleteAllBtn'),
  deleteAllLabel: $('#deleteAllLabel'),
  pendingChip: $('#pendingChip'),
  pendingChipLabel: $('#pendingChipLabel'),
  recordingList: $('#recordingList'),
  historyEmptyState: $('#historyEmptyState'),

  webhookInput: $('#webhookInput'),
  testWebhookBtn: $('#testWebhookBtn'),
  saveWebhookBtn: $('#saveWebhookBtn'),
  langSelect: $('#langSelect'),
  pendingCountVal: $('#pendingCountVal'),
  connStatusVal: $('#connStatusVal'),

  uiLangToggle: $('#uiLangToggle'),
  uiLangCode: $('#uiLangCode'),
  themeToggleIcon: $('#themeToggleIcon'),
  themeToggleLabel: $('#themeToggleLabel'),

  toastStack: $('#toastStack'),
};

/* ==========================================================================
   Interface language (i18n) — independent from the speech-recognition
   language stored under the 'language' setting key.
   ========================================================================== */
const I18N = {
  de: {
    skipLink: 'Zum Inhalt springen',
    menuOpen: 'Menü öffnen',
    menuClose: 'Menü schließen',
    sideMenuTitle: 'Funktionen',
    navTranscript: 'Transkript',
    statusOnline: 'Online',
    statusOffline: 'Offline',
    statusSyncing: 'Synchronisiere…',
    themeToDark: 'Dunkler Modus',
    themeToLight: 'Heller Modus',
    themeToggleAriaDark: 'Zu dunklem Modus wechseln',
    themeToggleAriaLight: 'Zu hellem Modus wechseln',
    langToggleAriaToEn: 'Auf Englisch wechseln',
    langToggleAriaToDe: 'Auf Deutsch wechseln',
    recorderTitle: 'Aufnahme',
    recorderSubtitle: 'Zeichne ein Gespräch auf — bei fehlender Verbindung wird es lokal gespeichert und automatisch übermittelt, sobald du wieder online bist und ein Webhook konfiguriert wurde.',
    asrNotSupported: 'Live-Transkription wird von diesem Browser nicht unterstützt. Die Audioaufnahme funktioniert trotzdem — installiere die App am besten in Chrome oder Edge für Live-Transkription.',
    asrNetworkIssue: 'Transkription momentan nicht verfügbar (keine Verbindung). Die Audioaufnahme läuft weiter und wird gespeichert.',
    asrDenied: 'Zugriff auf die Spracherkennung wurde verweigert. Die Audioaufnahme läuft weiter.',
    asrBadgeUnavailable: 'nicht verfügbar',
    titleInputLabel: 'Titel der Aufnahme',
    titleInputPlaceholder: 'z. B. Kundengespräch Müller',
    recognitionLangLabel: 'Sprache der Spracherkennung',
    recIndicator: 'Aufnahme läuft',
    recordStartAria: 'Aufnahme starten',
    recordStopAria: 'Aufnahme beenden',
    recordHintStart: 'Tippen, um die Aufnahme zu starten',
    recordHintStop: 'Tippen, um die Aufnahme zu beenden',
    transcriptLabel: 'Transkript',
    transcriptPlaceholder: 'Das Transkript erscheint hier während der Aufnahme…',
    historyTitle: 'Verlauf',
    historySubtitle: 'Alle Aufnahmen mit Übermittlungsstatus.',
    deleteAll: 'Alle löschen',
    deleteAllConfirm: 'Wirklich alle löschen?',
    pendingCount: (n) => `${n} ausstehend`,
    historyEmpty: 'Noch keine Aufnahmen vorhanden.<br />Starte deine erste Aufnahme im Tab „Aufnahme“.',
    noTranscriptPreview: 'Kein Transkript verfügbar — Audio wurde trotzdem gespeichert.',
    noTranscriptFull: 'Kein Transkript verfügbar.',
    statusSynced: 'Gesendet',
    statusError: 'Fehler',
    statusPending: 'Ausstehend',
    lastError: (msg) => `Letzter Fehler: ${msg}`,
    resend: 'Erneut senden',
    resendSending: 'Sende…',
    delete: 'Löschen',
    deleteConfirm: 'Wirklich löschen?',
    settingsTitle: 'Einstellungen',
    settingsSubtitle: 'Verbindung zum Webhook und App-Verhalten.',
    webhookHeading: 'Webhook',
    webhookUrlLabel: 'Webhook-URL',
    webhookUrlPlaceholder: 'https://dein-server.tld/webhook/qalcurate',
    webhookHint: 'Jede Aufnahme wird als Formulardaten (Titel, Zeitstempel, Dauer, Transkript, Audiodatei) per POST an diese URL gesendet, sobald eine Internetverbindung besteht.',
    testConnection: 'Verbindung testen',
    testing: 'Teste…',
    save: 'Speichern',
    queueHeading: 'Warteschlange',
    pendingRecordings: 'Ausstehende Aufnahmen',
    connectionStatus: 'Verbindungsstatus',
    aboutHeading: 'Über Qalcurate',
    aboutText: 'Qalcurate ist eine installierbare Web-App (PWA). Füge sie über das Browser-Menü „Zum Startbildschirm hinzufügen“ deinem Homescreen hinzu, um sie wie eine native App zu nutzen. Version 1.0.',
    agentComingSoonSubtitle: 'Diese Funktion ist in Vorbereitung.',
    voiceAgentEmpty: 'Voice Agent ist bald verfügbar.',
    videoAgentEmpty: 'Video Agent ist bald verfügbar.',
    navRecorder: 'Aufnahme',
    navHistory: 'Verlauf',
    navSettings: 'Einstellungen',
    toastNoWebhook: 'Bitte zuerst eine Webhook-URL in den Einstellungen speichern.',
    toastSyncedCount: (n) => `${n} Aufnahme(n) übermittelt.`,
    toastSyncFailedRetry: 'Übermittlung fehlgeschlagen. Wird später erneut versucht.',
    toastMicDenied: 'Mikrofonzugriff wurde verweigert oder ist nicht verfügbar.',
    toastRecorderUnsupported: 'Aufnahme wird von diesem Browser nicht unterstützt.',
    toastEmptyDiscarded: 'Aufnahme war leer und wurde verworfen.',
    toastSaved: 'Aufnahme gespeichert.',
    toastSavedNoTranscript: 'Aufnahme gespeichert (ohne Transkript).',
    toastOfflineCannotSend: 'Keine Verbindung — Übermittlung kann nicht gestartet werden.',
    toastResendOk: 'Übermittlung erfolgreich.',
    toastResendFail: 'Übermittlung fehlgeschlagen.',
    toastDeleted: 'Aufnahme gelöscht.',
    toastAllDeleted: 'Alle Aufnahmen wurden gelöscht.',
    toastWebhookSaved: 'Webhook-URL gespeichert.',
    toastWebhookRemoved: 'Webhook-URL entfernt.',
    toastEnterUrlFirst: 'Bitte zuerst eine URL eingeben.',
    toastTestOk: 'Verbindung erfolgreich — das Zielsystem hat geantwortet.',
    toastTestHttpError: (status) => `Das Zielsystem antwortete mit Fehler: HTTP ${status}`,
    toastTestFailed: (msg) => `Verbindung fehlgeschlagen: ${msg}`,
    toastNoStorage: 'Lokaler Speicher (IndexedDB) ist in dieser Umgebung nicht verfügbar.',
    toastLangSaved: 'Sprache gespeichert.',
    testWebhookTitle: 'Qalcurate Verbindungstest',
    testWebhookTranscript: 'Dies ist eine Testübermittlung von Qalcurate.',
    defaultTitlePrefix: 'Gespräch vom ',
    networkErrorFallback: 'Netzwerkfehler',
    unknownError: 'Unbekannter Fehler',
    dateLocale: 'de-DE',
  },
  en: {
    skipLink: 'Skip to content',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    sideMenuTitle: 'Features',
    navTranscript: 'Transcript',
    statusOnline: 'Online',
    statusOffline: 'Offline',
    statusSyncing: 'Syncing…',
    themeToDark: 'Dark mode',
    themeToLight: 'Light mode',
    themeToggleAriaDark: 'Switch to dark mode',
    themeToggleAriaLight: 'Switch to light mode',
    langToggleAriaToEn: 'Switch to English',
    langToggleAriaToDe: 'Switch to German',
    recorderTitle: 'Recording',
    recorderSubtitle: 'Record a conversation — if you lose connection it is saved locally and sent automatically once you are back online and a webhook is configured.',
    asrNotSupported: 'Live transcription is not supported by this browser. Audio recording still works — for live transcription, install the app in Chrome or Edge.',
    asrNetworkIssue: 'Transcription is temporarily unavailable (no connection). The audio recording keeps running and will be saved.',
    asrDenied: 'Access to speech recognition was denied. The audio recording keeps running.',
    asrBadgeUnavailable: 'unavailable',
    titleInputLabel: 'Recording title',
    titleInputPlaceholder: 'e.g. Client call Smith',
    recognitionLangLabel: 'Speech recognition language',
    recIndicator: 'Recording',
    recordStartAria: 'Start recording',
    recordStopAria: 'Stop recording',
    recordHintStart: 'Tap to start recording',
    recordHintStop: 'Tap to stop recording',
    transcriptLabel: 'Transcript',
    transcriptPlaceholder: 'The transcript appears here while recording…',
    historyTitle: 'History',
    historySubtitle: 'All recordings with delivery status.',
    deleteAll: 'Delete all',
    deleteAllConfirm: 'Really delete all?',
    pendingCount: (n) => `${n} pending`,
    historyEmpty: 'No recordings yet.<br />Start your first recording on the “Recording” tab.',
    noTranscriptPreview: 'No transcript available — the audio was saved anyway.',
    noTranscriptFull: 'No transcript available.',
    statusSynced: 'Sent',
    statusError: 'Error',
    statusPending: 'Pending',
    lastError: (msg) => `Last error: ${msg}`,
    resend: 'Resend',
    resendSending: 'Sending…',
    delete: 'Delete',
    deleteConfirm: 'Really delete?',
    settingsTitle: 'Settings',
    settingsSubtitle: 'Webhook connection and app behavior.',
    webhookHeading: 'Webhook',
    webhookUrlLabel: 'Webhook URL',
    webhookUrlPlaceholder: 'https://your-server.tld/webhook/qalcurate',
    webhookHint: 'Every recording is sent as form data (title, timestamp, duration, transcript, audio file) via POST to this URL as soon as an internet connection is available.',
    testConnection: 'Test connection',
    testing: 'Testing…',
    save: 'Save',
    queueHeading: 'Queue',
    pendingRecordings: 'Pending recordings',
    connectionStatus: 'Connection status',
    aboutHeading: 'About Qalcurate',
    aboutText: 'Qalcurate is an installable web app (PWA). Add it to your home screen via the browser menu “Add to home screen” to use it like a native app. Version 1.0.',
    agentComingSoonSubtitle: 'This feature is coming soon.',
    voiceAgentEmpty: 'Voice Agent will be available soon.',
    videoAgentEmpty: 'Video Agent will be available soon.',
    navRecorder: 'Recording',
    navHistory: 'History',
    navSettings: 'Settings',
    toastNoWebhook: 'Please save a webhook URL in settings first.',
    toastSyncedCount: (n) => `${n} recording(s) delivered.`,
    toastSyncFailedRetry: 'Delivery failed. It will be retried later.',
    toastMicDenied: 'Microphone access was denied or is unavailable.',
    toastRecorderUnsupported: 'Recording is not supported by this browser.',
    toastEmptyDiscarded: 'The recording was empty and was discarded.',
    toastSaved: 'Recording saved.',
    toastSavedNoTranscript: 'Recording saved (without transcript).',
    toastOfflineCannotSend: 'No connection — delivery cannot be started.',
    toastResendOk: 'Delivery successful.',
    toastResendFail: 'Delivery failed.',
    toastDeleted: 'Recording deleted.',
    toastAllDeleted: 'All recordings were deleted.',
    toastWebhookSaved: 'Webhook URL saved.',
    toastWebhookRemoved: 'Webhook URL removed.',
    toastEnterUrlFirst: 'Please enter a URL first.',
    toastTestOk: 'Connection successful — the target system responded.',
    toastTestHttpError: (status) => `The target system responded with an error: HTTP ${status}`,
    toastTestFailed: (msg) => `Connection failed: ${msg}`,
    toastNoStorage: 'Local storage (IndexedDB) is not available in this environment.',
    toastLangSaved: 'Language saved.',
    testWebhookTitle: 'Qalcurate connection test',
    testWebhookTranscript: 'This is a test submission from Qalcurate.',
    defaultTitlePrefix: 'Conversation from ',
    networkErrorFallback: 'Network error',
    unknownError: 'Unknown error',
    dateLocale: 'en-US',
  },
};

let currentUiLang = 'de';
function t(key, ...args) {
  const dict = I18N[currentUiLang] || I18N.de;
  const val = dict[key] ?? I18N.de[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

let currentAsrBannerKey = null;
let lastConnState = 'online';

function updateRecordUIStrings() {
  els.recordBtn.setAttribute('aria-label', isRecording ? t('recordStopAria') : t('recordStartAria'));
  els.recordHint.textContent = isRecording ? t('recordHintStop') : t('recordHintStart');
}

function applyTranslations() {
  document.documentElement.lang = currentUiLang;
  els.uiLangCode.textContent = currentUiLang === 'de' ? 'EN' : 'DE';
  els.uiLangToggle.setAttribute('aria-label', currentUiLang === 'de' ? t('langToggleAriaToEn') : t('langToggleAriaToDe'));

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });

  els.transcriptBox.dataset.placeholder = t('transcriptPlaceholder');
  els.menuToggle.setAttribute('aria-label', els.sideMenu.classList.contains('is-open') ? t('menuClose') : t('menuOpen'));
  applyThemeIcon(currentTheme);
  setConnState(lastConnState);
  updateRecordUIStrings();
  if (currentAsrBannerKey) els.asrBannerText.textContent = t(currentAsrBannerKey);
  updatePendingUI();
  renderHistory();
}

els.uiLangToggle.addEventListener('click', async () => {
  currentUiLang = currentUiLang === 'de' ? 'en' : 'de';
  applyTranslations();
  await dbSetSetting('uiLang', currentUiLang);
});

/* ---------------- Theme ---------------- */
let currentTheme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
function applyThemeIcon(mode) {
  els.themeToggle.setAttribute('aria-label', mode === 'dark' ? t('themeToggleAriaLight') : t('themeToggleAriaDark'));
  els.themeToggleLabel.textContent = mode === 'dark' ? t('themeToLight') : t('themeToDark');
  els.themeToggleIcon.innerHTML =
    mode === 'dark'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}
document.documentElement.setAttribute('data-theme', currentTheme);
applyThemeIcon(currentTheme);
els.themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  applyThemeIcon(currentTheme);
});

/* ---------------- Navigation ---------------- */
const TRANSKRIPT_VIEWS = ['recorder', 'history', 'settings'];
let activeGlobalView = 'recorder';
let activeTranskriptView = 'recorder';

function switchView(name, { fromSideMenu = false } = {}) {
  // Requirement: keep the transcript visible in the recorder view after stopping
  // a recording, until another view is opened — then it should be empty again.
  if (activeGlobalView === 'recorder' && name !== 'recorder' && !isRecording) {
    finalTranscript = '';
    lastInterimText = '';
    renderTranscript('', '');
  }

  activeGlobalView = name;
  if (TRANSKRIPT_VIEWS.includes(name)) {
    activeTranskriptView = name;
    currentModule = 'transkript';
  } else {
    currentModule = name; // 'voice-agent' | 'video-agent'
  }

  els.views.forEach((v) => v.classList.toggle('is-active', v.dataset.view === name));
  els.navBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.nav === name));
  els.sideMenuItems.forEach((b) => b.classList.toggle('is-active', b.dataset.module === currentModule));
  els.bottomNav.hidden = currentModule !== 'transkript';

  if (name === 'history') renderHistory();
  if (fromSideMenu) closeSideMenu();
}
els.navBtns.forEach((btn) => btn.addEventListener('click', () => switchView(btn.dataset.nav)));

/* ---------------- Side menu ---------------- */
let currentModule = 'transkript';
function openSideMenu() {
  els.sideMenu.classList.add('is-open');
  els.sideMenu.setAttribute('aria-hidden', 'false');
  els.sideMenuBackdrop.hidden = false;
  els.menuToggle.setAttribute('aria-expanded', 'true');
  els.menuToggle.setAttribute('aria-label', t('menuClose'));
}
function closeSideMenu() {
  els.sideMenu.classList.remove('is-open');
  els.sideMenu.setAttribute('aria-hidden', 'true');
  els.sideMenuBackdrop.hidden = true;
  els.menuToggle.setAttribute('aria-expanded', 'false');
  els.menuToggle.setAttribute('aria-label', t('menuOpen'));
}
els.menuToggle.addEventListener('click', () => {
  if (els.sideMenu.classList.contains('is-open')) closeSideMenu();
  else openSideMenu();
});
els.sideMenuClose.addEventListener('click', closeSideMenu);
els.sideMenuBackdrop.addEventListener('click', closeSideMenu);
els.sideMenuItems.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mod = btn.dataset.module;
    if (mod === 'transkript') switchView(activeTranskriptView, { fromSideMenu: true });
    else switchView(mod, { fromSideMenu: true });
  });
});

/* ---------------- Toasts ---------------- */
function showToast(msg, duration = 2800) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  els.toastStack.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

/* ---------------- Helpers ---------------- */
function formatDuration(sec) {
  sec = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}
function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString(t('dateLocale'), { dateStyle: 'medium', timeStyle: 'short' });
  } catch (e) {
    return iso;
  }
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function defaultTitle() {
  return t('defaultTitlePrefix') + new Date().toLocaleString(t('dateLocale'), { dateStyle: 'medium', timeStyle: 'short' });
}

/* ==========================================================================
   IndexedDB layer
   ========================================================================== */
const DB_NAME = 'qalcurate-db';
const DB_VERSION = 1;
let dbPromise = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB nicht verfügbar'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('recordings')) {
        db.createObjectStore('recordings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function getDB() {
  if (!dbPromise) dbPromise = openDB();
  return dbPromise;
}
async function dbGetAllRecordings() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('recordings', 'readonly');
    const req = tx.objectStore('recordings').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function dbGetRecording(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('recordings', 'readonly');
    const req = tx.objectStore('recordings').get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
async function dbPutRecording(rec) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('recordings', 'readwrite');
    tx.objectStore('recordings').put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function dbDeleteRecording(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('recordings', 'readwrite');
    tx.objectStore('recordings').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function dbClearRecordings() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('recordings', 'readwrite');
    tx.objectStore('recordings').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function dbGetSetting(key, fallback) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly');
    const req = tx.objectStore('settings').get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : fallback);
    req.onerror = () => reject(req.error);
  });
}
async function dbSetSetting(key, value) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put({ key, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ==========================================================================
   Connectivity + sync
   ========================================================================== */
let currentLanguage = 'de-DE';

function setConnState(state) {
  lastConnState = state;
  els.statusChip.dataset.state = state;
  els.pendingChip.dataset.state = state === 'syncing' ? 'syncing' : state;
  const label = state === 'online' ? t('statusOnline') : state === 'syncing' ? t('statusSyncing') : t('statusOffline');
  els.statusChipLabel.textContent = label;
  els.connStatusVal.textContent = label;
}

async function updatePendingUI() {
  const recs = await dbGetAllRecordings();
  const pending = recs.filter((r) => r.status !== 'synced');
  const count = pending.length;
  els.pendingCountVal.textContent = String(count);
  if (count > 0) {
    els.navHistoryBadge.hidden = false;
    els.navHistoryBadge.textContent = String(count);
    els.pendingChip.hidden = false;
    els.pendingChipLabel.textContent = t('pendingCount', count);
  } else {
    els.navHistoryBadge.hidden = true;
    els.pendingChip.hidden = true;
  }
}

async function syncOne(rec, webhookUrlParam) {
  // Defense-in-depth: never attempt (or count as failed) a submission while offline.
  if (!navigator.onLine) return false;
  const webhookUrl = webhookUrlParam ?? (await dbGetSetting('webhookUrl', ''));
  if (!webhookUrl) {
    showToast(t('toastNoWebhook'));
    return false;
  }
  try {
    const fd = new FormData();
    fd.append('id', rec.id);
    fd.append('title', rec.title);
    fd.append('createdAt', rec.createdAt);
    fd.append('durationSec', String(rec.durationSec));
    fd.append('transcript', rec.transcript || '');
    fd.append('source', 'qalcurate-webapp');
    const ext = (rec.mimeType || '').includes('mp4') ? 'm4a' : 'webm';
    fd.append('audio', rec.audioBlob, `${rec.id}.${ext}`);

    const res = await fetch(webhookUrl, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    rec.status = 'synced';
    rec.syncedAt = new Date().toISOString();
    rec.lastError = null;
    await dbPutRecording(rec);
    return true;
  } catch (err) {
    rec.attempts = (rec.attempts || 0) + 1;
    rec.status = 'error';
    rec.lastError = (err && err.message) || t('unknownError');
    await dbPutRecording(rec);
    return false;
  }
}

/* ---------------- Submission concurrency lock ----------------
   A single submission for a given recording must never run twice
   concurrently — not from two overlapping trySync() batches, not from
   trySync() racing a manual "resend" click, and (best-effort) not across
   browser tabs. The Web Locks API gives us a real cross-tab mutex when
   available; a promise-chain fallback keeps at least intra-tab safety
   everywhere else. This must be a SEPARATE lock from `syncInFlight`
   (which guards the whole trySync() batch) — reusing that flag here would
   deadlock, since trySync() already holds it for its entire loop. */
let fallbackLockChain = Promise.resolve();
function withSyncLock(fn) {
  if (navigator.locks && navigator.locks.request) {
    return navigator.locks.request('qalcurate-recording-sync', fn);
  }
  const run = fallbackLockChain.then(fn, fn);
  fallbackLockChain = run.catch(() => {});
  return run;
}

/** Submit exactly one recording, guarded so overlapping callers (trySync's
 * batch loop, a manual resend click, another tab) can never both send the
 * same recording at once. Always re-reads the freshest DB record inside the
 * lock and no-ops if it was already marked synced by a previous holder. */
function submitRecording(id, webhookUrlParam) {
  return withSyncLock(async () => {
    const fresh = await dbGetRecording(id);
    if (!fresh) return false;
    if (fresh.status === 'synced') return true; // already delivered by another caller
    return syncOne(fresh, webhookUrlParam);
  });
}

let syncInFlight = false;
async function trySync({ silent = true } = {}) {
  // Set the lock synchronously, before any `await`, so that overlapping
  // triggers (online event, visibilitychange, init(), the interval, manual
  // saves/resends) can never race past this guard concurrently — this was
  // the root cause of a single recording being submitted multiple times.
  if (!navigator.onLine || syncInFlight) return;
  syncInFlight = true;
  try {
    const webhookUrl = await dbGetSetting('webhookUrl', '');
    if (!webhookUrl) return;
    const recs = await dbGetAllRecordings();
    const pending = recs.filter((r) => r.status !== 'synced');
    if (!pending.length) return;

    setConnState('syncing');
    let okCount = 0;
    for (const rec of pending) {
      if (!navigator.onLine) break; // connection dropped mid-sync — stop immediately
      const ok = await submitRecording(rec.id, webhookUrl);
      if (ok) okCount++;
    }
    setConnState(navigator.onLine ? 'online' : 'offline');
    await updatePendingUI();
    await renderHistory();
    if (!silent && okCount > 0) {
      showToast(t('toastSyncedCount', okCount));
    } else if (!silent && okCount === 0) {
      showToast(t('toastSyncFailedRetry'));
    }
  } finally {
    syncInFlight = false;
  }
}

window.addEventListener('online', () => {
  setConnState('online');
  trySync({ silent: true });
});
window.addEventListener('offline', () => setConnState('offline'));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') trySync({ silent: true });
});

/* ==========================================================================
   Recorder — MediaRecorder + waveform + SpeechRecognition
   ========================================================================== */
let mediaRecorder = null;
let mediaStream = null;
let chunks = [];
let isRecording = false;
let startTimeMs = 0;
let elapsedSeconds = 0;
let timerInterval = null;

let audioCtx = null;
let analyser = null;
let sourceNode = null;
let rafId = null;

let recognition = null;
let recognitionShouldRestart = false;
let finalTranscript = '';
let lastInterimText = '';
let acceptResults = false;
let recognitionEnded = true;
let flushResolve = null;

function showAsrBanner(show, key) {
  els.asrBanner.hidden = !show;
  currentAsrBannerKey = show ? key : null;
  if (show && key) els.asrBannerText.textContent = t(key);
  els.asrSupportBadge.hidden = !show;
}

function renderTranscript(final, interim) {
  const empty = !final && !interim;
  els.transcriptBox.dataset.empty = empty ? 'true' : 'false';
  els.transcriptBox.innerHTML = escapeHtml(final) + (interim ? `<span class="transcript-interim">${escapeHtml(interim)}</span>` : '');
  els.transcriptBox.scrollTop = els.transcriptBox.scrollHeight;
}

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function createAndStartRecognition() {
  const SR = getSpeechRecognitionCtor();
  if (!SR) return;
  recognition = new SR();
  recognition.lang = currentLanguage || 'de-DE';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    if (!acceptResults) return;
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (res.isFinal) finalTranscript += res[0].transcript + ' ';
      else interim += res[0].transcript;
    }
    lastInterimText = interim;
    renderTranscript(finalTranscript, interim);
  };

  recognition.onerror = (event) => {
    if (event.error === 'network') {
      showAsrBanner(true, 'asrNetworkIssue');
    } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      recognitionShouldRestart = false;
      showAsrBanner(true, 'asrDenied');
    }
    // 'no-speech' / 'aborted' are non-fatal — handled via onend restart below.
  };

  recognition.onend = () => {
    if (recognitionShouldRestart && isRecording) {
      setTimeout(() => {
        if (recognitionShouldRestart && isRecording) createAndStartRecognition();
      }, 250);
    } else {
      recognitionEnded = true;
      if (flushResolve) {
        const resolve = flushResolve;
        flushResolve = null;
        resolve();
      }
    }
  };

  recognitionEnded = false;
  try {
    recognition.start();
  } catch (e) {
    /* ignore — will be retried on next start or naturally via onend */
  }
}

/* Waits until the recognition engine has fully flushed its last result (or a
   safety timeout elapses) so the trailing spoken segment isn't lost when the
   user stops recording right after speaking. */
function waitForRecognitionFlush(timeoutMs = 700) {
  return new Promise((resolve) => {
    if (recognitionEnded || !recognition) {
      resolve();
      return;
    }
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    flushResolve = done;
    setTimeout(done, timeoutMs);
  });
}

function startRecognition() {
  const SR = getSpeechRecognitionCtor();
  if (!SR) {
    showAsrBanner(true, 'asrNotSupported');
    return;
  }
  showAsrBanner(false);
  recognitionShouldRestart = true;
  createAndStartRecognition();
}

function stopRecognition() {
  recognitionShouldRestart = false;
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {
      /* ignore */
    }
  }
}

function startWaveform(stream) {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  sourceNode = audioCtx.createMediaStreamSource(stream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  sourceNode.connect(analyser);

  const canvas = els.waveformCanvas;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const barCount = 40;
  const step = Math.max(1, Math.floor(bufferLength / barCount));

  function draw() {
    rafId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-strong').trim() || '#ff5a36';
    ctx.fillStyle = accent;
    const barWidth = (canvas.width / barCount) * 0.58;
    const gap = canvas.width / barCount - barWidth;
    for (let i = 0; i < barCount; i++) {
      const v = dataArray[i * step] / 255;
      const h = Math.max(canvas.height * 0.06, v * canvas.height * 0.92);
      const x = i * (barWidth + gap);
      const y = (canvas.height - h) / 2;
      const r = Math.min(barWidth / 2, h / 2);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barWidth, h, r);
      else ctx.rect(x, y, barWidth, h);
      ctx.fill();
    }
  }
  draw();
}

function stopWaveform() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch (e) {}
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {});
  }
  const canvas = els.waveformCanvas;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resetRecorderUI() {
  els.titleInput.value = '';
  finalTranscript = '';
  lastInterimText = '';
  renderTranscript('', '');
  els.timer.textContent = '00:00';
}

// After a successful save, keep the transcript visible in the recorder view
// until the user navigates to another view (see switchView()).
function resetRecorderUIAfterSave() {
  els.titleInput.value = '';
  els.timer.textContent = '00:00';
}

async function startRecording() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    showToast(t('toastMicDenied'));
    return;
  }

  chunks = [];
  const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  let chosenMime = '';
  for (const c of mimeCandidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(c)) {
      chosenMime = c;
      break;
    }
  }
  try {
    mediaRecorder = chosenMime ? new MediaRecorder(mediaStream, { mimeType: chosenMime }) : new MediaRecorder(mediaStream);
  } catch (err) {
    showToast(t('toastRecorderUnsupported'));
    mediaStream.getTracks().forEach((tr) => tr.stop());
    return;
  }
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  mediaRecorder.onstop = onRecorderStop;
  mediaRecorder.start();

  isRecording = true;
  els.appShell.classList.add('is-recording');
  els.recorderCard.dataset.recording = 'true';
  els.recordBtn.setAttribute('aria-label', t('recordStopAria'));
  els.recordHint.textContent = t('recordHintStop');
  els.waveformIdleLabel.style.display = 'none';

  finalTranscript = '';
  lastInterimText = '';
  acceptResults = true;
  renderTranscript('', '');

  startTimeMs = Date.now();
  elapsedSeconds = 0;
  els.timer.textContent = '00:00';
  timerInterval = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - startTimeMs) / 1000);
    els.timer.textContent = formatDuration(elapsedSeconds);
  }, 250);

  startWaveform(mediaStream);
  startRecognition();
}

function stopRecording() {
  if (!isRecording) return;
  isRecording = false;
  els.appShell.classList.remove('is-recording');
  els.recorderCard.dataset.recording = 'false';
  els.recordBtn.setAttribute('aria-label', t('recordStartAria'));
  els.recordHint.textContent = t('recordHintStart');
  els.waveformIdleLabel.style.display = '';

  clearInterval(timerInterval);
  stopWaveform();
  stopRecognition();

  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  else onRecorderStop();

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
}

async function onRecorderStop() {
  // Give SpeechRecognition a moment to flush its final result — otherwise the
  // last spoken segment (visible live as "interim" text) can be lost.
  await waitForRecognitionFlush();
  if (lastInterimText) {
    finalTranscript = (finalTranscript + ' ' + lastInterimText).trim() + ' ';
    lastInterimText = '';
  }
  acceptResults = false;

  const mimeType = (mediaRecorder && mediaRecorder.mimeType) || (chunks[0] && chunks[0].type) || 'audio/webm';
  const blob = new Blob(chunks, { type: mimeType });
  chunks = [];
  if (blob.size === 0) {
    showToast(t('toastEmptyDiscarded'));
    resetRecorderUI();
    return;
  }
  await saveRecording(blob, mimeType, elapsedSeconds, finalTranscript.trim());
}

async function saveRecording(blob, mimeType, durationSec, transcript) {
  const rec = {
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)),
    title: els.titleInput.value.trim() || defaultTitle(),
    createdAt: new Date().toISOString(),
    durationSec,
    transcript,
    audioBlob: blob,
    mimeType,
    status: 'pending',
    attempts: 0,
    lastError: null,
    syncedAt: null,
  };
  await dbPutRecording(rec);
  showToast(transcript ? t('toastSaved') : t('toastSavedNoTranscript'));
  resetRecorderUIAfterSave();
  await updatePendingUI();
  trySync({ silent: true });
}

els.recordBtn.addEventListener('click', () => {
  if (isRecording) stopRecording();
  else startRecording();
});

/* ==========================================================================
   History view
   ========================================================================== */
const audioUrlCache = new Map();
function getAudioUrl(rec) {
  if (!audioUrlCache.has(rec.id)) {
    audioUrlCache.set(rec.id, URL.createObjectURL(rec.audioBlob));
  }
  return audioUrlCache.get(rec.id);
}
function revokeAudioUrl(id) {
  if (audioUrlCache.has(id)) {
    URL.revokeObjectURL(audioUrlCache.get(id));
    audioUrlCache.delete(id);
  }
}

function statusLabel(status) {
  if (status === 'synced') return t('statusSynced');
  if (status === 'error') return t('statusError');
  return t('statusPending');
}

async function renderHistory() {
  const recs = await dbGetAllRecordings();
  recs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  els.historyEmptyState.hidden = recs.length > 0;
  els.recordingList.innerHTML = '';

  for (const rec of recs) {
    const card = document.createElement('div');
    card.className = 'recording-card';
    card.dataset.id = rec.id;

    const preview = rec.transcript && rec.transcript.length
      ? escapeHtml(rec.transcript.slice(0, 160))
      : `<em>${escapeHtml(t('noTranscriptPreview'))}</em>`;

    card.innerHTML = `
      <div class="recording-card-head" data-role="toggle">
        <div>
          <div class="recording-card-title">${escapeHtml(rec.title)}</div>
          <div class="recording-card-meta">
            <span>${formatDateTime(rec.createdAt)}</span>
            <span>·</span>
            <span>${formatDuration(rec.durationSec)}</span>
          </div>
          <div class="recording-card-preview">${preview}</div>
        </div>
        <span class="status-badge" data-status="${rec.status}">${statusLabel(rec.status)}</span>
      </div>
      <div class="recording-card-body">
        <audio controls src="${getAudioUrl(rec)}"></audio>
        <div class="recording-full-transcript">${rec.transcript ? escapeHtml(rec.transcript) : escapeHtml(t('noTranscriptFull'))}</div>
        ${rec.status === 'error' && rec.lastError ? `<div class="field-hint" style="color:var(--color-error)">${escapeHtml(t('lastError', rec.lastError))}</div>` : ''}
        <div class="recording-card-actions">
          <button class="small-btn" data-role="resend"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg><span data-role="resend-label">${escapeHtml(t('resend'))}</span></button>
          <button class="small-btn danger" data-role="delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
            <span data-role="delete-label">${escapeHtml(t('delete'))}</span>
          </button>
        </div>
      </div>
    `;

    card.querySelector('[data-role="toggle"]').addEventListener('click', () => {
      card.classList.toggle('is-open');
    });

    const resendBtn = card.querySelector('[data-role="resend"]');
    const resendLabel = card.querySelector('[data-role="resend-label"]');
    if (resendBtn) {
      resendBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!navigator.onLine) {
          showToast(t('toastOfflineCannotSend'));
          return;
        }
        resendBtn.disabled = true;
        if (resendLabel) resendLabel.textContent = t('resendSending');
        // Route through the same submission lock used by trySync() so a
        // manual resend can never race an in-progress automatic sync for
        // the same recording (this was the source of duplicate submissions).
        const ok = await submitRecording(rec.id);
        showToast(ok ? t('toastResendOk') : t('toastResendFail'));
        await updatePendingUI();
        await renderHistory();
      });
    }

    const deleteBtn = card.querySelector('[data-role="delete"]');
    const deleteLabel = card.querySelector('[data-role="delete-label"]');
    let deleteArmed = false;
    let armTimeout = null;
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!deleteArmed) {
        deleteArmed = true;
        deleteLabel.textContent = t('deleteConfirm');
        armTimeout = setTimeout(() => {
          deleteArmed = false;
          deleteLabel.textContent = t('delete');
        }, 3000);
        return;
      }
      clearTimeout(armTimeout);
      revokeAudioUrl(rec.id);
      await dbDeleteRecording(rec.id);
      await updatePendingUI();
      await renderHistory();
      showToast(t('toastDeleted'));
    });

    els.recordingList.appendChild(card);
  }
}

(function wireDeleteAll() {
  let armed = false;
  let armTimeout = null;
  els.deleteAllBtn.addEventListener('click', async () => {
    if (!armed) {
      armed = true;
      els.deleteAllLabel.textContent = t('deleteAllConfirm');
      armTimeout = setTimeout(() => {
        armed = false;
        els.deleteAllLabel.textContent = t('deleteAll');
      }, 3500);
      return;
    }
    clearTimeout(armTimeout);
    armed = false;
    els.deleteAllLabel.textContent = t('deleteAll');
    audioUrlCache.forEach((url) => URL.revokeObjectURL(url));
    audioUrlCache.clear();
    await dbClearRecordings();
    await updatePendingUI();
    await renderHistory();
    showToast(t('toastAllDeleted'));
  });
})();

/* ==========================================================================
   Settings
   ========================================================================== */
els.saveWebhookBtn.addEventListener('click', async () => {
  const url = els.webhookInput.value.trim();
  await dbSetSetting('webhookUrl', url);
  showToast(url ? t('toastWebhookSaved') : t('toastWebhookRemoved'));
  trySync({ silent: true });
});

els.testWebhookBtn.addEventListener('click', async () => {
  const url = els.webhookInput.value.trim();
  if (!url) {
    showToast(t('toastEnterUrlFirst'));
    return;
  }
  els.testWebhookBtn.disabled = true;
  const originalText = els.testWebhookBtn.textContent;
  els.testWebhookBtn.textContent = t('testing');
  try {
    const fd = new FormData();
    fd.append('id', 'test-' + Date.now());
    fd.append('title', t('testWebhookTitle'));
    fd.append('createdAt', new Date().toISOString());
    fd.append('durationSec', '0');
    fd.append('transcript', t('testWebhookTranscript'));
    fd.append('source', 'qalcurate-webapp-test');
    const res = await fetch(url, { method: 'POST', body: fd });
    showToast(res.ok ? t('toastTestOk') : t('toastTestHttpError', res.status));
  } catch (err) {
    showToast(t('toastTestFailed', (err && err.message) || t('networkErrorFallback')));
  } finally {
    els.testWebhookBtn.disabled = false;
    els.testWebhookBtn.textContent = t('testConnection');
  }
});

els.langSelect.addEventListener('change', async () => {
  currentLanguage = els.langSelect.value;
  await dbSetSetting('language', currentLanguage);
  showToast(t('toastLangSaved'));
});

/* ==========================================================================
   Service worker
   ========================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* ignore — app still works without offline app-shell caching */
    });
  });
}

/* ==========================================================================
   Init
   ========================================================================== */
async function init() {
  try {
    currentUiLang = await dbGetSetting('uiLang', 'de');
  } catch (e) {
    currentUiLang = 'de';
  }
  applyTranslations();

  setConnState(navigator.onLine ? 'online' : 'offline');

  try {
    currentLanguage = await dbGetSetting('language', 'de-DE');
    els.langSelect.value = currentLanguage;
    const webhookUrl = await dbGetSetting('webhookUrl', '');
    els.webhookInput.value = webhookUrl;
  } catch (e) {
    showToast(t('toastNoStorage'));
  }

  if (!getSpeechRecognitionCtor()) {
    showAsrBanner(true, 'asrNotSupported');
  }

  await updatePendingUI();
  trySync({ silent: true });

  setInterval(() => trySync({ silent: true }), 45000);
}

init();
