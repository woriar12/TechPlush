import React, { useRef, useState } from "react";
import { MapPin, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import usePageMetadata from "../../hooks/usePageMetadata";
import { submitContactMessage } from "../../services/contactService";

const ContactPage = () => {
  usePageMetadata(
    "Contact",
    "Contact the TechPulse editorial team with story ideas, feedback, and publication inquiries."
  );
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submissionInProgress = useRef(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submissionInProgress.current) return;

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    submissionInProgress.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to send your message.");
      }

      setSubmitted(true);
      showToast("Message sent! Our editorial team will review it shortly.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to send your message. Please try again.";
      setSubmitError(message);
      showToast(message, "error");
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="magazine-container py-8 sm:py-10">
      {/* Header */}
      <div className="pb-5 border-b border-[#E5E5E5] mb-8 max-w-2xl">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171717] mb-2 tracking-tight">
          Contact Us
        </h1>
        <p className="text-sm text-[#666666] leading-relaxed">
          Have an inquiry, feedback, or a suggestion for a tutorial? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl">
        {/* Left Column: Direct Contacts */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h2 className="text-base font-bold text-[#171717] uppercase tracking-wider mb-3">
              Editorial Desks
            </h2>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-white border border-[#E5E5E5] rounded-lg">
                <span className="block font-semibold text-[#171717] mb-1">
                  General & Article Inquiries
                </span>
                <p className="text-xs text-[#666666] mb-2">
                  Feedback on published technical guides, errata, or author pitches.
                </p>
                <a
                  href="mailto:editorial@techpulse.io"
                  className="text-xs font-mono font-medium text-[#171717] hover:underline"
                >
                  editorial@techpulse.io
                </a>
              </div>

              <div className="p-4 bg-white border border-[#E5E5E5] rounded-lg">
                <span className="block font-semibold text-[#171717] mb-1">
                  Press & Media Relations
                </span>
                <p className="text-xs text-[#666666] mb-2">
                  Media kits, interview requests, and syndication permissions.
                </p>
                <a
                  href="mailto:press@techpulse.io"
                  className="text-xs font-mono font-medium text-[#171717] hover:underline"
                >
                  press@techpulse.io
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#171717] uppercase tracking-wider mb-3">
              Publication HQ
            </h2>
            <div className="flex items-start gap-3 text-sm text-[#666666] p-4 bg-white border border-[#E5E5E5] rounded-lg">
              <MapPin className="w-5 h-5 text-[#171717] flex-shrink-0 mt-0.5" />
              <div>
                <span className="block font-semibold text-[#171717]">TechPulse Media</span>
                <span className="text-xs">500 Howard Street, Suite 400</span>
                <br />
                <span className="text-xs">San Francisco, CA 94105</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-[#E5E5E5] rounded-md p-6 sm:p-8">
            <h2 className="font-heading text-lg font-bold text-[#171717] mb-1">
              Send a Direct Note
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mb-6">
              Fill out the form below. We typically respond within 1-2 business days.
            </p>

            {submitted ? (
              <div className="p-6 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-[#171717] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#171717] mb-1">
                  Thank You for Your Message
                </h3>
                <p className="text-xs text-[#666666] mb-4">
                  Your message has been sent to our editorial team.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-[#171717] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} aria-describedby={submitError ? "contact-submit-error" : undefined} className="space-y-4">
                {submitError && (
                  <div
                    id="contact-submit-error"
                    className="p-3 bg-red-50 border border-red-200 rounded text-sm text-[#B42333]"
                  >
                    {submitError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      required
                      aria-required="true"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded text-sm text-[#171717] placeholder-[#716B65] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      required
                      aria-required="true"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded text-sm text-[#171717] placeholder-[#716B65] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                    Topic / Subject
                  </label>
                  <input
                    type="text"
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Editorial feedback on Kubernetes article"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded text-sm text-[#171717] placeholder-[#716B65] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    id="contact-message"
                    name="message"
                    required
                    aria-required="true"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your note or question here..."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded text-sm text-[#171717] placeholder-[#716B65] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#171717] hover:bg-[#333333] text-white text-xs font-semibold rounded shadow-xs disabled:opacity-50 transition-colors w-full sm:w-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Sending..." : "Submit Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
