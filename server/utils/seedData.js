require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Joi = require("joi");

const Admin = require("../models/Admin");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const Author = require("../models/Author");
const Blog = require("../models/Blog");
const generateSlug = require("./generateSlug");

const seedDatabase = async() => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB successfully.");

        let admin = await Admin.findOne({ role: "admin", isActive: true }).sort({ createdAt: 1 });

        if (!admin) {
            const adminName = process.env.ADMIN_NAME?.trim();
            const adminEmail = process.env.ADMIN_EMAIL?.trim();
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminName || !adminEmail || !adminPassword) {
                const error = new Error("Initial admin setup requires ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD environment variables.");
                error.code = "INITIAL_ADMIN_CONFIGURATION_REQUIRED";
                throw error;
            }

            const { error: validationError } = Joi.object({
                name: Joi.string().trim().max(100).required(),
                email: Joi.string().trim().email().max(255).required(),
                password: Joi.string().min(8).required(),
            }).validate({ name: adminName, email: adminEmail, password: adminPassword });

            if (validationError) {
                const error = new Error("Initial admin configuration is invalid. Check the name, email format, and password requirements.");
                error.code = "INITIAL_ADMIN_CONFIGURATION_INVALID";
                throw error;
            }

            const existingAdmin = await Admin.findOne({ email: adminEmail.toLowerCase() });
            if (existingAdmin) {
                const error = new Error("An admin account with the configured email already exists but is inactive. No account was changed.");
                error.code = "INITIAL_ADMIN_ACCOUNT_INACTIVE";
                throw error;
            }

            admin = await Admin.create({
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: "admin",
                isActive: true,
            });
            console.log("Created initial admin account from environment configuration.");
        } else {
            console.log("Using existing active admin account for seed records.");
        }

        const categoryData = [
            {
                name: "Software Development",
                description: "Modern software design principles, architecture, patterns, and programming languages.",
            },
            {
                name: "Artificial Intelligence",
                description: "Deep learning, LLMs, neural networks, automation, and computer vision breakthroughs.",
            },
            {
                name: "Cloud Computing",
                description: "Cloud-native infrastructure, serverless architectures, and distributed systems at scale.",
            },
            {
                name: "Cybersecurity",
                description: "Zero-trust architecture, threat mitigation, encryption protocols, and application security.",
            },
            {
                name: "Web & Mobile",
                description: "Cutting-edge frontend frameworks, responsive UI/UX, progressive web apps, and mobile development.",
            },
        ];

        const categories = {};
        for (const cat of categoryData) {
            let existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                existing = await Category.create({
                    name: cat.name,
                    slug: generateSlug(cat.name),
                    description: cat.description,
                    createdBy: admin._id,
                    isActive: true,
                });
                console.log(`Created Category: ${cat.name}`);
            }
            categories[cat.name] = existing;
        }

        const tagNames = [
            "React", "Node.js", "Python", "Machine Learning", "Kubernetes",
            "TypeScript", "Cloud Architecture", "DevOps", "Microservices", "Next.js"
        ];
        const tags = {};
        for (const name of tagNames) {
            let existing = await Tag.findOne({ name });
            if (!existing) {
                existing = await Tag.create({
                    name,
                    slug: generateSlug(name),
                    description: `Articles and guides focusing on ${name}`,
                    createdBy: admin._id,
                    isActive: true,
                });
                console.log(`Created Tag: ${name}`);
            }
            tags[name] = existing;
        }

        const authorData = [
            {
                name: "Dr. Elena Vance",
                designation: "Principal AI Research Scientist",
                bio: "PhD in Machine Learning from MIT. Leading research initiatives on next-generation LLM reasoning architectures and distributed inference engines.",
                profileImage: {
                    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
                    publicId: "seed-author-elena",
                },
                socialLinks: {
                    linkedin: "https://linkedin.com/in/elena-vance",
                    twitter: "https://x.com/elenavance_ai",
                    website: "https://elenavance.dev",
                },
            },
            {
                name: "Marcus Chen",
                designation: "Staff Cloud Systems Architect",
                bio: "Specializing in high-throughput cloud infrastructure, Kubernetes orchestration, and resilient multi-region cloud services.",
                profileImage: {
                    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                    publicId: "seed-author-marcus",
                },
                socialLinks: {
                    linkedin: "https://linkedin.com/in/marcus-chen-cloud",
                    twitter: "https://x.com/marcuschen_sre",
                    website: "https://marcuschen.tech",
                },
            },
            {
                name: "Sarah Jenkins",
                designation: "Lead Frontend Engineer",
                bio: "Full-stack developer with 10+ years architecting web applications, design systems, and developer ergonomics across enterprise ecosystems.",
                profileImage: {
                    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
                    publicId: "seed-author-sarah",
                },
                socialLinks: {
                    linkedin: "https://linkedin.com/in/sarahjenkins-dev",
                    twitter: "https://x.com/sarahjenkins_fe",
                    website: "https://sarahjenkins.io",
                },
            },
        ];

        const authors = {};
        for (const auth of authorData) {
            let existing = await Author.findOne({ name: auth.name });
            if (!existing) {
                existing = await Author.create({
                    name: auth.name,
                    slug: generateSlug(auth.name),
                    designation: auth.designation,
                    bio: auth.bio,
                    profileImage: auth.profileImage,
                    socialLinks: auth.socialLinks,
                    createdBy: admin._id,
                    isActive: true,
                });
                console.log(`Created Author: ${auth.name}`);
            }
            authors[auth.name] = existing;
        }

        const existingBlogsCount = await Blog.countDocuments();
        if (existingBlogsCount === 0) {
            console.log("Seeding sample technology blog posts...");

            const sampleBlogs = [
                {
                    title: "Architecting Resilient Microservices with Node.js and Event-Driven Pipelines",
                    slug: "architecting-resilient-microservices-nodejs-event-driven",
                    excerpt: "Learn how modern enterprise engineering teams build fault-tolerant microservice architectures with Node.js, distributed message brokers, and self-healing orchestration.",
                    category: categories["Software Development"]._id,
                    tags: [tags["Node.js"]._id, tags["Microservices"]._id, tags["Cloud Architecture"]._id],
                    author: authors["Marcus Chen"]._id,
                    isFeatured: true,
                    status: "published",
                    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    readingTime: 6,
                    featuredImage: {
                        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
                        publicId: "seed-blog-microservices",
                        altText: "Distributed microservices and cloud servers",
                    },
                    seo: {
                        metaTitle: "Architecting Resilient Microservices with Node.js",
                        metaDescription: "Guide to building resilient microservice pipelines with Node.js and message queues.",
                        keywords: ["Node.js", "Microservices", "Event-Driven", "Cloud"],
                    },
                    content: {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "In distributed system design, resilience is not an afterthought—it is a core requirement. When individual components fail in a distributed cluster, how does the system gracefully degrade rather than trigger cascading outages?",
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 2 },
                                content: [{ type: "text", text: "Decoupling Services via Event-Driven Architecture" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Synchronous REST calls between microservices create hard temporal coupling. If Service B undergoes maintenance or experiences latency spikes, Service A quickly exhausts its connection pool. Switching to event streams with Kafka or RabbitMQ isolates producers from consumers.",
                                }],
                            },
                            {
                                type: "blockquote",
                                content: [{
                                    type: "paragraph",
                                    content: [{
                                        type: "text",
                                        text: "Resilient systems do not prevent failure; they expect failure and isolate its blast radius.",
                                    }],
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 3 },
                                content: [{ type: "text", text: "Implementing Circuit Breakers" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "A circuit breaker monitors calls to external dependencies. When failures breach a threshold, the circuit trips open, immediately returning cached or fallback responses without saturating worker threads.",
                                }],
                            },
                            {
                                type: "codeBlock",
                                attrs: { language: "javascript" },
                                content: [{
                                    type: "text",
                                    text: "const CircuitBreaker = require('opossum');\n\nasync function callRemoteService(params) {\n  return await axios.post('https://api.internal/v1/process', params);\n}\n\nconst breaker = new CircuitBreaker(callRemoteService, {\n  timeout: 3000,\n  errorThresholdPercentage: 50,\n  resetTimeout: 10000\n});\n\nbreaker.fallback(() => ({ cached: true, data: [] }));",
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 2 },
                                content: [{ type: "text", text: "Summary and Best Practices" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Deploying idempotent handlers, comprehensive OpenTelemetry tracing, and graceful degradation strategies ensures your backend ecosystem maintains 99.99% availability even under peak global loads.",
                                }],
                            },
                        ],
                    },
                },
                {
                    title: "The Evolution of Large Language Model Reasoning: Chains, Trees, and Graphs",
                    slug: "evolution-large-language-model-reasoning",
                    excerpt: "Explore how frontier AI systems transition from raw token prediction to multi-step recursive reasoning, tree-of-thoughts search, and autonomous problem decomposition.",
                    category: categories["Artificial Intelligence"]._id,
                    tags: [tags["Machine Learning"]._id, tags["Python"]._id],
                    author: authors["Dr. Elena Vance"]._id,
                    isFeatured: true,
                    status: "published",
                    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    readingTime: 8,
                    featuredImage: {
                        url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80",
                        publicId: "seed-blog-ai-reasoning",
                        altText: "Abstract neural network representation",
                    },
                    seo: {
                        metaTitle: "Large Language Model Reasoning: Chains, Trees, and Graphs",
                        metaDescription: "Comprehensive overview of advanced reasoning architectures in generative AI.",
                        keywords: ["AI", "LLM", "Deep Learning", "Reasoning"],
                    },
                    content: {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Over the last twenty-four months, foundational artificial intelligence models have evolved from autoregressive sentence completion engines into sophisticated multi-step reasoning engines capable of complex deduction.",
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 2 },
                                content: [{ type: "text", text: "From Next-Token Prediction to Deliberative Search" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Standard autoregressive sampling generates words based on localized probabilities. However, complex mathematical derivations and software engineering require backtracking, hypothetical branch evaluation, and self-correction.",
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 3 },
                                content: [{ type: "text", text: "Tree of Thoughts (ToT) Architecture" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Tree of Thoughts allows models to deliberately explore multiple reasoning paths simultaneously. By evaluating prospective thoughts with self-scoring heuristics, the model traverses decision graphs using depth-first or breadth-first algorithms.",
                                }],
                            },
                            {
                                type: "blockquote",
                                content: [{
                                    type: "paragraph",
                                    content: [{
                                        type: "text",
                                        text: "Autonomous reasoning requires not only intelligence, but the ability to recognize mistakes and rewrite hypotheses before committing to an output.",
                                    }],
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 2 },
                                content: [{ type: "text", text: "Practical Implications for Software Engineers" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Engineers leveraging LLMs in production can integrate structured reasoning frameworks using agentic loops, state verifiers, and sandboxed test execution environments to achieve deterministic results.",
                                }],
                            },
                        ],
                    },
                },
                {
                    title: "Modern Frontend Engineering: Server Components, React 19, and Hybrid Renders",
                    slug: "modern-frontend-engineering-react-19-server-components",
                    excerpt: "A deep dive into React 19 architecture, asset preloading, Actions, optimistic state mutations, and zero-bundle-size server components.",
                    category: categories["Web & Mobile"]._id,
                    tags: [tags["React"]._id, tags["TypeScript"]._id, tags["Next.js"]._id],
                    author: authors["Sarah Jenkins"]._id,
                    isFeatured: false,
                    status: "published",
                    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    readingTime: 5,
                    featuredImage: {
                        url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80",
                        publicId: "seed-blog-react-19",
                        altText: "React code visualization on screen",
                    },
                    seo: {
                        metaTitle: "React 19 & Modern Frontend Engineering Best Practices",
                        metaDescription: "In-depth breakdown of React 19 features, actions, and server rendering paradigms.",
                        keywords: ["React 19", "JavaScript", "Frontend", "Web Development"],
                    },
                    content: {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "React 19 marks one of the most substantial leaps in web application architecture. By consolidating Actions, server functions, asset preloading, and enhanced ref handling, frontend development has reached a new standard of developer velocity and runtime performance.",
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 2 },
                                content: [{ type: "text", text: "First-Class Asynchronous Actions" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Gone are the days of manual useState boilerplate for tracking pending states, error handling, and rollback logic. React 19 introduces useActionState and useOptimistic, standardizing mutations across client and server.",
                                }],
                            },
                            {
                                type: "codeBlock",
                                attrs: { language: "javascript" },
                                content: [{
                                    type: "text",
                                    text: "function UpdateProfileForm({ user, updateAction }) {\n  const [state, formAction, isPending] = useActionState(updateAction, null);\n  return (\n    <form action={formAction}>\n      <input name=\"name\" defaultValue={user.name} />\n      <button type=\"submit\" disabled={isPending}>\n        {isPending ? 'Saving...' : 'Update Name'}\n      </button>\n      {state?.error && <p className=\"error\">{state.error}</p>}\n    </form>\n  );\n}",
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 2 },
                                content: [{ type: "text", text: "Eliminating Waterfall Dependencies" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Integrated resource preloading APIs like preload, preinit, and prefetchDNS allow applications to trigger critical font, style, and script fetches early in the render cycle, dramatically improving Core Web Vitals.",
                                }],
                            },
                        ],
                    },
                },
                {
                    title: "Kubernetes in Production: Zero-Downtime Deployments and Multi-Cluster Networking",
                    slug: "kubernetes-production-zero-downtime-deployments",
                    excerpt: "Proven strategies for configuring ingress controllers, eBPF network meshes, pod disruption budgets, and automated canary rollouts at scale.",
                    category: categories["Cloud Computing"]._id,
                    tags: [tags["Kubernetes"]._id, tags["DevOps"]._id, tags["Cloud Architecture"]._id],
                    author: authors["Marcus Chen"]._id,
                    isFeatured: false,
                    status: "published",
                    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    readingTime: 7,
                    featuredImage: {
                        url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&auto=format&fit=crop&q=80",
                        publicId: "seed-blog-k8s",
                        altText: "Cloud server data center with fiber optics",
                    },
                    seo: {
                        metaTitle: "Kubernetes Production Best Practices & Zero Downtime",
                        metaDescription: "Mastering Kubernetes deployments, Pod Disruption Budgets, and eBPF.",
                        keywords: ["Kubernetes", "DevOps", "Containers", "Cloud"],
                    },
                    content: {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Running Kubernetes clusters in production demands rigorous operational discipline. A misconfigured readiness probe or aggressive rolling update strategy can easily drop live traffic during routine releases.",
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 2 },
                                content: [{ type: "text", text: "Pod Disruption Budgets (PDB) & Graceful Termination" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Pod Disruption Budgets ensure a minimum threshold of replicas remains healthy during voluntary disruptions like node upgrades and cluster autoscaling events.",
                                }],
                            },
                            {
                                type: "blockquote",
                                content: [{
                                    type: "paragraph",
                                    content: [{
                                        type: "text",
                                        text: "Always pair preStop lifecycle hooks with terminationGracePeriodSeconds to permit in-flight HTTP requests to complete before SIGKILL is dispatched.",
                                    }],
                                }],
                            },
                        ],
                    },
                },
                {
                    title: "Zero-Trust Cybersecurity Architecture for Cloud-Native Enterprises",
                    slug: "zero-trust-cybersecurity-architecture-cloud-native",
                    excerpt: "Why the traditional perimeter security model is dead, and how continuous verification, mTLS, and identity-aware proxies protect modern digital assets.",
                    category: categories["Cybersecurity"]._id,
                    tags: [tags["Cloud Architecture"]._id, tags["DevOps"]._id],
                    author: authors["Dr. Elena Vance"]._id,
                    isFeatured: false,
                    status: "published",
                    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    readingTime: 6,
                    featuredImage: {
                        url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
                        publicId: "seed-blog-security",
                        altText: "Cybersecurity digital shield visualization",
                    },
                    seo: {
                        metaTitle: "Zero-Trust Cybersecurity for Cloud-Native Enterprises",
                        metaDescription: "Detailed guide to zero-trust architecture, identity verification, and mTLS.",
                        keywords: ["Cybersecurity", "Zero Trust", "Cloud", "Encryption"],
                    },
                    content: {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "The traditional network perimeter paradigm—where everything inside the firewall is trusted—is fundamentally obsolete. In modern multi-cloud hybrid setups, attackers can pivot laterally once a single host is breached.",
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 2 },
                                content: [{ type: "text", text: "The Three Pillars of Zero Trust" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Zero-trust architecture enforces three non-negotiable principles: verify explicitly, apply least-privileged access, and always assume breach.",
                                }],
                            },
                            {
                                type: "heading",
                                attrs: { level: 3 },
                                content: [{ type: "text", text: "Enforcing Mutual TLS Everywhere" }],
                            },
                            {
                                type: "paragraph",
                                content: [{
                                    type: "text",
                                    text: "Service meshes transparently inject mTLS sidecars, guaranteeing cryptographically verified workload identities with short-lived X.509 certificates.",
                                }],
                            },
                        ],
                    },
                },
            ];

            for (const blog of sampleBlogs) {
                await Blog.create({
                    ...blog,
                    createdBy: admin._id,
                });
                console.log(`Created Blog: ${blog.title}`);
            }
        }

        console.log("Database seeded successfully!");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        if (error && typeof error.code === "string" && error.code.startsWith("INITIAL_ADMIN_")) {
            console.error(error.message);
        } else {
            const errorType = error && error.name ? error.name : "Error";
            console.error("Seeding failed (" + errorType + "). Check database connectivity and seed data; environment values were not logged.");
        }
        process.exit(1);
    }
};

if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
