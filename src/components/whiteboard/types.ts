export type Tool = "select" | "pen" | "rectangle" | "ellipse" | "line";

export type Point = {
  x: number;
  y: number;
};

export type WhiteboardShape =
  | {
      id: string;
      type: "pen";
      points: Point[];
      stroke: string;
      strokeWidth: number;
    }
  | {
      id: string;
      type: "rectangle" | "ellipse" | "line";
      x: number;
      y: number;
      width: number;
      height: number;
      stroke: string;
      strokeWidth: number;
    };

export type DraftShape = WhiteboardShape | null;
