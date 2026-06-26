/**
 * Manual pill rewrite persistence — same SAVE_ANNOTATIONS / LOAD_ANNOTATIONS
 * pipeline as highlights and sticky notes.
 *
 * Saves under `manualRewrites` (browser storage when unsigned in, Supabase when synced).
 */

import { buildManualInsertMark } from "../lib/insertBadge";
import { emitSaveToast } from "../lib/saveToast";

/** Stored in annotations.elements.manualRewrites */
export interface ManualRewrite {
  id: string;
  originalText: string;
  /** User-typed text shown in the DOM */
  text: string;
  /** Legacy field kept for backend mirror + older readers */
  aiText: string;
  task: "manual";
  timestamp: number;
}

const RESTORE_RETRY_MS = 2500;

function pageUrl(): string {
  return window.location.href;
}

function generateId(): string {
  return `mwr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

let sessionManualRewrites: ManualRewrite[] = [];
let restoreWatchInstalled = false;
/** Ids pushed but not yet confirmed by a load/save response — never strip these from the DOM. */
const pendingSaveIds = new Set<string>();

function mergeById(...lists: ManualRewrite[][]): ManualRewrite[] {
  const byId = new Map<string, ManualRewrite>();
  for (const list of lists) {
    for (const item of list) {
      if (item?.id) byId.set(item.id, item);
    }
  }
  return [...byId.values()];
}

function normalizeStoredRewrite(raw: unknown): ManualRewrite | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" && r.id ? r.id : null;
  if (!id) return null;
  const text =
    typeof r.text === "string"
      ? r.text
      : typeof r.aiText === "string"
        ? r.aiText
        : "";
  if (!text.trim()) return null;
  const originalText = typeof r.originalText === "string" ? r.originalText : "";
  const timestamp =
    typeof r.timestamp === "number" && Number.isFinite(r.timestamp)
      ? r.timestamp
      : Date.now();
  return {
    id,
    originalText,
    text,
    aiText: text,
    task: "manual",
    timestamp,
  };
}

function pushToBackend(list: ManualRewrite[]): void {
  sessionManualRewrites = list;
  for (const item of list) pendingSaveIds.add(item.id);
  try {
    if (!chrome.runtime?.id) return;
    chrome.runtime.sendMessage(
      {
        type: "SAVE_ANNOTATIONS",
        payload: {
          pageUrl: pageUrl(),
          featureKey: "manualRewrites",
          data: list,
          pageTitle: document.title,
          domain: window.location.hostname,
          clearedAt: list.length === 0 ? Date.now() : null,
        },
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("[Inline] Manual rewrite save failed:", chrome.runtime.lastError.message);
          return;
        }
        if (response?.ok) {
          for (const item of list) pendingSaveIds.delete(item.id);
        }
        emitSaveToast(response);
        if (!response?.ok) {
          console.error("[Inline] Manual rewrite backend sync failed:", response?.error);
        }
      },
    );
  } catch {
    /* extension context unavailable */
  }
}

function textFromManualWrapper(wrapper: HTMLElement): string {
  const mark = wrapper.querySelector(".inline-manual-text");
  return mark?.textContent ?? "";
}

function restoreOriginalInDom(wrapper: HTMLElement, originalText: string): void {
  const parent = wrapper.parentNode;
  if (!parent) return;
  parent.replaceChild(document.createTextNode(originalText), wrapper);
}

function removeManualRewriteById(id: string, knownWrapper?: HTMLElement): void {
  const stored = sessionManualRewrites.find((r) => r.id === id);
  const wrapper =
    knownWrapper ??
    (document.querySelector(
      `[data-inline-manual-id="${CSS.escape(id)}"]`,
    ) as HTMLElement | null);

  if (wrapper) {
    restoreOriginalInDom(
      wrapper,
      stored?.originalText ?? textFromManualWrapper(wrapper),
    );
  }

  pendingSaveIds.delete(id);
  pushToBackend(sessionManualRewrites.filter((r) => r.id !== id));
}

function attachRemoveHandler(wrapper: HTMLElement, id: string): void {
  if (wrapper.getAttribute("data-inline-manual-remove") === "true") return;
  wrapper.setAttribute("data-inline-manual-remove", "true");

  const mark = wrapper.querySelector(".inline-manual-text");
  if (!(mark instanceof HTMLElement)) return;

  mark.style.cursor = "pointer";
  mark.title = "Double-click to restore original text";

  mark.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeManualRewriteById(id, wrapper);
  });
}

/**
 * Record a manual rewrite after the DOM has been updated.
 * Call from SmartOverlay after inserting `buildManualInsertMark(...)).
 */
