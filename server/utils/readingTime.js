const readingTime = (content) => {
    if (!content) return 1;

    const extractText = (node) => {
        if (!node) return "";

        if (typeof node === "string") return node;

        if (Array.isArray(node)) {
            return node.map(extractText).join(" ");
        }

        return [
            node.text || "",
            extractText(node.content),
        ].join(" ");
    };

    const words = extractText(content)
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 200));
};

module.exports = readingTime;