const generateSEO = (blog) => {
    const title = blog.seo?.metaTitle || blog.title;

    const description =
        blog.seo?.metaDescription ||
        blog.excerpt ||
        blog.title ||
        "No description available";

    const image = blog.featuredImage?.url || "";
    const url = `${process.env.CLIENT_URL}/blog/${blog.slug}`;

    const keywords = blog.seo?.keywords || [];

    const openGraph = {
        title,
        description,
        type: "article",
        url,
        image,
    };

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        image: image ? [image] : [],
        datePublished: blog.publishedAt,
        dateModified: blog.updatedAt,
        author: {
            "@type": "Person",
            name: blog.author?.name || "Author",
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
        },
    };

    return {
        title,
        description,
        keywords,
        openGraph,
        articleSchema,
    };
};

module.exports = generateSEO;