export function saveManualRewrite(
  wrapper: HTMLElement,
  originalText: string,
  insertedText: string,
): string {
  const id = generateId();
  wrapper.setAttribute("data-inline-manual-id", id);

  const entry: ManualRewrite = {
    id,
    originalText,
    text: insertedText,
    aiText: insertedText,
    task: "manual",
    timestamp: Date.now(),
  };

  const next = mergeById(sessionManualRewrites, [entry]);
  pushToBackend(next);
  attachRemoveHandler(wrapper, id);
  return id;
}

function acceptTextNode(node: Node): number {
  const parent = node.parentElement;
  if (!parent) return NodeFilter.FILTER_REJECT;
  if (parent.closest("[data-inline-manual-id]")) return NodeFilter.FILTER_REJECT;
  if (parent.closest("[data-inline-ai-id]")) return NodeFilter.FILTER_REJECT;
  if (parent.closest("#inline-extension-root")) return NodeFilter.FILTER_REJECT;
  const tag = parent.tagName;
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
    return NodeFilter.FILTER_REJECT;
  }
  return NodeFilter.FILTER_ACCEPT;
}

interface TextSegment {
  node: Text;
  start: number;
  end: number;
}

function collectTextSegments(): { full: string; segments: TextSegment[] } {
  const body = document.body;
  const segments: TextSegment[] = [];
  if (!body) return { full: "", segments };

  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode: acceptTextNode,
  });

  let full = "";
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent ?? "";
    const start = full.length;
    full += text;
    segments.push({ node, start, end: full.length });
  }

  return { full, segments };
}

function pointAtOffset(
  segments: TextSegment[],
  offset: number,
  side: "start" | "end",
): { node: Text; offset: number } | null {
  if (segments.length === 0) return null;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    if (offset > seg.start && offset < seg.end) {
      return { node: seg.node, offset: offset - seg.start };
    }
    if (offset === seg.start && side === "start") {
      return { node: seg.node, offset: 0 };
    }
    if (offset === seg.end && side === "end") {
      return { node: seg.node, offset: seg.node.length };
    }
    if (offset === seg.end && side === "start" && i + 1 < segments.length) {
      return { node: segments[i + 1]!.node, offset: 0 };
    }
  }

  const last = segments[segments.length - 1]!;
  if (offset === last.end) {
    return { node: last.node, offset: last.node.length };
  }
  return null;
}

/** Find needle even when it spans multiple text nodes (common for multi-element selections). */
function findTextRange(needle: string): Range | null {
  if (!needle.trim()) return null;
  const { full, segments } = collectTextSegments();
  if (!full) return null;

  const idx = full.indexOf(needle);
  if (idx === -1) return null;

  const start = pointAtOffset(segments, idx, "start");
  const end = pointAtOffset(segments, idx + needle.length, "end");
  if (!start || !end) return null;

  try {
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    return range;
  } catch {
    return null;
  }
}

function applyManualRewriteToDom(r: ManualRewrite): boolean {
  const existing = document.querySelector(
    `[data-inline-manual-id="${CSS.escape(r.id)}"]`,
  ) as HTMLElement | null;
  if (existing) {
    attachRemoveHandler(existing, r.id);
    return true;
  }

  const needles = [r.originalText, r.text].filter((s) => s.trim().length > 0);
  for (const needle of needles) {
    const range = findTextRange(needle);
    if (!range) continue;

    try {
      const wrapper = buildManualInsertMark(r.text, r.id, r.timestamp);
      range.deleteContents();
      range.insertNode(wrapper);
      attachRemoveHandler(wrapper, r.id);
      return true;
    } catch {
      /* range invalid — try next needle */
    }
  }
  return false;
}

