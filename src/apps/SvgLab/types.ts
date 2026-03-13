export type FillType = "solid" | "gradient";

export type SvgElementEntry = {
  id: string;
  tagName: string;
  fill: string | null;
  stroke: string | null;
  fillType: FillType;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  hidden: boolean;
  node: Element;
};

export type SvgGlobalOptions = {
  background: string | null;
  padding: number;
  rotation: number;
};
