import express from "express";
import dotenv from "dotenv";
import { getDB } from "./db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authenticateToken } from "./middleware.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// authentication
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password required" });

    const db = await getDB();

    const existingUser = await db.get(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user and get the ID
    const result = await db.run(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, hashedPassword]
    );

    const userId = result.lastID;

    res.status(201).json({
      id: userId,
      username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password required" });

    const db = await getDB();

    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Respond with user info and token
    res.status(200).json({
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// create post
app.post("/api/posts", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    const db = await getDB();

    const result = await db.run(
      "INSERT INTO posts (user_id, content) VALUES (?,?)",
      [userId, content]
    );

    res.status(201).json({
      id: result.lastID,
      user_id: userId,
      content: content || "",
      createdat: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// follows api & unfollows api
app.post("/api/follow/:userid", authenticateToken, async (req, res) => {
  const { userid: followingId } = req.params;
  const followerId = req.user.id;

  if (parseInt(followingId) === followerId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    const db = await getDB();

    await db.run(
      "INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)",
      [followerId, followingId]
    );

    res.status(201).json({
      message: `You are now following user ${followingId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to follow user" });
  }
});

app.delete("/api/follow/:userid", authenticateToken, async (req, res) => {
  const { userid: followingId } = req.params;
  const followerId = req.user.id;

  try {
    const db = await getDB();

    const result = await db.run(
      "DELETE FROM follows WHERE follower_id = ? AND followee_id = ?",
      [followerId, followingId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        message: "You are not following this user",
      });
    }

    res.status(200).json({
      success: true,
      message: `You unfollowed user ${followingId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to unfollow user" });
  }
});

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