function applyManualRewrites(saved: ManualRewrite[]): void {
  if (!document.body) return;
  for (const r of saved) {
    applyManualRewriteToDom(r);
  }
}

/** Remove DOM marks absent from the merged session (skip in-flight saves). */
function removeStaleManualMarks(allowedIds: Set<string>): void {
  document.querySelectorAll("[data-inline-manual-id]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const id = el.getAttribute("data-inline-manual-id");
    if (!id || allowedIds.has(id) || pendingSaveIds.has(id)) return;

    const stored = sessionManualRewrites.find((r) => r.id === id);
    restoreOriginalInDom(
      el,
      stored?.originalText ?? textFromManualWrapper(el),
    );
  });
}

function parseRemoteList(raw: unknown): ManualRewrite[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeStoredRewrite).filter((x): x is ManualRewrite => x !== null);
}

/** Older builds stored manual pill edits under aiReplacements with task === "manual". */
function parseLegacyManualFromAi(raw: unknown): ManualRewrite[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      return (item as Record<string, unknown>).task === "manual";
    })
    .map(normalizeStoredRewrite)
    .filter((x): x is ManualRewrite => x !== null);
}

function syncFromServer(remote: ManualRewrite[]): void {
  for (const r of remote) pendingSaveIds.delete(r.id);
  sessionManualRewrites = mergeById(sessionManualRewrites, remote);

  const allowedIds = new Set(sessionManualRewrites.map((r) => r.id));
  for (const id of pendingSaveIds) allowedIds.add(id);
  removeStaleManualMarks(allowedIds);

  applyManualRewrites(sessionManualRewrites);
}

function loadAndApply(): void {
  try {
    if (!chrome.runtime?.id) return;
    chrome.runtime.sendMessage(
      { type: "LOAD_ANNOTATIONS", payload: { pageUrl: pageUrl() } },
      (response) => {
        if (chrome.runtime.lastError || !response?.ok) {
          console.error(
            "[Inline] Manual rewrite load failed:",
            chrome.runtime.lastError?.message ?? response?.error,
          );
          return;
        }

        const elements = response.data?.elements ?? {};
        const fromManual = parseRemoteList(elements.manualRewrites);
        const fromLegacy = parseLegacyManualFromAi(elements.aiReplacements);
        const remote = mergeById(fromManual, fromLegacy);

        syncFromServer(remote);

        // Migrate legacy rows into the dedicated manualRewrites feature key once.
        if (fromLegacy.length > 0 && fromManual.length === 0) {
          pushToBackend(sessionManualRewrites);
        }

        document.dispatchEvent(new CustomEvent("inline:manualRewritesRestored"));
      },
    );
  } catch {
    /* extension context unavailable */
  }
}

function installRestoreWatch(): void {
  if (restoreWatchInstalled) return;
  restoreWatchInstalled = true;

  let lastUrl = pageUrl();
  const onUrlChange = () => {
    const next = pageUrl();
    if (next === lastUrl) return;
    lastUrl = next;
    sessionManualRewrites = [];
    pendingSaveIds.clear();
    restoreManualRewrites();
  };

  window.addEventListener("popstate", onUrlChange);
  window.addEventListener("hashchange", onUrlChange);

  const wrapHistory = <T extends History["pushState"]>(original: T): T =>
    ((...args: Parameters<T>) => {
      original.apply(history, args);
      onUrlChange();
    }) as T;

  try {
    history.pushState = wrapHistory(history.pushState);
    history.replaceState = wrapHistory(history.replaceState);
  } catch {
    /* read-only history in some embed contexts */
  }
}

/** Replay saved manual rewrites when the user returns to this URL. */
export function restoreManualRewrites(): void {
  installRestoreWatch();
  loadAndApply();
  window.setTimeout(loadAndApply, RESTORE_RETRY_MS);
}
