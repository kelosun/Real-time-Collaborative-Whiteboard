"use client";

import {
  ArrowLeft,
  Circle,
  Eraser,
  MousePointer2,
  Paintbrush,
  Redo2,
  RotateCcw,
  Save,
  Slash,
  Square,
  Trash2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { PointerEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createId, getShapeBounds, moveShape, normalizeBox } from "./geometry";
import type { DraftShape, Point, Tool, WhiteboardShape } from "./types";
import "./whiteboard.css";

const STORAGE_KEY = "rtc-whiteboard.phase-1.shapes";
const BOARD_WIDTH = 1440;
const BOARD_HEIGHT = 900;
const MIN_DRAW_DISTANCE = 4;

const tools: Array<{ id: Tool; label: string; icon: React.ReactNode }> = [
  { id: "select", label: "选择", icon: <MousePointer2 size={18} /> },
  { id: "pen", label: "画笔", icon: <Paintbrush size={18} /> },
  { id: "rectangle", label: "矩形", icon: <Square size={18} /> },
  { id: "ellipse", label: "圆形", icon: <Circle size={18} /> },
  { id: "line", label: "直线", icon: <Slash size={18} /> },
];

const colors = ["#1e293b", "#0f766e", "#2563eb", "#c2410c", "#be123c", "#7c3aed"];

type DragState =
  | {
      mode: "draw";
      start: Point;
    }
  | {
      mode: "move";
      shapeId: string;
      last: Point;
      beforeMove: WhiteboardShape[];
    }
  | null;

type WhiteboardProps = {
  boardTitle?: string;
  description?: string;
  phaseLabel?: string;
  initialShapes?: WhiteboardShape[];
  persistence?: "local" | "remote";
  saveLabel?: string;
  backHref?: string;
  toolbarExtra?: ReactNode;
  onSave?: (shapes: WhiteboardShape[]) => Promise<void>;
};

export function Whiteboard({
  boardTitle = "Untitled board",
  description = "单人绘图 MVP，后续接入房间与实时协作。",
  phaseLabel = "Phase 1",
  initialShapes = [],
  persistence = "local",
  saveLabel,
  backHref,
  toolbarExtra,
  onSave,
}: WhiteboardProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const hasLoadedInitialShapes = useRef(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [stroke, setStroke] = useState(colors[0]);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [shapes, setShapes] = useState<WhiteboardShape[]>([]);
  const [draft, setDraft] = useState<DraftShape>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [history, setHistory] = useState<WhiteboardShape[][]>([]);
  const [future, setFuture] = useState<WhiteboardShape[][]>([]);
  const [savedAt, setSavedAt] = useState<string>("未保存");

  useEffect(() => {
    if (persistence !== "local") return;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const restored = JSON.parse(raw) as WhiteboardShape[];
      setShapes(restored);
      setSavedAt("已恢复本地草稿");
    } catch {
      setSavedAt("本地草稿读取失败");
    }
    hasLoadedInitialShapes.current = true;
  }, [persistence]);

  useEffect(() => {
    if (persistence !== "remote") return;
    setShapes(initialShapes);
    setHistory([]);
    setFuture([]);
    setSelectedId(null);
    setSavedAt("已加载房间数据");
    hasLoadedInitialShapes.current = true;
  }, [initialShapes, persistence]);

  useEffect(() => {
    if (persistence !== "local") return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes));
    setSavedAt(formatSavedAt());
  }, [persistence, shapes]);

  useEffect(() => {
    if (persistence !== "remote" || !onSave || !hasLoadedInitialShapes.current) return;

    setSavedAt("保存中...");
    const timeoutId = window.setTimeout(() => {
      onSave(shapes)
        .then(() => setSavedAt(formatSavedAt()))
        .catch(() => setSavedAt("保存失败"));
    }, 550);

    return () => window.clearTimeout(timeoutId);
  }, [onSave, persistence, shapes]);

  function formatSavedAt() {
    return new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
  }

  const selectedShape = useMemo(
    () => shapes.find((shape) => shape.id === selectedId) ?? null,
    [selectedId, shapes],
  );

  const selectedBounds = selectedShape ? getShapeBounds(selectedShape) : null;

  const getPoint = useCallback((event: PointerEvent<SVGSVGElement>): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformed = point.matrixTransform(svg.getScreenCTM()?.inverse());

    return {
      x: Math.round(transformed.x),
      y: Math.round(transformed.y),
    };
  }, []);

  const commitShapes = useCallback((nextShapes: WhiteboardShape[]) => {
    setShapes((current) => {
      setHistory((items) => [...items, current]);
      setFuture([]);
      return nextShapes;
    });
  }, []);

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;

    const point = getPoint(event);
    const target = event.target as SVGElement;
    const shapeId = target.dataset.shapeId;

    event.currentTarget.setPointerCapture(event.pointerId);

    if (tool === "select") {
      if (shapeId) {
        setSelectedId(shapeId);
        setDragState({ mode: "move", shapeId, last: point, beforeMove: shapes });
      } else {
        setSelectedId(null);
      }
      return;
    }

    setSelectedId(null);
    setDragState({ mode: "draw", start: point });

    if (tool === "pen") {
      setDraft({
        id: createId(),
        type: "pen",
        points: [point],
        stroke,
        strokeWidth,
      });
      return;
    }

    if (tool === "line") {
      setDraft({
        id: createId(),
        type: "line",
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        stroke,
        strokeWidth,
      });
      return;
    }

    setDraft({
      id: createId(),
      type: tool,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      stroke,
      strokeWidth,
    });
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragState) return;

    const point = getPoint(event);

    if (dragState.mode === "move") {
      const dx = point.x - dragState.last.x;
      const dy = point.y - dragState.last.y;

      setShapes((current) =>
        current.map((shape) =>
          shape.id === dragState.shapeId ? moveShape(shape, dx, dy) : shape,
        ),
      );
      setDragState({ ...dragState, last: point });
      return;
    }

    setDraft((current) => {
      if (!current) return current;

      if (current.type === "pen") {
        const lastPoint = current.points.at(-1);
        if (
          lastPoint &&
          Math.abs(lastPoint.x - point.x) + Math.abs(lastPoint.y - point.y) < MIN_DRAW_DISTANCE
        ) {
          return current;
        }

        return {
          ...current,
          points: [...current.points, point],
        };
      }

      if (current.type === "line") {
        return {
          ...current,
          width: point.x - current.x,
          height: point.y - current.y,
        };
      }

      const box = normalizeBox(dragState.start, point);
      return {
        ...current,
        ...box,
      };
    });
  };

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (dragState?.mode === "move") {
      setHistory((items) => [...items, dragState.beforeMove]);
      setFuture([]);
      setDragState(null);
      return;
    }

    if (!draft) {
      setDragState(null);
      return;
    }

    const shouldCommit =
      draft.type === "pen"
        ? draft.points.length > 1
        : Math.abs(draft.width) > 2 || Math.abs(draft.height) > 2;

    if (shouldCommit) {
      commitShapes([...shapes, draft]);
      setSelectedId(draft.id);
      setTool("select");
    }

    setDraft(null);
    setDragState(null);
  };

  const undo = () => {
    setHistory((items) => {
      if (items.length === 0) return items;
      const previous = items.at(-1) ?? [];
      setFuture((futureItems) => [shapes, ...futureItems]);
      setShapes(previous);
      setSelectedId(null);
      return items.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((items) => {
      if (items.length === 0) return items;
      const next = items[0];
      setHistory((historyItems) => [...historyItems, shapes]);
      setShapes(next);
      setSelectedId(null);
      return items.slice(1);
    });
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    commitShapes(shapes.filter((shape) => shape.id !== selectedId));
    setSelectedId(null);
  };

  const clearBoard = () => {
    if (shapes.length === 0) return;
    commitShapes([]);
    setSelectedId(null);
  };

  return (
    <main className="whiteboard-shell">
      <aside className="side-panel" aria-label="白板工具栏">
        <div>
          <p className="eyebrow">{phaseLabel}</p>
          <h1>在线白板</h1>
          <p className="subtitle">{description}</p>
        </div>

        <section className="tool-group" aria-label="绘图工具">
          {tools.map((item) => (
            <button
              className={item.id === tool ? "tool-button active" : "tool-button"}
              key={item.id}
              onClick={() => setTool(item.id)}
              title={item.label}
              type="button"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </section>

        <section className="tool-section" aria-label="画笔颜色">
          <div className="section-label">颜色</div>
          <div className="swatches">
            {colors.map((color) => (
              <button
                aria-label={`选择颜色 ${color}`}
                className={color === stroke ? "swatch active" : "swatch"}
                key={color}
                onClick={() => setStroke(color)}
                style={{ backgroundColor: color }}
                type="button"
              />
            ))}
          </div>
        </section>

        <section className="tool-section" aria-label="线宽">
          <label className="section-label" htmlFor="stroke-width">
            线宽 {strokeWidth}px
          </label>
          <input
            id="stroke-width"
            max={18}
            min={2}
            onChange={(event) => setStrokeWidth(Number(event.target.value))}
            type="range"
            value={strokeWidth}
          />
        </section>

        <section className="tool-grid" aria-label="编辑操作">
          <button disabled={history.length === 0} onClick={undo} title="撤销" type="button">
            <Undo2 size={17} />
            <span>撤销</span>
          </button>
          <button disabled={future.length === 0} onClick={redo} title="重做" type="button">
            <Redo2 size={17} />
            <span>重做</span>
          </button>
          <button disabled={!selectedId} onClick={deleteSelected} title="删除" type="button">
            <Trash2 size={17} />
            <span>删除</span>
          </button>
          <button disabled={shapes.length === 0} onClick={clearBoard} title="清空" type="button">
            <Eraser size={17} />
            <span>清空</span>
          </button>
        </section>

        <div className="save-status">
          <Save size={16} />
          <span>
            {saveLabel ?? (persistence === "remote" ? "房间保存" : "本地保存")}：{savedAt}
          </span>
        </div>
        {toolbarExtra ? <div className="toolbar-extra">{toolbarExtra}</div> : null}
      </aside>

      <section className="board-area" aria-label="白板画布">
        <div className="board-topbar">
          <div>
            <strong>{boardTitle}</strong>
            <span>{shapes.length} 个对象</span>
          </div>
          <div className="board-actions">
            {backHref ? (
              <Link className="topbar-link" href={backHref}>
                <ArrowLeft size={16} />
                <span>房间列表</span>
              </Link>
            ) : null}
            <button onClick={() => window.location.reload()} type="button">
              <RotateCcw size={16} />
              <span>重新载入</span>
            </button>
          </div>
        </div>

        <svg
          className={`whiteboard-canvas tool-${tool}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={svgRef}
          role="img"
          viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
        >
          <defs>
            <pattern height="32" id="dot-grid" patternUnits="userSpaceOnUse" width="32">
              <circle cx="1" cy="1" fill="#cbd5e1" r="1.1" />
            </pattern>
          </defs>
          <rect fill="#fbfdff" height={BOARD_HEIGHT} width={BOARD_WIDTH} />
          <rect fill="url(#dot-grid)" height={BOARD_HEIGHT} opacity="0.9" width={BOARD_WIDTH} />
          {[...shapes, ...(draft ? [draft] : [])].map((shape) => (
            <ShapeView isSelected={shape.id === selectedId} key={shape.id} shape={shape} />
          ))}
          {selectedBounds ? (
            <rect
              className="selection-box"
              height={selectedBounds.height + 16}
              pointerEvents="none"
              width={selectedBounds.width + 16}
              x={selectedBounds.x - 8}
              y={selectedBounds.y - 8}
            />
          ) : null}
        </svg>
      </section>
    </main>
  );
}

function ShapeView({
  isSelected,
  shape,
}: {
  isSelected: boolean;
  shape: WhiteboardShape;
}) {
  const commonProps = {
    "data-shape-id": shape.id,
    className: isSelected ? "shape selected" : "shape",
    fill: "none",
    stroke: shape.stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: shape.strokeWidth,
  };

  if (shape.type === "pen") {
    const points = shape.points.map((point) => `${point.x},${point.y}`).join(" ");
    return <polyline {...commonProps} points={points} />;
  }

  if (shape.type === "rectangle") {
    return <rect {...commonProps} height={shape.height} rx={4} width={shape.width} x={shape.x} y={shape.y} />;
  }

  if (shape.type === "ellipse") {
    return (
      <ellipse
        {...commonProps}
        cx={shape.x + shape.width / 2}
        cy={shape.y + shape.height / 2}
        rx={Math.abs(shape.width / 2)}
        ry={Math.abs(shape.height / 2)}
      />
    );
  }

  return (
    <line
      {...commonProps}
      x1={shape.x}
      x2={shape.x + shape.width}
      y1={shape.y}
      y2={shape.y + shape.height}
    />
  );
}
