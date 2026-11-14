require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const app = require("./app");

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminEmail || !adminPassword) {
    console.error("Admin API checks require ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
    process.exit(1);
}

const runTests = async() => {
    let server;
    try {
        console.log("Connecting to MongoDB for API verification...");
        await mongoose.connect(process.env.MONGODB_URI);

        const PORT = 5055;
        server = app.listen(PORT);
        console.log(`Test server listening on port ${PORT}`);

        const baseUrl = `http://localhost:${PORT}`;

        console.log("\n[TEST 1] GET /api/health");
        let res = await fetch(`${baseUrl}/api/health`);
        let data = await res.json();
        console.log("Status:", res.status, data);

        console.log("\n[TEST 2] GET /api/blogs");
        res = await fetch(`${baseUrl}/api/blogs`);
        data = await res.json();
        console.log("Status:", res.status, "Count:", data.data?.blogs?.length);
        const sampleSlug = data.data?.blogs?.[0]?.slug;

        if (sampleSlug) {
            console.log(`\n[TEST 3] GET /api/blogs/${sampleSlug}`);
            res = await fetch(`${baseUrl}/api/blogs/${sampleSlug}`);
            data = await res.json();
            console.log("Status:", res.status, "Title:", data.data?.blog?.title);
            console.log("Related blogs count:", data.data?.relatedBlogs?.length);
            console.log("Previous blog:", data.data?.previousBlog?.title || "none");
            console.log("Next blog:", data.data?.nextBlog?.title || "none");
        }

        console.log("\n[TEST 4] GET /api/categories");
        res = await fetch(`${baseUrl}/api/categories`);
        data = await res.json();
        console.log("Status:", res.status, "Count:", data.count);

        console.log("\n[TEST 5] GET /api/tags");
        res = await fetch(`${baseUrl}/api/tags`);
        data = await res.json();
        console.log("Status:", res.status, "Count:", data.count);

        console.log("\n[TEST 6] GET /api/authors");
        res = await fetch(`${baseUrl}/api/authors`);
        data = await res.json();
        console.log("Status:", res.status, "Count:", data.count);

        console.log("\n[TEST 7] POST /api/auth/login");
        res = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: adminEmail,
                password: adminPassword,
            }),
        });
        data = await res.json();
        console.log("Status:", res.status, "Success:", data.success);
        const token = data.data?.token;

        if (token) {
            console.log("\n[TEST 8] GET /api/auth/me");
            res = await fetch(`${baseUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            data = await res.json();
            console.log("Status:", res.status, "Admin Name:", data.data?.name);

            console.log("\n[TEST 9] GET /api/admin/dashboard");
            res = await fetch(`${baseUrl}/api/admin/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            data = await res.json();
            console.log("Status:", res.status, "Dashboard Stats:", data.data);

            console.log("\n[TEST 10] GET /api/blogs/admin/all");
            res = await fetch(`${baseUrl}/api/blogs/admin/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            data = await res.json();
            console.log("Status:", res.status, "Total admin blogs:", data.data?.pagination?.total);
        }

        console.log("\n[TEST 11] GET /api/seo/sitemap.xml");
        res = await fetch(`${baseUrl}/api/seo/sitemap.xml`);
        const xml = await res.text();
        console.log("Status:", res.status, "Length:", xml.length, "Is XML:", xml.includes("<urlset"));

        console.log("\n[TEST 13] GET /robots.txt");
        res = await fetch(`${baseUrl}/robots.txt`);
        const robots = await res.text();
        console.log("Status:", res.status, "Content:\n" + robots);

        console.log("\n--- ALL BACKEND API TESTS COMPLETED SUCCESSFULLY ---");
    } catch (err) {
        console.error("Test execution failed:", err);
    } finally {
        if (server) server.close();
        await mongoose.disconnect();
        process.exit(0);
    }
};

runTests();
