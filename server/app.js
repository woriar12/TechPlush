const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const cors = require("./config/cors");
const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const authorRoutes = require("./routes/authorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const seoRoutes = require("./routes/seoRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.use(helmet());
app.use(cors);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/seo", seoRoutes);
app.get("/sitemap.xml", (req, res, next) => {
    req.url = "/sitemap.xml";
    seoRoutes(req, res, next);
});
app.get("/robots.txt", (req, res, next) => {
    req.url = "/robots.txt";
    seoRoutes(req, res, next);
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Technology Blog API is running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});

app.use(errorMiddleware);

module.exports = app;
