import type { SvgElementEntry, SvgGlobalOptions } from "./types";

const EDITABLE_TAGS = new Set([
  "path",
  "circle",
  "ellipse",
  "rect",
  "line",
  "polyline",
  "polygon",
  "text",
  "g",
]);

let gradientIdCounter = 0;

function getStyleOrAttr(el: Element, name: string): string | null {
  if (el.hasAttribute(name)) {
    return el.getAttribute(name);
  }
  const style = (el as SVGElement).style?.getPropertyValue(name);
  if (style) return style;
  return null;
}

function setStyleOrAttr(el: Element, name: string, value: string): void {
  if (name === "fill" || name === "stroke") {
    (el as SVGElement).setAttribute(name, value);
    (el as SVGElement).style?.removeProperty(name);
  } else {
    (el as SVGElement).setAttribute(name, value);
  }
}

function ensureDefs(svgRoot: SVGSVGElement): SVGDefsElement {
  let defs = svgRoot.querySelector("defs");
  if (!defs) {
    defs = svgRoot.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "defs");
    svgRoot.insertBefore(defs, svgRoot.firstChild);
  }
  return defs;
}

export function parseSvgString(svgString: string): SVGSVGElement | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) return null;
  const svg = doc.querySelector("svg");
  return svg;
}

export function isUrlRef(value: string | null): boolean {
  return typeof value === "string" && value.trim().toLowerCase().startsWith("url(");
}

function collectEditableElements(
  root: Element,
  entries: SvgElementEntry[],
  idPrefix: string,
): void {
  if (!(root instanceof Element)) return;
  const tag = root.tagName?.toLowerCase?.();
  const hasFill =
    getStyleOrAttr(root, "fill") != null || (EDITABLE_TAGS.has(tag) && tag !== "line");
  const hasStroke = getStyleOrAttr(root, "stroke") != null || EDITABLE_TAGS.has(tag);
  if (EDITABLE_TAGS.has(tag) && (hasFill || hasStroke)) {
    const id = root.id || `${idPrefix}-${entries.length}`;
    if (!root.id) (root as SVGElement).setAttribute("data-svglab-id", id);
    const fill = getStyleOrAttr(root, "fill");
    const vis = getStyleOrAttr(root, "visibility") ?? root.getAttribute("visibility");
    const hidden = vis === "hidden" || (root as SVGElement).style?.display === "none";
    entries.push({
      id,
      tagName: tag,
      fill,
      stroke: getStyleOrAttr(root, "stroke"),
      fillType: "solid",
      gradientAngle: 0,
      gradientColor1: "#000000",
      gradientColor2: "#ffffff",
      hidden,
      node: root,
    });
  }
  Array.from(root.children).forEach((child, i) => {
    collectEditableElements(child, entries, `${idPrefix}-${i}`);
  });
}

export function getEditableElements(svgRoot: SVGSVGElement): SvgElementEntry[] {
  const entries: SvgElementEntry[] = [];
  collectEditableElements(svgRoot, entries, "el");
  return entries;
}

export function setElementFill(el: Element, color: string): void {
  setStyleOrAttr(el, "fill", color);
}

export function setElementStroke(el: Element, color: string): void {
  setStyleOrAttr(el, "stroke", color);
}

export function setElementFillGradient(
  svgRoot: SVGSVGElement,
  el: Element,
  angleDeg: number,
  color1: string,
  color2: string,
): void {
  const defs = ensureDefs(svgRoot);
  const id = `svglab-grad-${++gradientIdCounter}-${Date.now()}`;
  const grad = svgRoot.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  grad.setAttribute("id", id);
  const rad = (angleDeg * Math.PI) / 180;
  const x1 = 0.5 - 0.5 * Math.cos(rad);
  const y1 = 0.5 - 0.5 * Math.sin(rad);
  const x2 = 0.5 + 0.5 * Math.cos(rad);
  const y2 = 0.5 + 0.5 * Math.sin(rad);
  grad.setAttribute("x1", String(x1));
  grad.setAttribute("y1", String(y1));
  grad.setAttribute("x2", String(x2));
  grad.setAttribute("y2", String(y2));
  grad.setAttribute("gradientUnits", "objectBoundingBox");
  const stop1 = svgRoot.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", color1);
  const stop2 = svgRoot.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", color2);
  grad.appendChild(stop1);
  grad.appendChild(stop2);
  defs.appendChild(grad);
  setStyleOrAttr(el, "fill", `url(#${id})`);
}

