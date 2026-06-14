const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors({
  origin: "*"
}));

const PORT = process.env.PORT || 5001;

const upload = multer({ dest: "uploads/" });

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.post("/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let format = req.body.format || "png";

    if (format === "jpg") format = "jpeg";

    const outputPath = `${req.file.path}-output.${format}`;

    let image = sharp(req.file.path);

    if (format === "jpeg") {
      image = image.jpeg();
    } else if (format === "png") {
      image = image.png();
    } else if (format === "webp") {
      image = image.webp();
    } else {
      return res.status(400).json({ error: "Unsupported format" });
    }

    await image.toFile(outputPath);

    res.download(outputPath, () => {
      fs.unlink(req.file.path, () => {});
      fs.unlink(outputPath, () => {});
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});