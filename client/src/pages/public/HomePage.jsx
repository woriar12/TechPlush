import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { getPublishedBlogs } from "../../services/blogService";
import { getCategories } from "../../services/categoryService";
import ArticleCard from "../../components/blog/ArticleCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import usePageMetadata from "../../hooks/usePageMetadata";

const formatDate = (value) => {
  if (!value) return "Recently published";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ArticleImage = ({ blog, className = "" }) => (
  blog.featuredImage?.url ? (
    <img
      src={blog.featuredImage.url}
      alt={blog.featuredImage.altText || blog.title}
      loading="lazy"
      className={className}
    />
  ) : (
    <div className={`magazine-image-placeholder ${className}`}>TechPulse article</div>
  )
);

const HomePage = () => {
  usePageMetadata(
    "Technology, in context.",
    "Clear thinking on software, AI, infrastructure and the people building what comes next."
  );
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [blogsRes, categoriesRes] = await Promise.all([
        getPublishedBlogs({ limit: 12 }),
        getCategories(),
      ]);
      if (blogsRes.success) setBlogs(blogsRes.data?.blogs || []);
      if (categoriesRes.success) setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error("Home page load failed:", err);
      setError(err.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading articles..." minHeight="min-h-[50vh]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  const leadStory = blogs.find((blog) => blog.isFeatured) || blogs[0];
  const trendingStories = [...blogs]
    .filter((blog) => blog._id !== leadStory?._id)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3);
  const latestStories = blogs
    .filter((blog) => blog._id !== leadStory?._id)
    .slice(0, 6);
  const displayedLatest = latestStories.length > 0 ? latestStories : blogs.slice(0, 6);

  return (
    <div className="magazine-page">
      {leadStory && (
        <section className="home-hero magazine-container" aria-label="Featured article">
          <article className="home-feature">
            <div className="home-feature__content">
              <p className="magazine-kicker">
                {leadStory.category?.name || "Featured story"}
              </p>
              <h1>
                <Link to={`/blog/${leadStory.slug}`}>{leadStory.title}</Link>
              </h1>
              <p className="home-feature__excerpt">{leadStory.excerpt}</p>
              <div className="home-feature__byline">
                {leadStory.author?.profileImage?.url && (
                  <img
                    src={leadStory.author.profileImage.url}
                    alt={leadStory.author.name || "Article author"}
                    loading="lazy"
                  />
                )}
                <span>{leadStory.author?.name || "TechPulse Editors"}</span>
                <span className="byline-separator" aria-hidden="true">·</span>
                <span>{formatDate(leadStory.publishedAt)}</span>
                <span className="byline-separator" aria-hidden="true">·</span>
                <span>{leadStory.readingTime || 5} min read</span>
              </div>
              <Link to={`/blog/${leadStory.slug}`} className="home-feature__button">
                Read More
              </Link>
            </div>
            <Link to={`/blog/${leadStory.slug}`} className="home-feature__image">
              <ArticleImage blog={leadStory} />
            </Link>
          </article>
        </section>
      )}

      {!leadStory && (
        <section className="home-hero magazine-container">
          <div className="home-feature__content">
            <p className="magazine-kicker">TechPulse</p>
            <h1>Technology, made easier to understand.</h1>
            <p className="home-feature__excerpt">
              Practical blogs and ideas for people who work with technology.
            </p>
            <Link to="/blogs" className="home-feature__button">Browse Blogs</Link>
          </div>
        </section>
      )}

      {trendingStories.length > 0 && (
        <section className="magazine-section magazine-container home-trending" aria-labelledby="trending-heading">
          <div className="magazine-section__heading">
            <h2 id="trending-heading">Trending Blogs</h2>
          </div>
          <ol>
            {trendingStories.map((story) => (
              <li key={story._id}>
                <Link to={`/blog/${story.slug}`} className="home-trending__image">
                  <ArticleImage blog={story} />
                </Link>
                <div className="home-trending__content">
                  <p className="home-trending__category">
                    {story.category?.name || "Technology"}
                  </p>
                  <h3><Link to={`/blog/${story.slug}`}>{story.title}</Link></h3>
                  <time dateTime={story.publishedAt || undefined}>
                    {formatDate(story.publishedAt)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {displayedLatest.length > 0 && (
        <section className="magazine-section magazine-container">
          <div className="magazine-section__heading">
            <div>
              <h2>Latest Blogs</h2>
            </div>
            <Link to="/blogs" className="magazine-read-link">View All</Link>
          </div>

          <form onSubmit={handleSearch} className="magazine-search">
            <label htmlFor="home-search" className="sr-only">Search blogs</label>
            <Search aria-hidden="true" size={17} />
            <input
              id="home-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search the magazine"
              aria-label="Search blogs"
            />
            <button type="submit">Search</button>
          </form>

          <div className="magazine-article-grid">
            {displayedLatest.map((blog) => (
              <ArticleCard key={blog._id} blog={blog} />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section id="categories" className="magazine-categories">
          <div className="magazine-container">
            <div className="magazine-section__heading">
              <div>
                <h2>Browse Categories</h2>
              </div>
              <Link to="/blogs" className="magazine-read-link">All Blogs</Link>
            </div>
            <div className="magazine-category-list">
              {categories.map((category) => (
                <Link key={category._id} to={`/category/${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default HomePage;
