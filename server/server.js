import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

// Проверочный роут
app.get("/", (req, res) => {
  res.json({ message: "Backend работает" });
});

// Схема MongoDB
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

// Коллекция в MongoDB будет называться products
const Product = mongoose.model("Product", ProductSchema);

// Получить все товары
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

const start = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      `mongodb://${encodeURIComponent(process.env.MONGODB_USERNAME)}:${encodeURIComponent(
        process.env.MONGODB_PASSWORD
      )}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}?authSource=admin&directConnection=true`;

    await mongoose.connect(mongoUri);
    console.log("MongoDB подключена");

    const collections = await mongoose.connection.db.listCollections().toArray();

    console.log("Коллекции в базе:");
    console.log(collections.map((collection) => collection.name));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error("Ошибка запуска backend:", error);
    process.exit(1);
  }
};

start();