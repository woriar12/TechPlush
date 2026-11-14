const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const Category = require("../models/Category");

router.get("/sitemap.xml", async(req, res, next) => {
    try {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const now = new Date();

        const [blogs, categories] = await Promise.all([
            Blog.find({
                status: "published",
                publishedAt: { $lte: now },
            }).select("slug updatedAt").lean(),
            Category.find({ isActive: true }).select("slug updatedAt").lean(),
        ]);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        xml += `  <url>\n    <loc>${clientUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
        xml += `  <url>\n    <loc>${clientUrl}/blogs</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

        categories.forEach((cat) => {
            xml += `  <url>\n    <loc>${clientUrl}/category/${cat.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        });

        blogs.forEach((blog) => {
            const lastMod = blog.updatedAt ? new Date(blog.updatedAt).toISOString() : new Date().toISOString();
            xml += `  <url>\n    <loc>${clientUrl}/blog/${blog.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });

        xml += "</urlset>";

        res.header("Content-Type", "application/xml");
        res.status(200).send(xml);
    } catch (error) {
        next(error);
    }
});

router.get("/robots.txt", (req, res) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const content = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\n\nSitemap: ${clientUrl}/api/seo/sitemap.xml\n`;
    res.header("Content-Type", "text/plain");
    res.status(200).send(content);
});

module.exports = router;
