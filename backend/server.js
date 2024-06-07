const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const secretKey = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjo";
const multer = require("multer");
const path = require("path");
const { connectAndInsertData } = require("./database");

const users = [{ username: "haseeb", password: "Haseeb123@" }];

app.use(bodyParser.json());
app.use(cors());
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const token = jwt.sign({ username: user.username }, secretKey, {
    expiresIn: "1h",
  });
  res.json({ token });
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected route accessed successfully" });
});

function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/videos/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

app.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No video file uploaded." });
  }

  const videoUrl = `http://localhost:3000/uploads/videos/${req.file.filename}`;
  console.log(req.file);
  try {
    await connectAndInsertData({
      message: "PostgreSQL server is ready and accepting connections.",
      timestamp: new Date(),
      filename: req.file.originalname,
      videoUrl: videoUrl,
      videoName: req.body.videoName,
      size: req.file.size,
    });

    res.json({
      message: "Video uploaded successfully.",
      filename: req.file.originalname,
      videoUrl: videoUrl,
      videoName: req.body.videoName,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Error saving data to the database:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.use(
  "/uploads/videos",
  express.static(path.join(__dirname, "uploads/videos"))
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
