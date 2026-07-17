import "dotenv/config";
import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/realtime_whiteboard?schema=public";
const databaseUrl = process.env.DATABASE_URL || fallbackDatabaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
