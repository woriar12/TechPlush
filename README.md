# TechPulse – Technology Blog & Publication Platform

TechPulse is a technology publication and editorial Content Management System (CMS) built on the MERN stack (MongoDB, Express, React 19, Node.js). It delivers a responsive reading experience and an administrative CMS for managing articles, technology categories, tags, authors, media uploads, and scheduled publishing.

---

## 1. Technology Stack

### Frontend
- **Framework:** React 19 + Vite 8
- **Routing:** React Router DOM (v7)
- **Styling:** Tailwind CSS (v4)
- **Rich Text Editor:** Tiptap Editor (Headings, Code blocks, Lists, Tables, Blockquotes, Cloudinary Image Embeds, Links)
- **Icons:** Lucide React + Custom SVG Brand Icons
- **HTTP Client:** Axios with centralized interceptors, Bearer token injection, and error handling

### Backend
- **Runtime:** Node.js + Express.js REST API
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs password hashing
- **Validation:** Joi request validation with multipart/form-data normalization
- **File Uploads & Media Storage:** Multer + Cloudinary Storage
- **Scheduled Publishing:** node-cron automated publication job (runs every minute)
- **Security:** Helmet security headers, Express Rate Limit, CORS with credentials

---

## 2. Completed Architecture & Features

### A. Public Website
- **Homepage:** Editorial hero banner, featured article showcase, technology categories pill navigation, latest articles grid, and trending publications.
- **Blog Listing Page (`/blogs`):** Full article catalog with keyword search, category filtering, reading time indicators, pagination, and empty states.
- **Blog Detail Page (`/blog/:slug`):** Editorial reading experience with formatted typography, table of contents, author biography, social sharing (LinkedIn, Twitter/X, Clipboard Copy), previous/next article links, and related articles.
- **Category Listing Pages (`/category/:slug`):** Dedicated topic listing with category descriptions and filtered articles.
- **Search Experience (`/search`):** Search interface supporting article titles, excerpts, and keywords.
- **SEO & Social Metadata:** Dynamic page titles, meta descriptions, OpenGraph tags, JSON-LD Schema.org `BlogPosting` structured data, XML sitemap (`/api/seo/sitemap.xml`), and `robots.txt`.

### B. Admin CMS
- **Authentication (`/admin/login`):** JWT-based admin login with form validation, show/hide password, and route protection.
- **Dashboard (`/admin/dashboard`):** Real-time statistics aggregated from MongoDB Atlas (Total Blogs, Published, Drafts, Scheduled, Total Views, Categories, Tags, Authors) and recent publications table.
- **Article Management (`/admin/blogs`):** Filter by status, filter by category, keyword search, quick publish/unpublish toggle, edit, preview, and safe deletion.
- **Blog Editor (`/admin/blogs/create` & `/admin/blogs/edit/:id`):** Dual-mode editor supporting title, slug generation, excerpt, Tiptap rich text editor, inline Cloudinary image insertion, featured image upload to Cloudinary, alt text, category dropdown, tag multi-select, author selection, draft/published/scheduled status, scheduled datetime picker, featured article toggle, and SEO metadata.
- **Category Taxonomy (`/admin/categories`):** Create, edit, toggle active/inactive status, and delete categories with all attached articles and their featured images.
- **Tag Management (`/admin/tags`):** Create, edit, toggle status, and safe deletion (automatically unlinks from articles).
- **Author Management (`/admin/authors`):** Create, edit, profile image upload to Cloudinary, designation, biography, LinkedIn/Twitter/Website links, active toggle, and deletion of authors with all assigned articles.

---

## 3. API Endpoints

### Authentication
- `POST /api/auth/login` – Admin login, returns JWT token and profile
- `POST /api/auth/logout` – Revokes the current JWT session
- `GET /api/auth/me` – Current authenticated admin profile (Protected)

