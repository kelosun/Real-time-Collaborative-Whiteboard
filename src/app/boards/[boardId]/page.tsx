import { BoardRoom } from "@/components/boards/board-room";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  return <BoardRoom boardId={boardId} />;
}
