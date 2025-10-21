import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

sqlite3.verbose();

async function seed() {
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  console.log("Connected to SQLite database.");

  const tables = await db.all(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
  `);

  // Drop all tables
  for (const table of tables) {
    console.log(`Dropping table: ${table.name}`);
    await db.exec(`DROP TABLE IF EXISTS ${table.name};`);
  }

  console.log("All tables dropped.");

  // ini table user
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Users table ensured.");

  // create admin
  const admin = {
    username: "admin",
    password: await bcrypt.hash("admin", 10),
  };
  await db.run("INSERT INTO users (username, password_hash) VALUES (?,?)", [
    admin.username,
    admin.password,
  ]);

  console.log("Admin account created (username: admin, password: admin)");

  const users = Array.from({ length: 50 }).map(() => ({
    username: faker.internet.username().toLowerCase(),
    password: faker.internet.password(10),
  }));

  console.log(`Generated ${users.length} fake users.`);

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await db.run(
      "INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)",
      [user.username, hashed]
    );
  }

  console.log("Seed data inserted successfully (50 users).");

  // table for posts
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
  `);

  // posts seeders
  const userRows = await db.all("SELECT id FROM users");

  // Generate feeds for each user (2–6 posts per user)
  for (const user of userRows) {
    const postCount = faker.number.int({ min: 2, max: 6 });
    for (let i = 0; i < postCount; i++) {
      const content = faker.lorem.sentences({ min: 1, max: 3 });
      await db.run("INSERT INTO posts (user_id, content) VALUES (?, ?)", [
        user.id,
        content,
      ]);
    }
  }

  // table for follows
  await db.exec(`
  CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER NOT NULL,
    followee_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

  const userIds = (await db.all("SELECT id FROM users")).map((u) => u.id);

  for (const followerId of userIds) {
    const followCount = Math.floor(Math.random() * 5) + 1;
    const followees = faker.helpers.arrayElements(
      userIds.filter((id) => id !== followerId),
      followCount
    );

    for (const followeeId of followees) {
      await db.run(
        "INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)",
        [followerId, followeeId]
      );
    }
  }

  console.log("Random follow relationships created.");

  await db.close();
  console.log("Database connection closed.");
}

seed().catch((err) => {
  console.error("Error during seeding:", err);
});