export function removeElement(el: Element): void {
  el.remove();
}

export function setElementHidden(el: Element, hidden: boolean): void {
  const svg = el as SVGElement;
  if (hidden) {
    svg.setAttribute("visibility", "hidden");
  } else {
    svg.removeAttribute("visibility");
    svg.style?.removeProperty("visibility");
  }
}

export function getViewBox(svgRoot: SVGSVGElement): { x: number; y: number; w: number; h: number } {
  const vb = svgRoot.getAttribute("viewBox");
  if (vb) {
    const [x, y, w, h] = vb.split(/\s+/).map(Number);
    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h)) {
      return { x, y, w, h };
    }
  }
  const w = Number(svgRoot.getAttribute("width")) || 24;
  const h = Number(svgRoot.getAttribute("height")) || 24;
  return { x: 0, y: 0, w, h };
}

export function serializeSvg(
  svgRoot: SVGSVGElement,
  options?: SvgGlobalOptions | null,
): string {
  if (!options?.background && options?.padding === undefined && options?.rotation === undefined) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgRoot);
  }
  const doc = svgRoot.ownerDocument;
  const clone = svgRoot.cloneNode(true) as SVGSVGElement;
  const { x, y, w, h } = getViewBox(clone);
  const padding = Math.max(0, options?.padding ?? 0);
  const rotation = options?.rotation ?? 0;
  const hasRotation = rotation !== 0;
  const hasPadding = padding > 0;
  const hasBackground = options?.background != null && options.background !== "";
  const padX = hasPadding ? x - padding : x;
  const padY = hasPadding ? y - padding : y;
  const padW = hasPadding ? w + 2 * padding : w;
  const padH = hasPadding ? h + 2 * padding : h;

  if (hasPadding || hasRotation) {
    const g = doc.createElementNS("http://www.w3.org/2000/svg", "g");
    while (clone.firstChild) {
      g.appendChild(clone.firstChild);
    }
    clone.appendChild(g);
    if (hasPadding) {
      g.setAttribute("transform", `translate(${padding},${padding})`);
      clone.setAttribute("viewBox", `${padX} ${padY} ${padW} ${padH}`);
      const width = clone.getAttribute("width");
      const height = clone.getAttribute("height");
      if (width && height) {
        clone.setAttribute("width", String(parseFloat(width) + 2 * padding));
        clone.setAttribute("height", String(parseFloat(height) + 2 * padding));
      }
    }
    if (hasRotation) {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const current = g.getAttribute("transform") || "";
      g.setAttribute("transform", `${current} rotate(${rotation} ${cx} ${cy})`.trim());
    }
  }

  if (hasBackground) {
    const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(padX));
    rect.setAttribute("y", String(padY));
    rect.setAttribute("width", String(padW));
    rect.setAttribute("height", String(padH));
    rect.setAttribute("fill", options!.background!);
    clone.insertBefore(rect, clone.firstChild);
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

