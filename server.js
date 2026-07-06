import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(express.json());

// CORS нужен в dev-режиме, когда Vite и backend на разных портах
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

// Схема товара
const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", ProductSchema);

// Проверка backend
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend работает"
  });
});

// Получить товары
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

// Создать товар
app.post("/api/products", async (req, res) => {
  try {
    const { title, price, description } = req.body;

    if (!title || !price) {
      return res.status(400).json({
        message: "Название и цена обязательны"
      });
    }

    const product = await Product.create({
      title,
      price,
      description
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при создании товара",
      error: error.message
    });
  }
});

// Раздача frontend после сборки
// Работает на Timeweb / production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../dist");

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
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

      console.log("MongoDB подключена!");
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      
      console.log("Коллекции в базе:");
      console.log(collections.map((collection) => collection.name));

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error("Ошибка запуска сервера:", error);
    process.exit(1);
  }
};

start();