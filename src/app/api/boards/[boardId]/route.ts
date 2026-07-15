import { NextRequest, NextResponse } from "next/server";
import { serializeBoardDetail, type WhiteboardRoomRecord } from "@/lib/boards";
import { prisma } from "@/lib/prisma";
import { parseWhiteboardShapes } from "@/lib/whiteboard-shapes";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    boardId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { boardId } = await context.params;
  const board = await prisma.whiteboardRoom.findUnique({
    where: {
      id: boardId,
    },
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  return NextResponse.json({
    board: serializeBoardDetail(board as WhiteboardRoomRecord),
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { boardId } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    shapes?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const shapes = Array.isArray(body?.shapes) ? parseWhiteboardShapes(body.shapes) : undefined;

  if (name === "" && shapes === undefined) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const board = await prisma.whiteboardRoom
    .update({
      where: {
        id: boardId,
      },
      data: {
        ...(name ? { name: name.slice(0, 80) } : {}),
        ...(shapes ? { shapes } : {}),
      },
    })
    .catch(() => null);

  if (!board) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  return NextResponse.json({
    board: serializeBoardDetail(board as WhiteboardRoomRecord),
  });
}
