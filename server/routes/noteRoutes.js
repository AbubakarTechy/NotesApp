const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

// Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer file validation (only allow PDF files)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// GET /api/notes/search -> Search notes (Must place BEFORE /:id route)
router.get('/search', noteController.searchNotes);

// GET /api/notes/mine -> Get logged-in user's uploaded documents
router.get('/mine', authMiddleware, noteController.getMyNotes);

// GET /api/notes/semester/:sem -> Filter notes by semester
router.get('/semester/:sem', noteController.getNotesBySemester);

// GET /api/notes -> Get all notes (optionally sorted/limited)
router.get('/', noteController.getNotes);

// GET /api/notes/:id/file -> Serve PDF for preview/download (before /:id)
router.get('/:id/file', noteController.serveNoteFile);

// GET /api/notes/:id -> Get single note details
router.get('/:id', noteController.getNoteById);

// POST /api/notes/upload -> Upload a PDF note (Protected)
router.post('/upload', authMiddleware, upload.single('pdf'), noteController.uploadNote);

// POST /api/notes/:id/download -> Increment downloads counter (Protected)
router.post('/:id/download', authMiddleware, noteController.incrementDownloads);

// DELETE /api/notes/:id -> Delete a note document (Protected, Admin Only)
router.delete('/:id', authMiddleware, noteController.deleteNote);

module.exports = router;
