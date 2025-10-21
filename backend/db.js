import sqlite3 from "sqlite3";
import { open } from "sqlite";

let db;

export async function getDB() {
  if (!db) {
    db = await open({
      filename: "./database.db",
      driver: sqlite3.Database,
    });

    await db.exec("PRAGMA foreign_keys = ON;");
    console.log("Database connected.");
  }

  return db;
}
