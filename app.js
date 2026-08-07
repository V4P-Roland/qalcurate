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

  toastStack: $('#toastStack'),
};

/* ---------------- Theme ---------------- */
(function initTheme() {
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  applyThemeIcon(theme);

  els.themeToggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    applyThemeIcon(theme);
  });

  function applyThemeIcon(t) {
    els.themeToggle.setAttribute('aria-label', 'Zu ' + (t === 'dark' ? 'hellem' : 'dunklem') + ' Modus wechseln');
    els.themeToggle.innerHTML =
      t === 'dark'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
})();

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
}
function closeSideMenu() {
  els.sideMenu.classList.remove('is-open');
  els.sideMenu.setAttribute('aria-hidden', 'true');
  els.sideMenuBackdrop.hidden = true;
  els.menuToggle.setAttribute('aria-expanded', 'false');
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
    return new Date(iso).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
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
  return 'Gespräch vom ' + new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
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
  els.statusChip.dataset.state = state;
  els.pendingChip.dataset.state = state === 'syncing' ? 'syncing' : state;
  const label = state === 'online' ? 'Online' : state === 'syncing' ? 'Synchronisiere…' : 'Offline';
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
    els.pendingChipLabel.textContent = `${count} ausstehend`;
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
    showToast('Bitte zuerst eine Webhook-URL in den Einstellungen speichern.');
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
    rec.lastError = (err && err.message) || 'Unbekannter Fehler';
    await dbPutRecording(rec);
    return false;
  }
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
      const ok = await syncOne(rec, webhookUrl);
      if (ok) okCount++;
    }
    setConnState(navigator.onLine ? 'online' : 'offline');
    await updatePendingUI();
    await renderHistory();
    if (!silent && okCount > 0) {
      showToast(`${okCount} Aufnahme(n) übermittelt.`);
    } else if (!silent && okCount === 0) {
      showToast('Übermittlung fehlgeschlagen. Wird später erneut versucht.');
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

function showAsrBanner(show, text) {
  els.asrBanner.hidden = !show;
  if (text) els.asrBannerText.textContent = text;
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
      showAsrBanner(true, 'Transkription momentan nicht verfügbar (keine Verbindung). Die Audioaufnahme läuft weiter und wird gespeichert.');
    } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      recognitionShouldRestart = false;
      showAsrBanner(true, 'Zugriff auf die Spracherkennung wurde verweigert. Die Audioaufnahme läuft weiter.');
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
    showAsrBanner(true, 'Live-Transkription wird von diesem Browser nicht unterstützt. Die Audioaufnahme funktioniert trotzdem — installiere die App am besten in Chrome oder Edge für Live-Transkription.');
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
    showToast('Mikrofonzugriff wurde verweigert oder ist nicht verfügbar.');
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
    showToast('Aufnahme wird von diesem Browser nicht unterstützt.');
    mediaStream.getTracks().forEach((t) => t.stop());
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
  els.recordBtn.setAttribute('aria-label', 'Aufnahme beenden');
  els.recordHint.textContent = 'Tippen, um die Aufnahme zu beenden';
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
  els.recordBtn.setAttribute('aria-label', 'Aufnahme starten');
  els.recordHint.textContent = 'Tippen, um die Aufnahme zu starten';
  els.waveformIdleLabel.style.display = '';

  clearInterval(timerInterval);
  stopWaveform();
  stopRecognition();

  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  else onRecorderStop();

  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
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
    showToast('Aufnahme war leer und wurde verworfen.');
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
  showToast(transcript ? 'Aufnahme gespeichert.' : 'Aufnahme gespeichert (ohne Transkript).');
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
  if (status === 'synced') return 'Gesendet';
  if (status === 'error') return 'Fehler';
  return 'Ausstehend';
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
      : '<em>Kein Transkript verfügbar — Audio wurde trotzdem gespeichert.</em>';

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
        <div class="recording-full-transcript">${rec.transcript ? escapeHtml(rec.transcript) : 'Kein Transkript verfügbar.'}</div>
        ${rec.status === 'error' && rec.lastError ? `<div class="field-hint" style="color:var(--color-error)">Letzter Fehler: ${escapeHtml(rec.lastError)}</div>` : ''}
        <div class="recording-card-actions">
          <button class="small-btn" data-role="resend"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>Erneut senden</button>
          <button class="small-btn danger" data-role="delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
            <span data-role="delete-label">Löschen</span>
          </button>
        </div>
      </div>
    `;

    card.querySelector('[data-role="toggle"]').addEventListener('click', () => {
      card.classList.toggle('is-open');
    });

    const resendBtn = card.querySelector('[data-role="resend"]');
    if (resendBtn) {
      resendBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!navigator.onLine) {
          showToast('Keine Verbindung — Übermittlung kann nicht gestartet werden.');
          return;
        }
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sende…';
        const fresh = (await dbGetAllRecordings()).find((r) => r.id === rec.id);
        const ok = fresh ? await syncOne(fresh) : false;
        showToast(ok ? 'Übermittlung erfolgreich.' : 'Übermittlung fehlgeschlagen.');
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
        deleteLabel.textContent = 'Wirklich löschen?';
        armTimeout = setTimeout(() => {
          deleteArmed = false;
          deleteLabel.textContent = 'Löschen';
        }, 3000);
        return;
      }
      clearTimeout(armTimeout);
      revokeAudioUrl(rec.id);
      await dbDeleteRecording(rec.id);
      await updatePendingUI();
      await renderHistory();
      showToast('Aufnahme gelöscht.');
    });

    els.recordingList.appendChild(card);
  }
}

(function wireDeleteAll() {
  let armed = false;
  let armTimeout = null;
  const originalText = els.deleteAllLabel.textContent;
  els.deleteAllBtn.addEventListener('click', async () => {
    if (!armed) {
      armed = true;
      els.deleteAllLabel.textContent = 'Wirklich alle löschen?';
      armTimeout = setTimeout(() => {
        armed = false;
        els.deleteAllLabel.textContent = originalText;
      }, 3500);
      return;
    }
    clearTimeout(armTimeout);
    armed = false;
    els.deleteAllLabel.textContent = originalText;
    audioUrlCache.forEach((url) => URL.revokeObjectURL(url));
    audioUrlCache.clear();
    await dbClearRecordings();
    await updatePendingUI();
    await renderHistory();
    showToast('Alle Aufnahmen wurden gelöscht.');
  });
})();

/* ==========================================================================
   Settings
   ========================================================================== */
els.saveWebhookBtn.addEventListener('click', async () => {
  const url = els.webhookInput.value.trim();
  await dbSetSetting('webhookUrl', url);
  showToast(url ? 'Webhook-URL gespeichert.' : 'Webhook-URL entfernt.');
  trySync({ silent: true });
});

els.testWebhookBtn.addEventListener('click', async () => {
  const url = els.webhookInput.value.trim();
  if (!url) {
    showToast('Bitte zuerst eine URL eingeben.');
    return;
  }
  els.testWebhookBtn.disabled = true;
  const originalText = els.testWebhookBtn.textContent;
  els.testWebhookBtn.textContent = 'Teste…';
  try {
    const fd = new FormData();
    fd.append('id', 'test-' + Date.now());
    fd.append('title', 'Qalcurate Verbindungstest');
    fd.append('createdAt', new Date().toISOString());
    fd.append('durationSec', '0');
    fd.append('transcript', 'Dies ist eine Testübermittlung von Qalcurate.');
    fd.append('source', 'qalcurate-webapp-test');
    const res = await fetch(url, { method: 'POST', body: fd });
    showToast(res.ok ? 'Verbindung erfolgreich — das Zielsystem hat geantwortet.' : `Das Zielsystem antwortete mit Fehler: HTTP ${res.status}`);
  } catch (err) {
    showToast('Verbindung fehlgeschlagen: ' + ((err && err.message) || 'Netzwerkfehler'));
  } finally {
    els.testWebhookBtn.disabled = false;
    els.testWebhookBtn.textContent = originalText;
  }
});

els.langSelect.addEventListener('change', async () => {
  currentLanguage = els.langSelect.value;
  await dbSetSetting('language', currentLanguage);
  showToast('Sprache gespeichert.');
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
  setConnState(navigator.onLine ? 'online' : 'offline');

  try {
    currentLanguage = await dbGetSetting('language', 'de-DE');
    els.langSelect.value = currentLanguage;
    const webhookUrl = await dbGetSetting('webhookUrl', '');
    els.webhookInput.value = webhookUrl;
  } catch (e) {
    showToast('Lokaler Speicher (IndexedDB) ist in dieser Umgebung nicht verfügbar.');
  }

  if (!getSpeechRecognitionCtor()) {
    showAsrBanner(true, 'Live-Transkription wird von diesem Browser nicht unterstützt. Die Audioaufnahme funktioniert trotzdem — installiere die App am besten in Chrome oder Edge für Live-Transkription.');
  }

  await updatePendingUI();
  trySync({ silent: true });

  setInterval(() => trySync({ silent: true }), 45000);
}

init();
