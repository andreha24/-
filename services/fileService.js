import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

async function initializeStorage() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (error) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export function generateUniqueFileName(originalName) {
  const timestamp = Date.now();
  const hash = crypto.randomBytes(8).toString("hex");
  const extension = path.extname(originalName);
  return `${timestamp}-${hash}${extension}`;
}

export async function saveFile(file) {
  try {
    const fileName = generateUniqueFileName(file.originalname);
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, file.buffer);

    return {
      fileName,
      filePath,
      size: file.size,
      mimeType: file.mimetype,
    };
  } catch (error) {
    throw new Error("Failed to save file" + error);
  }
}

export async function getFile(fileName) {
  try {
    const filePath = path.join(UPLOAD_DIR, fileName);
    const file = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);

    return {
      buffer: file,
      size: stats.size,
      filePath,
    };
  } catch (error) {
    throw new Error("File not found");
  }
}

export async function deleteFile(fileName) {
  try {
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.unlink(filePath);
  } catch (error) {
    throw new Error("Failed to delete file");
  }
}

export async function fileExists(fileName) {
  try {
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

initializeStorage();
