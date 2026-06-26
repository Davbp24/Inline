/**
 * When the user accepts an AI output ("Insert" in AI.tsx / Rewrite.tsx), the
 * inserted text is wrapped in a styled <mark> element so it's visible as an
 * AI edit and the action performed (Summarize, Rephrase, Shorten, etc.)
 * shows as a native tooltip on hover.
 *
 * Style is kept inline so it survives any content-script CSP the host page
 * applies. The <mark> gets a data-inline-ai attribute to make it easy to find
 * if the user wants to undo.
 */

const ACTION_COLORS: Record<string, { bg: string; border: string }> = {
  rephrase: {
    bg: "rgba(167, 139, 250, 0.25)",
    border: "rgba(139, 92, 246, 0.5)",
  },
  shorten: { bg: "rgba(251, 191, 36, 0.3)", border: "rgba(217, 119, 6, 0.5)" },
  summarize: {
    bg: "rgba(110, 231, 183, 0.3)",
    border: "rgba(5, 150, 105, 0.5)",
  },
  rewrite: {
    bg: "rgba(147, 197, 253, 0.3)",
    border: "rgba(37, 99, 235, 0.55)",
  },
  custom: {
    bg: "rgba(248, 180, 217, 0.35)",
    border: "rgba(236, 72, 153, 0.55)",
  },
  default: { bg: "rgba(244, 231, 211, 0.4)", border: "rgba(161, 98, 7, 0.4)" },
};

const ACTION_LABEL: Record<string, string> = {
  rephrase: "Rephrased by Inline AI",
  shorten: "Shortened by Inline AI",
  summarize: "Summarized by Inline AI",
  rewrite: "Rewritten by Inline AI",
  custom: "Custom AI prompt applied",
};

export function buildAIInsertMark(
  text: string,
  task: string,
  instruction?: string,
): HTMLElement {
  const key = ACTION_COLORS[task] ? task : "default";
  const palette = ACTION_COLORS[key];
  const label = ACTION_LABEL[task] ?? "Inline AI edit";
  const tipExtra = instruction ? ` — ${instruction.slice(0, 120)}` : "";

  const mark = document.createElement("mark");
  mark.setAttribute("data-inline-ai", task || "edit");
  mark.setAttribute("title", `${label}${tipExtra}`);
  mark.setAttribute("aria-label", label);
  mark.style.background = palette.bg;
  mark.style.borderBottom = `1.5px solid ${palette.border}`;
  mark.style.borderRadius = "3px";
  mark.style.padding = "0 2px";
  mark.style.color = "inherit";
  mark.style.transition = "background 120ms ease";
  mark.textContent = text;

  // Subtle glow on hover to reinforce that the span is meaningful.
  mark.addEventListener("mouseenter", () => {
    mark.style.boxShadow = `0 0 0 2px ${palette.border}`;
  });
  mark.addEventListener("mouseleave", () => {
    mark.style.boxShadow = "none";
  });

  return mark;
}

const MANUAL_STYLE_ID = "inline-manual-insert-styles";

const MANUAL_INSERT_CSS = `
.inline-manual-wrap {
  display: inline;
  position: relative;
  vertical-align: baseline;
}
.inline-manual-wrap .inline-manual-text {
  background: rgba(147, 197, 253, 0.3);
  border-bottom: 1.5px solid rgba(37, 99, 235, 0.55);
  border-radius: 3px;
  padding: 0 2px;
  color: inherit;
  transition: box-shadow 180ms ease, background 180ms ease;
}
.inline-manual-wrap:hover .inline-manual-text,
.inline-manual-wrap:focus-within .inline-manual-text {
  background: rgba(147, 197, 253, 0.42);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.28);
}
.inline-manual-popover {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  z-index: 2147483640;
  pointer-events: none;
  min-width: 148px;
  max-width: 220px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(37, 99, 235, 0.22);
  box-shadow: 0 4px 16px rgba(28, 30, 38, 0.14);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-5px) scale(0.97);
  transform-origin: top left;
  transition:
    opacity 200ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s linear 220ms;
}
.inline-manual-popover--above {
  top: auto;
  bottom: calc(100% + 5px);
  transform-origin: bottom left;
  transform: translateY(5px) scale(0.97);
}
.inline-manual-wrap:hover .inline-manual-popover,
.inline-manual-wrap:focus-within .inline-manual-popover {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  transition:
    opacity 200ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s linear 0s;
}
.inline-manual-wrap:hover .inline-manual-popover--above,
.inline-manual-wrap:focus-within .inline-manual-popover--above {
  transform: translateY(0) scale(1);
}
.inline-manual-popover-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: #2563eb;
  line-height: 1.3;
  letter-spacing: 0.01em;
}
.inline-manual-popover-time {
  display: block;
  font-size: 10px;
  color: #78716c;
  font-style: italic;
  line-height: 1.35;
  margin-top: 2px;
}
`;

function ensureManualInsertStyles(): void {
  let style = document.getElementById(MANUAL_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = MANUAL_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = MANUAL_INSERT_CSS;
}

function formatManualEditTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function positionManualPopover(wrapper: HTMLElement, popover: HTMLElement): void {
  popover.classList.remove("inline-manual-popover--above");
  const wrapRect = wrapper.getBoundingClientRect();
  const estimatedH = 44;
  if (wrapRect.bottom + estimatedH + 8 > window.innerHeight && wrapRect.top > estimatedH + 8) {
    popover.classList.add("inline-manual-popover--above");
  }
}

/** Manual pill rewrite — highlighted text in flow; meta popover on hover. */
export function buildManualInsertMark(
  text: string,
  id?: string,
  timestamp?: number,
): HTMLElement {
  ensureManualInsertStyles();

  const ts = timestamp ?? Date.now();
  const timeLabel = formatManualEditTime(ts);
  const wrapper = document.createElement("span");
  wrapper.className = "inline-manual-wrap";
  wrapper.setAttribute("data-inline-manual", "true");
  if (id) wrapper.setAttribute("data-inline-manual-id", id);
  wrapper.setAttribute("tabindex", "0");
  wrapper.setAttribute("aria-label", `Manual edit via Inline, ${timeLabel}`);

  const mark = document.createElement("mark");
  mark.className = "inline-manual-text";
  mark.textContent = text;

  const popover = document.createElement("span");
  popover.className = "inline-manual-popover";
  popover.setAttribute("role", "tooltip");

  const label = document.createElement("span");
  label.className = "inline-manual-popover-label";
  label.textContent = "Manual edit via Inline";

  const time = document.createElement("span");
  time.className = "inline-manual-popover-time";
  time.textContent = timeLabel;

  popover.appendChild(label);
  popover.appendChild(time);

  wrapper.appendChild(mark);
  wrapper.appendChild(popover);

  const onShow = () => positionManualPopover(wrapper, popover);
  wrapper.addEventListener("mouseenter", onShow);
  wrapper.addEventListener("focusin", onShow);

  return wrapper;
}
