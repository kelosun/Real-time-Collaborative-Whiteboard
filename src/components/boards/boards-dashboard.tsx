"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Plus, RefreshCw } from "lucide-react";
import "./boards.css";

type BoardSummary = {
  id: string;
  name: string;
  guestName: string | null;
  shapeCount: number;
  createdAt: string;
  updatedAt: string;
};

export function BoardsDashboard() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [name, setName] = useState("产品讨论白板");
  const [guestName, setGuestName] = useState("Guest");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/boards", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load boards.");
      const data = (await response.json()) as { boards: BoardSummary[] };
      setBoards(data.boards);
    } catch {
      setError("房间列表加载失败，请确认数据库已连接并完成 Prisma 迁移。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBoards();
  }, []);

  const createBoard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          guestName,
          shapes: [],
        }),
      });

      if (!response.ok) throw new Error("Failed to create board.");
      const data = (await response.json()) as { board: BoardSummary };
      window.location.href = `/boards/${data.board.id}`;
    } catch {
      setError("创建房间失败，请检查房间名称和数据库连接。");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="boards-shell">
      <section className="boards-intro">
        <p className="eyebrow">Phase 2</p>
        <h1>白板房间</h1>
        <p>
          当前阶段加入基础后端和 PostgreSQL 持久化。创建一个房间后，白板内容会通过
          API 自动保存到数据库。
        </p>
      </section>

      <section className="create-board-panel" aria-label="创建白板房间">
        <form onSubmit={createBoard}>
          <label>
            <span>房间名称</span>
            <input
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：产品评审白板"
              required
              value={name}
            />
          </label>
          <label>
            <span>游客昵称</span>
            <input
              maxLength={40}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder="例如：Kelo"
              value={guestName}
            />
          </label>
          <button disabled={isCreating} type="submit">
            {isCreating ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
            <span>{isCreating ? "创建中" : "创建房间"}</span>
          </button>
        </form>
      </section>

      <section className="boards-list-header">
        <div>
          <h2>已有房间</h2>
          <p>{boards.length} 个白板房间</p>
        </div>
        <button onClick={loadBoards} type="button">
          <RefreshCw size={16} />
          <span>刷新</span>
        </button>
      </section>

      {error ? <p className="boards-error">{error}</p> : null}

      <section className="boards-list" aria-label="已有白板房间">
        {isLoading ? (
          <div className="empty-state">
            <Loader2 className="spin" size={22} />
            <span>正在加载房间...</span>
          </div>
        ) : boards.length === 0 ? (
          <div className="empty-state">还没有房间，先创建一个白板吧。</div>
        ) : (
          boards.map((board) => (
            <Link className="board-row" href={`/boards/${board.id}`} key={board.id}>
              <div>
                <strong>{board.name}</strong>
                <span>
                  {board.guestName ? `${board.guestName} 创建 · ` : ""}
                  {board.shapeCount} 个对象 · 更新于 {formatDate(board.updatedAt)}
                </span>
              </div>
              <ArrowRight size={18} />
            </Link>
          ))
        )}
      </section>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
