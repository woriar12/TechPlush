const sendContactEmail = async({ name, email, subject, message }) => {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.CONTACT_EMAIL_FROM?.trim();
    const to = process.env.CONTACT_EMAIL_TO?.trim();

    if (!apiKey || !from || !to) {
        const error = new Error("Contact email delivery is not configured.");
        error.code = "EMAIL_NOT_CONFIGURED";
        throw error;
    }

    let response;
    try {
        response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from,
                to: [to],
                reply_to: email,
                subject: `[TechPulse Contact] ${subject || "New message"}`,
                text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
            }),
            signal: AbortSignal.timeout(10000),
        });
    } catch {
        const error = new Error("Contact email delivery failed.");
        error.code = "EMAIL_DELIVERY_FAILED";
        throw error;
    }

    if (!response.ok) {
        const error = new Error("Contact email delivery failed.");
        error.code = "EMAIL_DELIVERY_FAILED";
        throw error;
    }
};

module.exports = { sendContactEmail };
