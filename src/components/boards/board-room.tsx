"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Whiteboard } from "@/components/whiteboard/whiteboard";
import type { WhiteboardShape } from "@/components/whiteboard/types";
import "./boards.css";

type BoardDetail = {
  id: string;
  name: string;
  guestName: string | null;
  shapes: WhiteboardShape[];
  updatedAt: string;
};

export function BoardRoom({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadBoard = async () => {
      try {
        const response = await fetch(`/api/boards/${boardId}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load board.");
        const data = (await response.json()) as { board: BoardDetail };
        if (mounted) setBoard(data.board);
      } catch {
        if (mounted) setError("房间加载失败，请确认房间存在且数据库连接正常。");
      }
    };

    void loadBoard();

    return () => {
      mounted = false;
    };
  }, [boardId]);

  const saveShapes = useCallback(
    async (shapes: WhiteboardShape[]) => {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shapes }),
      });

      if (!response.ok) throw new Error("Failed to save board.");
      const data = (await response.json()) as { board: BoardDetail };
      setBoard((current) => (current ? { ...current, updatedAt: data.board.updatedAt } : current));
    },
    [boardId],
  );

  if (error) {
    return (
      <main className="boards-shell">
        <p className="boards-error">{error}</p>
      </main>
    );
  }

  if (!board) {
    return (
      <main className="boards-shell">
        <div className="empty-state">
          <Loader2 className="spin" size={22} />
          <span>正在加载白板房间...</span>
        </div>
      </main>
    );
  }

  return (
    <Whiteboard
      backHref="/boards"
      boardTitle={board.name}
      description="房间数据已接入 API 和 PostgreSQL；当前仍是单人编辑，实时协作会在下一阶段加入。"
      initialShapes={board.shapes}
      onSave={saveShapes}
      persistence="remote"
      phaseLabel="Phase 2"
      saveLabel="数据库保存"
      toolbarExtra={
        <div className="room-meta">
          <span>房间 ID</span>
          <code>{board.id}</code>
          {board.guestName ? <small>游客：{board.guestName}</small> : null}
        </div>
      }
    />
  );
}