export function getPreviewClone(
  svgRoot: SVGSVGElement,
  options?: SvgGlobalOptions | null,
): SVGSVGElement {
  if (!options?.background && options?.padding === undefined && options?.rotation === undefined) {
    return svgRoot.cloneNode(true) as SVGSVGElement;
  }
  const doc = svgRoot.ownerDocument;
  const clone = svgRoot.cloneNode(true) as SVGSVGElement;
  const { x, y, w, h } = getViewBox(clone);
  const padding = Math.max(0, options?.padding ?? 0);
  const rotation = options?.rotation ?? 0;
  const hasRotation = rotation !== 0;
  const hasPadding = padding > 0;
  const hasBackground = options?.background != null && options.background !== "";
  const padX = hasPadding ? x - padding : x;
  const padY = hasPadding ? y - padding : y;
  const padW = hasPadding ? w + 2 * padding : w;
  const padH = hasPadding ? h + 2 * padding : h;

  if (hasPadding || hasRotation) {
    const g = doc.createElementNS("http://www.w3.org/2000/svg", "g");
    while (clone.firstChild) {
      g.appendChild(clone.firstChild);
    }
    clone.appendChild(g);
    if (hasPadding) {
      g.setAttribute("transform", `translate(${padding},${padding})`);
      clone.setAttribute("viewBox", `${padX} ${padY} ${padW} ${padH}`);
      const width = clone.getAttribute("width");
      const height = clone.getAttribute("height");
      if (width && height) {
        clone.setAttribute("width", String(parseFloat(width) + 2 * padding));
        clone.setAttribute("height", String(parseFloat(height) + 2 * padding));
      }
    }
    if (hasRotation) {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const current = g.getAttribute("transform") || "";
      g.setAttribute("transform", `${current} rotate(${rotation} ${cx} ${cy})`.trim());
    }
  }

  if (hasBackground) {
    const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(padX));
    rect.setAttribute("y", String(padY));
    rect.setAttribute("width", String(padW));
    rect.setAttribute("height", String(padH));
    rect.setAttribute("fill", options!.background!);
    clone.insertBefore(rect, clone.firstChild);
  }

  return clone;
}

export function replaceAllFill(
  entries: SvgElementEntry[],
  color: string,
): void {
  entries.forEach((e) => setElementFill(e.node, color));
}

export function replaceAllStroke(
  entries: SvgElementEntry[],
  color: string,
): void {
  entries.forEach((e) => setElementStroke(e.node, color));
}

const XLINK_NS = "http://www.w3.org/1999/xlink";

export function getEmbeddedImageFromRect(
  svgRoot: SVGSVGElement,
  el: Element,
): SVGImageElement | null {
  const tag = el.tagName?.toLowerCase?.();
  if (tag !== "rect") return null;
  const fill = getStyleOrAttr(el, "fill");
  if (!fill || !fill.trim().toLowerCase().startsWith("url(")) return null;
  const match = fill.match(/url\s*\(\s*#([^)]+)\s*\)/);
  if (!match) return null;
  const patternId = match[1].trim();
  const pattern = svgRoot.getElementById(patternId);
  if (!pattern) return null;
  const use = pattern.querySelector("use");
  const imageEl = use
    ? (() => {
        const href = use.getAttributeNS(XLINK_NS, "href") ?? use.getAttribute("href");
        if (!href || !href.startsWith("#")) return null;
        const id = href.slice(1).trim();
        return svgRoot.getElementById(id);
      })()
    : pattern.querySelector("image");
  if (!imageEl || imageEl.tagName?.toLowerCase() !== "image") return null;
  const img = imageEl as SVGImageElement;
  const href = img.getAttributeNS(XLINK_NS, "href") ?? img.getAttribute("href") ?? "";
  if (!href.startsWith("data:")) return null;
  return img;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace(/^#/, "");
  if (h.length !== 6 && h.length !== 3) return null;
  const parse = (s: string) => parseInt(s, 16);
  let r: number, g: number, b: number;
  if (h.length === 6) {
    r = parse(h.slice(0, 2));
    g = parse(h.slice(2, 4));
    b = parse(h.slice(4, 6));
  } else {
    r = parse(h[0] + h[0]);
    g = parse(h[1] + h[1]);
    b = parse(h[2] + h[2]);
  }
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

export function recolorEmbeddedImage(
  dataUrl: string,
  fromColorHex: string,
  toColorHex: string,
  tolerance = 40,
): Promise<string> {
  const fromRgb = hexToRgb(fromColorHex);
  const toRgb = hexToRgb(toColorHex);
  if (!fromRgb || !toRgb) return Promise.reject(new Error("Invalid hex color"));
  const tr = toRgb.r, tg = toRgb.g, tb = toRgb.b;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2d not available"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = data.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
          if (a < 128) continue;
          const dr = Math.abs(r - fromRgb.r), dg = Math.abs(g - fromRgb.g), db = Math.abs(b - fromRgb.b);
          if (dr <= tolerance && dg <= tolerance && db <= tolerance) {
            d[i] = tr;
            d[i + 1] = tg;
            d[i + 2] = tb;
          }
        }
        ctx.putImageData(data, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}
