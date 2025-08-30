import path from "path";
import fs from "fs";

const uploadsDir = path.resolve("uploads");
const agreementsDir = path.join(uploadsDir, "agreements");

// Ensure agreements directory exists
if (!fs.existsSync(agreementsDir)) {
  fs.mkdirSync(agreementsDir, { recursive: true });
}

export const UPLOADS_DIR = uploadsDir;
export const AGREEMENTS_DIR = agreementsDir;
