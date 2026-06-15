import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    slug: {
      type: String,
      unique: true, // ← URL friendly name (electronics → electronics)
      lowercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// ─── Slug auto generate ─────────────────────────────────────────────────────
categorySchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/ /g, "-");
  }
});

export const Category = mongoose.model("Category", categorySchema);