### Blogs
- `GET /api/blogs` – Public listing with pagination, search, category, tag, featured filters
- `GET /api/blogs/:slug` – Single public article with related articles and prev/next links
- `GET /api/blogs/admin/all` – All articles for admin with status & category filters (Protected)
- `GET /api/blogs/admin/:id` – Single article by ID for editing drafts or scheduled posts (Protected)
- `POST /api/blogs` – Create new article with featured image upload (Protected)
- `PUT /api/blogs/:id` – Update existing article and image (Protected)
- `DELETE /api/blogs/:id` – Delete article and remove image from Cloudinary (Protected)
- `PATCH /api/blogs/:id/publish` – Toggle publish / unpublish status (Protected)
- `POST /api/blogs/upload-image` – Inline image upload for Tiptap editor to Cloudinary (Protected)

### Categories
- `GET /api/categories` – Public active categories
- `GET /api/categories/admin/all` – All categories for admin (Protected)
- `POST /api/categories` – Create category (Protected)
- `PUT /api/categories/:id` – Update category name, description, active status (Protected)
- `DELETE /api/categories/:id` – Safe delete category (Protected)

### Tags
- `GET /api/tags` – Public active tags
- `GET /api/tags/admin/all` – All tags for admin (Protected)
- `POST /api/tags` – Create tag (Protected)
- `PUT /api/tags/:id` – Update tag (Protected)
- `DELETE /api/tags/:id` – Delete tag and detach from blogs (Protected)

### Authors
- `GET /api/authors` – Public active authors
- `GET /api/authors/admin/all` – All authors for admin (Protected)
- `POST /api/authors` – Create author with profile image (Protected)
- `PUT /api/authors/:id` – Update author profile and image (Protected)
- `DELETE /api/authors/:id` – Safe delete author (Protected)

### Admin & SEO
- `GET /api/admin/dashboard` – Real-time database metrics (Protected)
- `GET /api/seo/sitemap.xml` – Dynamic XML sitemap
- `GET /robots.txt` – Web crawler directives

---

## 4. Environment Variables Reference

The server uses the existing configuration in `server/.env`:

```env
PORT=5000
MONGODB_URI=<mongodb_connection_string>
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=<cloudinary_cloud_name>
CLOUDINARY_API_KEY=<cloudinary_api_key>
CLOUDINARY_API_SECRET=<cloudinary_api_secret>
JWT_SECRET=<jwt_secret_key>
JWT_EXPIRES_IN=1d
RESEND_API_KEY=<resend_api_key>
CONTACT_EMAIL_FROM=<verified_sender_email>
CONTACT_EMAIL_TO=<contact_inbox_email>
```

*(Never commit `.env` or expose API secrets in the frontend).*

Revoked JWTs are stored as SHA-256 token hashes in MongoDB with an expiration timestamp and TTL index. Protected requests check this revocation list, so logout remains effective across server restarts. This adds one indexed revocation lookup per protected request; the `Admin` schema is unchanged. Ensure model indexes are provisioned in environments where Mongoose automatic index creation is disabled.

The public contact form sends messages through Resend's email API. Set the three contact email variables in the server environment only: use a Resend API key, a sender address verified with Resend, and the administrator's recipient address. The API key must never be exposed to the client. Contact delivery returns a safe error until these values are configured.

---

## 5. Getting Started & Running the Application

### Seed Database

For a database without an active admin, configure ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in the server environment (or an untracked server/.env file) before seeding. The password must meet the existing minimum length requirement. The seed process creates an admin only when no active admin exists, and it never changes existing admin accounts. Password hashing is handled by the Admin model.

If an active admin already exists, the seed process reuses it without requiring or printing credentials. If no active admin exists and setup variables are missing or invalid, seeding stops with a safe message. Remove or unset one-time setup variables after initial account creation. Never commit server/.env.

```bash
npm run seed
# or
cd server && npm run seed
```

### Start Backend Server
```bash
npm run start:server
# or
cd server && npm start
```
The backend API will run on **http://localhost:5000**.

### Start Frontend Application
```bash
npm run start:client
# or
cd client && npm run dev
```
The Vite development server will run on **http://localhost:5173**.

### Build Frontend for Production
```bash
npm run build:client
# or
cd client && npm run build
```

---

## 6. Initial Admin Account Setup

For first-time setup, set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD through a secure environment manager or an untracked server/.env file, then run the seed command above. No fixed account credentials are supplied or displayed by the project. The seed process uses these values only if the database has no active admin account; existing admin accounts are left unchanged. The Admin model hashes the new password with bcrypt before storage. After setup, unset the one-time admin variables.
