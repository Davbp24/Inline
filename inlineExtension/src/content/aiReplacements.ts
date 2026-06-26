/**
 * AI text replacement persistence → `aiReplacements` feature key.
 * Manual pill rewrites live in manualRewrites.ts.
 */

import { buildAIInsertMark } from "../lib/insertBadge";
import { emitSaveToast } from "../lib/saveToast";

export interface AIReplacement {
  id: string;
  originalText: string;
  aiText: string;
  task: string;
  instruction?: string;
  timestamp: number;
}

const PAGE_URL = window.location.href;
const RESTORE_RETRY_MS = 2500;

let sessionAiReplacements: AIReplacement[] = [];

function replacementId(): string {
  return `air-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function mergeById(...lists: AIReplacement[][]): AIReplacement[] {
  const byId = new Map<string, AIReplacement>();
  for (const list of lists) {
    for (const item of list) {
      if (item?.id) byId.set(item.id, item);
    }
  }
  return [...byId.values()];
}

function pushAnnotations(list: AIReplacement[]): void {
  sessionAiReplacements = list;
  try {
    if (!chrome.runtime?.id) return;
    chrome.runtime.sendMessage(
      {
        type: "SAVE_ANNOTATIONS",
        payload: {
          pageUrl: PAGE_URL,
          featureKey: "aiReplacements",
          data: list,
          pageTitle: document.title,
          domain: window.location.hostname,
          clearedAt: list.length === 0 ? Date.now() : null,
        },
      },
      (response) => {
        emitSaveToast(response);
        if (chrome.runtime.lastError) {
          console.error("[Inline] Save failed:", chrome.runtime.lastError.message);
        } else if (!response?.ok) {
          console.error("[Inline] Backend sync failed:", response?.error);
        }
      },
    );
  } catch {
    /* extension context unavailable */
  }
}

function loadAndApplyAi(): void {
  try {
    if (!chrome.runtime?.id) return;
    chrome.runtime.sendMessage(
      { type: "LOAD_ANNOTATIONS", payload: { pageUrl: PAGE_URL } },
      (response) => {
        if (chrome.runtime.lastError || !response?.ok) return;
        const raw = response.data?.elements?.aiReplacements;
        if (!Array.isArray(raw) || raw.length === 0) return;
        const aiRemote = (raw as AIReplacement[]).filter((r) => r.task !== "manual");
        sessionAiReplacements = mergeById(sessionAiReplacements, aiRemote);
        applyAiReplacements(sessionAiReplacements);
      },
    );
  } catch {
    /* extension context unavailable */
  }
}

export function saveAIReplacement(
  mark: HTMLElement,
  originalText: string,
  aiText: string,
  task: string,
  instruction?: string,
): string {
  const id = replacementId();
  mark.setAttribute("data-inline-ai-id", id);

  const entry: AIReplacement = {
    id,
    originalText,
    aiText,
    task,
    instruction,
    timestamp: Date.now(),
  };

  const next = mergeById(sessionAiReplacements, [entry]);
  pushAnnotations(next);
  attachRemoveHandler(mark, id);
  return id;
}

function removeAiReplacementById(id: string): void {
  const next = sessionAiReplacements.filter((r) => r.id !== id);
  pushAnnotations(next);
}

function attachRemoveHandler(mark: HTMLElement, id: string): void {
  mark.style.cursor = "pointer";

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    const isBadge = target?.classList.contains("inline-ai-remove-badge");
    if (!isBadge && !e.altKey) return;
    e.preventDefault();
    e.stopPropagation();

    const stored = sessionAiReplacements.find((r) => r.id === id);
    removeAiReplacementById(id);

    const parent = mark.parentNode;
    if (!parent) return;
    const text = document.createTextNode(
      stored?.originalText ?? mark.textContent ?? "",
    );
    parent.replaceChild(text, mark);
  };

  mark.addEventListener("click", onClick);

  const badge = document.createElement("span");
  badge.className = "inline-ai-remove-badge";
  badge.textContent = "×";
  badge.setAttribute("aria-label", "Remove this edit");
  badge.title = "Remove this edit";
  badge.style.cssText = [
    "display:none",
    "position:absolute",
    "top:-10px",
    "right:-8px",
    "width:18px",
    "height:18px",
    "border-radius:9999px",
    "background:#1C1E26",
    "color:#fff",
    "font:600 11px/18px system-ui,sans-serif",
    "text-align:center",
    "cursor:pointer",
    "user-select:none",
    "box-shadow:none",
    "z-index:2147483646",
  ].join(";");

  if (!mark.style.position) mark.style.position = "relative";
  mark.appendChild(badge);
  mark.addEventListener("mouseenter", () => {
    badge.style.display = "inline-block";
  });
  mark.addEventListener("mouseleave", () => {
    badge.style.display = "none";
  });
}

export function restoreAIReplacements(): void {
  loadAndApplyAi();
  window.setTimeout(loadAndApplyAi, RESTORE_RETRY_MS);
}

function applyAiReplacements(list: AIReplacement[]): void {
  const body = document.body;
  if (!body) return;

  for (const r of list) {
    if (!r.originalText?.trim() || r.task === "manual") continue;
    if (r.originalText.length < 3) continue;
    if (document.querySelector(`[data-inline-ai-id="${CSS.escape(r.id)}"]`)) continue;

    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("[data-inline-ai-id]")) return NodeFilter.FILTER_REJECT;
        if (parent.closest("[data-inline-manual-id]")) return NodeFilter.FILTER_REJECT;
        if (parent.closest("#inline-extension-root")) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const idx = node.textContent?.indexOf(r.originalText) ?? -1;
      if (idx === -1) continue;

      try {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + r.originalText.length);
        const mark = buildAIInsertMark(r.aiText, r.task, r.instruction);
        mark.setAttribute("data-inline-ai-id", r.id);
        range.deleteContents();
        range.insertNode(mark);
        attachRemoveHandler(mark, r.id);
      } catch {
        /* range invalid */
      }
      break;
    }
  }
}
