const { sendContactEmail } = require("../services/emailService");

const submitContactMessage = async(req, res) => {
    try {
        await sendContactEmail(req.body);
        return res.status(200).json({
            success: true,
            message: "Message sent successfully.",
        });
    } catch (error) {
        const notConfigured = error.code === "EMAIL_NOT_CONFIGURED";
        if (!notConfigured) {
            console.error("Contact email delivery failed:", error.code || "UNKNOWN_ERROR");
        }

        return res.status(notConfigured ? 503 : 502).json({
            success: false,
            message: notConfigured
                ? "Contact form is temporarily unavailable."
                : "Unable to deliver your message right now. Please try again later.",
        });
    }
};

module.exports = { submitContactMessage };
