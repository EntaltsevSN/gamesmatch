import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");
const distExists = fs.existsSync(distPath);
const isProduction = process.env.NODE_ENV === "production" || distExists;

app.use(express.json());

// В dev Vite (:5173) и backend (:5000) на разных портах — нужен CORS.
// В production фронт и API на одном домене — Vite proxy не используется.
if (!isProduction) {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true
    })
  );
}

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

const MatchSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    platform: { type: String, required: true },
    author: { type: String, default: null },
    champion: { type: Number, default: null },
    gamesList: [{ id: Number, likes: Number }],
    match: { stage: Number, step: Number, left: Number },
    history: mongoose.Schema.Types.Mixed,
    runtime: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
const Match = mongoose.model("Match", MatchSchema);

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend работает" });
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при получении товаров",
      error: error.message
    });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { title, price, description } = req.body;

    if (!title || !price) {
      return res.status(400).json({
        message: "Название и цена обязательны"
      });
    }

    const product = await Product.create({ title, price, description });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при создании товара",
      error: error.message
    });
  }
});

app.get("/api/matches", async (req, res) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при получении матчей",
      error: error.message
    });
  }
});

app.post("/api/matches", async (req, res) => {
  try {
    const { id, platform } = req.body;

    if (!id || !platform) {
      return res.status(400).json({
        message: "id и platform обязательны"
      });
    }

    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при сохранении матча",
      error: error.message
    });
  }
});

// Раздача frontend после сборки.
// Важно: catch-all только для НЕ-api путей — иначе nginx/статика может перехватить раньше Node.
if (isProduction && distExists) {
  app.use(express.static(distPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const start = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      `mongodb://${encodeURIComponent(process.env.MONGODB_USERNAME)}:${encodeURIComponent(
        process.env.MONGODB_PASSWORD
      )}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}?authSource=admin&directConnection=true`;

    await mongoose.connect(mongoUri);
    console.log("MongoDB подключена");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server запущен на порту ${PORT} (${isProduction ? "production" : "development"})`);
      if (isProduction && !distExists) {
        console.warn("Папка dist не найдена. Запусти: npm run build");
      }
    });
  } catch (error) {
    console.error("Ошибка запуска сервера:", error);
    process.exit(1);
  }
};

start();
