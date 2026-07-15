import { countWhiteboardShapes, parseWhiteboardShapes } from "@/lib/whiteboard-shapes";

export type WhiteboardRoomRecord = {
  id: string;
  name: string;
  guestName: string | null;
  shapes: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeBoardSummary(board: WhiteboardRoomRecord) {
  return {
    id: board.id,
    name: board.name,
    guestName: board.guestName,
    shapeCount: countWhiteboardShapes(board.shapes),
    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
  };
}

export function serializeBoardDetail(board: WhiteboardRoomRecord) {
  return {
    id: board.id,
    name: board.name,
    guestName: board.guestName,
    shapes: parseWhiteboardShapes(board.shapes),
    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
  };
}
