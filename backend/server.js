const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 5000;

// uploads folder
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

app.post("/convert", upload.single("file"), async (req, res) => {
  const inputFile = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let format = (req.body.format || "png").toLowerCase();

    if (format === "jpg") format = "jpeg";

    const allowed = ["png", "jpeg", "webp"];
    if (!allowed.includes(format)) {
      return res.status(400).json({ error: "Unsupported format" });
    }

    const outputPath = `${inputFile}-output.${format}`;

    let image = sharp(inputFile);

    if (format === "jpeg") image = image.jpeg();
    if (format === "png") image = image.png();
    if (format === "webp") image = image.webp();

    await image.toFile(outputPath);

    res.download(outputPath, () => {
      // cleanup
      fs.unlink(inputFile, () => {});
      fs.unlink(outputPath, () => {});
    });

  } catch (err) {
    console.error("Conversion error:", err);

    if (inputFile) fs.unlink(inputFile, () => {});

    res.status(500).json({ error: "Server error during conversion" });
  }
});

app.get("/", (req, res) => {
  res.send("Image Converter API is running 🚀");
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});