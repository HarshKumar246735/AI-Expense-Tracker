module.exports = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
