import React from "react";
import { Link } from "react-router-dom";
import { Code2, Cpu, ShieldCheck, Cloud, ArrowRight } from "lucide-react";
import usePageMetadata from "../../hooks/usePageMetadata";

const AboutPage = () => {
  usePageMetadata(
    "About",
    "Learn about TechPulse, our editorial mission, and the technology topics we cover."
  );

  return (
    <div className="magazine-container py-8 sm:py-10">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="pb-5 border-b border-[#E5E5E5] mb-6">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171717] mb-2 tracking-tight">
            About TechPulse
          </h1>
          <p className="text-sm text-[#666666] leading-relaxed">
            A technology publication dedicated to product engineering, AI strategy, and the systems shaping the modern digital economy.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8 text-sm sm:text-base text-[#222222] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">
              Our Mission
            </h2>
            <p className="text-[#666666] leading-relaxed">
              TechPulse is a destination for thoughtful technology journalism, software architecture analysis, and practical guides for teams shipping real products. We focus on useful reporting, education, and production-tested insight without the noise of generic marketing content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-4">
              Core Technical Tracks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white border border-[#E5E5E5]">
                <div className="flex items-center gap-2 font-bold text-[#171717] text-sm mb-1.5">
                  <Code2 className="w-4 h-4 text-[#171717]" />
                  <span>Software Development</span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Design patterns, language paradigms, code maintainability, refactoring, and automated testing.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#E5E5E5]">
                <div className="flex items-center gap-2 font-bold text-[#171717] text-sm mb-1.5">
                  <Cpu className="w-4 h-4 text-[#171717]" />
                  <span>Artificial Intelligence</span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Machine learning, large language models, inference optimization, and autonomous reasoning.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#E5E5E5]">
                <div className="flex items-center gap-2 font-bold text-[#171717] text-sm mb-1.5">
                  <Cloud className="w-4 h-4 text-[#171717]" />
                  <span>Cloud Computing & DevOps</span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Distributed systems, Kubernetes orchestration, serverless pipelines, and observability.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#E5E5E5]">
                <div className="flex items-center gap-2 font-bold text-[#171717] text-sm mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#171717]" />
                  <span>Cybersecurity</span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Zero-trust security architecture, authentication protocols, penetration testing, and compliance.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">
              Technical Stack
            </h2>
            <p className="text-[#666666] mb-3">
              This entire platform is built using the MERN stack with modern web standards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#666666]">
              <li><strong className="text-[#171717]">Frontend:</strong> React 19, Vite, Tailwind CSS, Tiptap rich text editor.</li>
              <li><strong className="text-[#171717]">Backend:</strong> Node.js, Express, REST APIs, Joi validation, Helmet security.</li>
              <li><strong className="text-[#171717]">Database:</strong> MongoDB Atlas with Mongoose schemas and indexing.</li>
              <li><strong className="text-[#171717]">Authentication:</strong> JSON Web Tokens (JWT) and bcryptjs hashing.</li>
              <li><strong className="text-[#171717]">Media:</strong> Multer and Cloudinary cloud storage.</li>
            </ul>
          </section>

          <section className="pt-6 border-t border-[#E5E5E5]">
            <p className="text-xs sm:text-sm text-[#666666]">
              Interested in exploring articles? Head over to the{" "}
              <Link to="/blogs" className="text-[#171717] font-semibold hover:underline">
                Articles Archive
              </Link>{" "}
              or{" "}
              <Link to="/contact" className="text-[#171717] font-semibold hover:underline">
                Contact our Editorial Desk
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
