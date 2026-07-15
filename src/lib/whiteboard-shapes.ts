import type { WhiteboardShape } from "@/components/whiteboard/types";

const shapeTypes = new Set(["pen", "rectangle", "ellipse", "line"]);

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isWhiteboardShape(value: unknown): value is WhiteboardShape {
  if (!value || typeof value !== "object") return false;

  const shape = value as Record<string, unknown>;
  if (!isString(shape.id) || !isString(shape.type) || !shapeTypes.has(shape.type)) return false;
  if (!isString(shape.stroke) || !isNumber(shape.strokeWidth)) return false;

  if (shape.type === "pen") {
    return (
      Array.isArray(shape.points) &&
      shape.points.every((point) => {
        if (!point || typeof point !== "object") return false;
        const candidate = point as Record<string, unknown>;
        return isNumber(candidate.x) && isNumber(candidate.y);
      })
    );
  }

  return (
    isNumber(shape.x) &&
    isNumber(shape.y) &&
    isNumber(shape.width) &&
    isNumber(shape.height)
  );
}

export function parseWhiteboardShapes(value: unknown): WhiteboardShape[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isWhiteboardShape);
}

export function countWhiteboardShapes(value: unknown) {
  return parseWhiteboardShapes(value).length;
}
