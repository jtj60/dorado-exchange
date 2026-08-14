import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function dataUriFromAssets(relPath, mime) {
  const absPath = path.join(__dirname, "..", "..", "..", "shared", "assets", relPath);
  const file = fs.readFileSync(absPath);
  return `data:${mime};base64,${file.toString("base64")}`;
}

export const LOGO_SRC = dataUriFromAssets("full.svg", "image/svg+xml");
export const ICON_PIN_SRC = dataUriFromAssets("pin.svg", "image/svg+xml");
export const ICON_PHONE_SRC = dataUriFromAssets("phone.svg", "image/svg+xml");
export const ICON_URL_SRC = dataUriFromAssets("url.svg", "image/svg+xml");
export const ICON_EMAIL_SRC = dataUriFromAssets("email.svg", "image/svg+xml");
