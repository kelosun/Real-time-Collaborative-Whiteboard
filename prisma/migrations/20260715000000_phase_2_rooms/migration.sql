CREATE TABLE "whiteboard_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guest_name" TEXT,
    "shapes" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboard_rooms_pkey" PRIMARY KEY ("id")
);
