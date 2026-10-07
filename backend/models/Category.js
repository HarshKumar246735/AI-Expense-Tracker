const mongoose = require("mongoose");
const { TRANSACTION_TYPES } = require("../constants");

const categorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: [true, "Category name is required"], trim: true, maxlength: 40 },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    color: {
      type: String,
      match: [/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #3b5bdb"],
      default: "#868e96",
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A user cannot have two categories with the same name (case-insensitive) and type
categorySchema.index({ userId: 1, type: 1, name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

module.exports = mongoose.model("Category", categorySchema);
