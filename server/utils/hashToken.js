const { createHash } = require("crypto");

const hashToken = (token) =>
    createHash("sha256").update(token).digest("hex");

module.exports = hashToken;
