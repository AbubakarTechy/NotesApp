const Note = require('../models/Note');
const User = require('../models/User');
const { isAdminUser } = require('../middleware/adminMiddleware');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// GET /api/notes
// Fetch all notes (supports sorting via query params e.g. ?sort=downloads or ?sort=latest)
exports.getNotes = async (req, res) => {
  try {
    const { sort, limit } = req.query;
    let query = Note.find();

    // Sorting
    if (sort === 'downloads') {
      query = query.sort({ downloads: -1 }); // Most downloaded first
    } else if (sort === 'latest') {
      query = query.sort({ createdAt: -1 }); // Latest uploaded first
    } else {
      query = query.sort({ createdAt: -1 }); // Default to latest
    }

    // Limit
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const notes = await query;
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes.', error: error.message });
  }
};

// GET /api/notes/:id
// Fetch a single note by its ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    res.status(200).json(note);
  } catch (error) {
    console.error('Error fetching note by ID:', error);
    res.status(500).json({ message: 'Error retrieving the note.', error: error.message });
  }
};

// POST /api/notes/upload
// Upload a note (PDF) and save record in DB (Protected Route)
exports.uploadNote = async (req, res) => {
  try {
    const { title, subject, semester, type } = req.body;
    
    // Validate fields
    if (!title || !subject || !semester || !type) {
      return res.status(400).json({ message: 'All fields (title, subject, semester, type) are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file.' });
    }

    let fileUrl = '';
    let cloudinaryUrl = '';
    const localFilename = req.file.filename;
    const localFilePath = req.file.path;

    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(localFilePath, {
          resource_type: 'raw',
          folder: 'campus_notes',
          use_filename: true,
          unique_filename: true,
          access_mode: 'public'
        });
        cloudinaryUrl = result.secure_url;
      } catch (cloudinaryErr) {
        console.error('Cloudinary upload failed, keeping local copy only:', cloudinaryErr);
      }
    }

    // Always serve from local uploads so preview/download work reliably
    fileUrl = `${req.protocol}://${req.get('host')}/uploads/${localFilename}`;

    // Save to MongoDB
    const newNote = new Note({
      title,
      subject,
      semester,
      type,
      fileUrl,
      cloudinaryUrl,
      localFilename,
      uploadedBy: req.user.name,
      uploadedByEmail: req.user.email,
      downloads: 0
    });

    await newNote.save();

    res.status(201).json({
      message: 'Note uploaded successfully!',
      note: newNote
    });

  } catch (error) {
    console.error('Error uploading note:', error);
    res.status(500).json({ message: 'Server error during note upload.', error: error.message });
  }
};

// GET /api/notes/mine
// Fetch notes uploaded by the logged-in user (admin only)
exports.getMyNotes = async (req, res) => {
  try {
    if (!isAdminUser(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const notes = await Note.find({ uploadedByEmail: req.user.email })
      .sort({ createdAt: -1 });

    const totalDownloads = notes.reduce((sum, note) => sum + note.downloads, 0);

    res.status(200).json({
      notes,
      stats: {
        totalUploads: notes.length,
        totalDownloads
      }
    });
  } catch (error) {
    console.error('Error fetching user notes:', error);
    res.status(500).json({ message: 'Error fetching your documents.', error: error.message });
  }
};

// GET /api/notes/search?q=
// Search notes by title or subject (case-insensitive)
exports.searchNotes = async (req, res) => {
  try {
    const query = req.query.q || '';
    
    const notes = await Note.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({ message: 'Error searching notes.', error: error.message });
  }
};

// GET /api/notes/semester/:sem
// Fetch notes filtered by semester (e.g. 1st to 8th)
exports.getNotesBySemester = async (req, res) => {
  try {
    const semester = req.params.sem;
    
    // Validate semester param against semesters 1 to 8
    const allowedSemesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
    if (!allowedSemesters.includes(semester)) {
      return res.status(400).json({ message: 'Invalid semester. Allowed semesters are 1st to 8th.' });
    }

    const notes = await Note.find({ semester }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes by semester:', error);
    res.status(500).json({ message: 'Error fetching notes for the specified semester.', error: error.message });
  }
};

// POST /api/notes/:id/download
// Increment the download count of a note (Protected, respects plan limits)
exports.incrementDownloads = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    // Fetch user from DB to check current real-time plan status and downloads count
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User profile not found. Please log in again.' });
    }

    // Check Plan Limits
    const userPlan = user.plan === 'Free' ? 'Basic' : user.plan;

    if (userPlan === 'Basic' && user.downloadsCount >= 2) {
      return res.status(403).json({
        message: 'Download Limit Reached! Basic plan accounts are limited to 2 document downloads.',
        limitExceeded: true,
        plan: 'Basic',
        maxAllowed: 2
      });
    }

    if (userPlan === 'Pro' && user.downloadsCount >= 5) {
      return res.status(403).json({
        message: 'Download Limit Reached! Pro plan accounts are limited to 5 document downloads.',
        limitExceeded: true,
        plan: 'Pro',
        maxAllowed: 5
      });
    }

    // Increment downloads count for the user and save
    user.downloadsCount += 1;
    await user.save();

    // Increment total download counter for the document itself and save
    note.downloads += 1;
    await note.save();

    res.status(200).json({ 
      downloads: note.downloads,
      downloadsCount: user.downloadsCount,
      fileUrl: `/api/notes/${note._id}/file`
    });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    res.status(500).json({ message: 'Error updating download count.', error: error.message });
  }
};

// GET /api/notes/:id/file
// Serve the PDF file for preview and download
exports.serveNoteFile = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    const safeTitle = (note.title || 'document').replace(/[^\w\s.-]/g, '').trim() || 'document';

    // 1. Try local file on disk
    const filename = note.localFilename || (note.fileUrl.includes('/uploads/') ? note.fileUrl.split('/uploads/')[1] : '');
    if (filename) {
      const localFilePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(localFilePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${safeTitle}.pdf"`);
        return fs.createReadStream(localFilePath).pipe(res);
      }
    }

    // 2. Try Cloudinary URL (works if PDF delivery is enabled in Cloudinary settings)
    const remoteUrl = note.cloudinaryUrl || (note.fileUrl.includes('cloudinary.com') ? note.fileUrl : '');
    if (remoteUrl) {
      const response = await fetch(remoteUrl);
      if (response.ok) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${safeTitle}.pdf"`);
        const buffer = Buffer.from(await response.arrayBuffer());
        return res.send(buffer);
      }
    }

    return res.status(404).json({
      message: 'File not found on server. Please re-upload this document.'
    });
  } catch (error) {
    console.error('Error serving note file:', error);
    res.status(500).json({ message: 'Error serving document file.', error: error.message });
  }
};

// DELETE /api/notes/:id (Protected, Admin Only)
exports.deleteNote = async (req, res) => {
  try {
    if (!isAdminUser(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    // Optional: Delete physical file if local or from Cloudinary if Cloudinary is used
    if (note.fileUrl.includes('/uploads/')) {
      const filename = note.fileUrl.split('/uploads/')[1];
      const localFilePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }

    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteNote controller:', error);
    res.status(500).json({ message: 'Error deleting document.', error: error.message });
  }
};
