import "dotenv/config";
import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/realtime_whiteboard?schema=public";
const isMigrationCommand = process.argv.includes("migrate");
const databaseUrl = isMigrationCommand
  ? process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || fallbackDatabaseUrl
  : process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || fallbackDatabaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
