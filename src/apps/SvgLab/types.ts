/** Fill type: solid color or linear gradient */
export type FillType = "solid" | "gradient";

/** Element entry for simple mode: we track id, tagName, fill/stroke (or gradient) for editing */
export type SvgElementEntry = {
  id: string;
  tagName: string;
  fill: string | null;
  stroke: string | null;
  /** When "gradient", fill is ignored and gradient* are used */
  fillType: FillType;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  /** When true, element is hidden (visibility) but not removed */
  hidden: boolean;
  node: Element;
};

/** Global options applied on export/preview (Iconizer-style) */
export type SvgGlobalOptions = {
  background: string | null;
  padding: number;
  rotation: number;
};
