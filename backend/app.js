import express from "express";
import dotenv from "dotenv";
import { getDB } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express.js!");
});

// authentication
app.get("/api/register", (req, res) => {
  res.send("Register api!");
});

// follows api

// display feeds from followed users
// tinggal WHERE user id
app.get("/api/feed", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const db = await getDB();
    const totalPosts = await db.get("SELECT COUNT(*) as total FROM posts");
    const totalItems = totalPosts.total;
    const totalPages = Math.ceil(totalItems / limit);
    const postsData = await db.all(
      `
      SELECT f.*, u.username
      FROM posts f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );
    res.status(200).json({
      page: page,
      total_pages: totalPages,
      total_items: totalItems,
      posts: postsData,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
  res.send(`feed api! ${page}`);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
