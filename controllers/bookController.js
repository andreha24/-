import * as web3Service from "../services/web3Service.js";
import { getFile, saveFile } from "../services/fileService.js";

export async function registerBook(req, res) {
  try {
    const { title, author, price } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Book file is required" });
    }

    const savedFile = await saveFile(file);

    const bookId = await web3Service.registerBook(
      title,
      author,
      price,
      savedFile.fileName
    );

    res.status(201).json({
      bookId,
      fileName: savedFile.fileName,
      size: savedFile.size,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to register book" + error });
  }
}

export async function buyBook(req, res) {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const receipt = await web3Service.buyBook(id, value);
    res.json({ success: true, transaction: receipt.hash });
  } catch (error) {
    res.status(500).json({ error: "Failed to buy book" });
  }
}

export async function downloadBook(req, res) {
  try {
    const { id } = req.params;

    const canDownloadBook = await web3Service.checkCanDownloadBook(id);

    if (!canDownloadBook) {
      res
        .status(403)
        .json({ error: `You don't have the right to download this book` });
      return;
    }

    const book = await web3Service.getBook(id);

    const file = await getFile(book.contentHash);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${book.contentHash}"`
    );
    res.setHeader("Content-Length", file.size);
    res.send(file.buffer);
  } catch (error) {
    res.status(500).json({ error: "Failed to download book" + error });
  }
}

export async function updateBookAvailability(req, res) {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const book = await web3Service.getBook(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const transaction = await web3Service.setBookAvailability(id, isAvailable);

    res.json({
      success: true,
      bookId: id,
      isAvailable,
      transaction: transaction.hash,
    });
  } catch (error) {
    if (error.message.includes("Not the book owner")) {
      res.status(403).json({ error: "Not authorized to update this book" });
    } else {
      res.status(500).json({ error: "Failed to update book availability" });
    }
  }
}

export async function updateBookPrice(req, res) {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ error: "Invalid price value" });
    }

    const book = await web3Service.getBook(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const transaction = await web3Service.setBookPrice(id, price);

    res.json({
      success: true,
      bookId: id,
      newPrice: price,
      transaction: transaction.hash,
    });
  } catch (error) {
    if (error.message.includes("Not the book owner")) {
      res.status(403).json({ error: "Not authorized to update this book" });
    } else {
      res.status(500).json({ error: "Failed to update book price" });
    }
  }
}
