import { NextRequest, NextResponse } from "next/server";
import { serializeBoardDetail, serializeBoardSummary, type WhiteboardRoomRecord } from "@/lib/boards";
import { prisma } from "@/lib/prisma";
import { parseWhiteboardShapes } from "@/lib/whiteboard-shapes";

export const dynamic = "force-dynamic";

export async function GET() {
  const boards = await prisma.whiteboardRoom.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json({
    boards: (boards as WhiteboardRoomRecord[]).map(serializeBoardSummary),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    guestName?: unknown;
    shapes?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const guestName = typeof body?.guestName === "string" ? body.guestName.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Board name is required." }, { status: 400 });
  }

  const board = await prisma.whiteboardRoom.create({
    data: {
      name: name.slice(0, 80),
      guestName: guestName ? guestName.slice(0, 40) : null,
      shapes: parseWhiteboardShapes(body?.shapes),
    },
  });

  return NextResponse.json(
    {
      board: serializeBoardDetail(board as WhiteboardRoomRecord),
    },
    { status: 201 },
  );
}
