const errorMiddleware = (err, req, res, next) => {
    const isContactRequest = req.path === "/api/contact" || req.path.startsWith("/api/contact/");
    if (isContactRequest) {
        console.error("Contact request failed:", err.code || err.name || "UNKNOWN_ERROR");
    } else {
        console.error("API Error:", err);
    }

    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Internal Server Error";

    if (err.code === 11000) {
        statusCode = 409;
        message = "A record with this value already exists.";
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID.";
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        statusCode = 400;
        message = "Invalid JSON request body.";
    }

    if (err.name === "MulterError") {
        statusCode = 400;
        message = `Upload error: ${err.message}`;
    }

    if (isContactRequest && statusCode >= 500) {
        message = "Unable to process your message right now. Please try again later.";
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && !isContactRequest && {
            stack: err.stack,
        }),
    });
};

module.exports = errorMiddleware;