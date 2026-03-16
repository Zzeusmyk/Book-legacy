const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const jwt      = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const crypto   = require('crypto');

const { Database, genId, now, formatBytes } = require('./db');

const app    = express();
const PORT   = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'booklegacy-secret-key-2024';

// ── Directories ──────────────────────────────────────────────
const dataDir    = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
[dataDir, uploadsDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── Database ─────────────────────────────────────────────────
const db = new Database(dataDir);

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// ── Multer ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'video/mp4', 'video/webm', 'video/quicktime',
      'video/mpeg', 'video/x-msvideo', 'video/x-matroska', 'video/ogg',
    ];
    const exts = ['.mp4', '.webm', '.mov', '.mpeg', '.mpg', '.avi', '.mkv', '.ogg'];
    const ext  = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(file.mimetype) || exts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed (mp4, webm, mov, avi, mkv)'));
    }
  },
});

// ── Auth middleware ──────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.authorId  = decoded.id;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Session expired, please sign in again'
      : 'Invalid authentication token';
    res.status(401).json({ error: msg });
  }
};

// ── Validation helpers ───────────────────────────────────────
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const safeAuthor = (a) => ({
  id: a.id, email: a.email, author_name: a.author_name,
  book_title: a.book_title, bio: a.bio,
  avatar_color: a.avatar_color, created_at: a.created_at,
});

// ────────────────────────────────────────────────────────────
// AUTH ROUTES
// ────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, author_name, book_title } = req.body;

    if (!email || !password || !author_name || !book_title) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!validEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (author_name.trim().length < 2) {
      return res.status(400).json({ error: 'Author name must be at least 2 characters' });
    }
    if (book_title.trim().length < 2) {
      return res.status(400).json({ error: 'Book title must be at least 2 characters' });
    }

    const emailLc = email.toLowerCase().trim();
    if (db.authors.findOne((a) => a.email === emailLc)) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const colors   = ['#f97316','#6366f1','#10b981','#3b82f6','#ec4899','#8b5cf6'];
    const avatar_color = colors[Math.floor(Math.random() * colors.length)];
    const n        = now();
    const author   = db.authors.insert({
      id:            genId('author'),
      email:         emailLc,
      password_hash: bcryptjs.hashSync(password, 10),
      author_name:   author_name.trim(),
      book_title:    book_title.trim(),
      bio:           '',
      avatar_color,
      created_at:    n,
      updated_at:    n,
    });

    const token = jwt.sign({ id: author.id }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, author: safeAuthor(author) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const author = db.authors.findOne((a) => a.email === email.toLowerCase().trim());
    if (!author || !bcryptjs.compareSync(password, author.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: author.id }, SECRET, { expiresIn: '7d' });
    res.json({ token, author: safeAuthor(author) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get current author
app.get('/api/auth/me', auth, (req, res) => {
  const author = db.authors.findOne((a) => a.id === req.authorId);
  if (!author) return res.status(404).json({ error: 'Author not found' });
  res.json(safeAuthor(author));
});

// Update profile
app.put('/api/auth/profile', auth, (req, res) => {
  try {
    const { author_name, book_title, bio } = req.body;
    if (!author_name?.trim() || !book_title?.trim()) {
      return res.status(400).json({ error: 'Author name and book title are required' });
    }

    const updated = db.authors.update(
      (a) => a.id === req.authorId,
      { author_name: author_name.trim(), book_title: book_title.trim(), bio: bio?.trim() || '', updated_at: now() }
    );

    if (!updated) return res.status(404).json({ error: 'Author not found' });
    res.json(safeAuthor(updated));
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
app.put('/api/auth/password', auth, (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const author = db.authors.findOne((a) => a.id === req.authorId);
    if (!bcryptjs.compareSync(current_password, author.password_hash)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    db.authors.update(
      (a) => a.id === req.authorId,
      { password_hash: bcryptjs.hashSync(new_password, 10), updated_at: now() }
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Delete account
app.delete('/api/auth/account', auth, (req, res) => {
  try {
    const { password } = req.body;
    const author = db.authors.findOne((a) => a.id === req.authorId);
    if (!author) return res.status(404).json({ error: 'Author not found' });

    if (!bcryptjs.compareSync(password, author.password_hash)) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Delete all video files
    db.chapters.find((c) => c.author_id === req.authorId).forEach((c) => {
      if (c.video_filename) {
        const fp = path.join(uploadsDir, c.video_filename);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }
    });

    db.chapters.remove((c) => c.author_id === req.authorId);
    db.authors.remove((a)  => a.id === req.authorId);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ────────────────────────────────────────────────────────────
// STATS
// ────────────────────────────────────────────────────────────

app.get('/api/stats', auth, (req, res) => {
  try {
    const mine      = db.chapters.find((c) => c.author_id === req.authorId);
    const withVideo = mine.filter((c) => c.video_filename);
    const published = mine.filter((c) => c.status === 'published');
    const totalSize = mine.reduce((s, c) => s + (c.video_size || 0), 0);
    const recent    = [...mine]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(({ id, title, chapter_number, status, video_filename, created_at }) =>
        ({ id, title, chapter_number, status, video_filename, created_at }));

    res.json({
      total_chapters:           mine.length,
      videos_uploaded:          withVideo.length,
      published_chapters:       published.length,
      draft_chapters:           mine.length - published.length,
      total_storage:            totalSize,
      total_storage_formatted:  formatBytes(totalSize),
      recent_chapters:          recent,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// ────────────────────────────────────────────────────────────
// CHAPTER ROUTES
// ────────────────────────────────────────────────────────────

// Get chapters (search / filter / sort)
app.get('/api/chapters', auth, (req, res) => {
  try {
    const { search = '', status = 'all', sort = 'chapter_number', order = 'asc' } = req.query;
    const q = search.toLowerCase();

    let list = db.chapters.find((c) => {
      if (c.author_id !== req.authorId) return false;
      if (status !== 'all' && c.status !== status) return false;
      if (q && !c.title.toLowerCase().includes(q) && !(c.description || '').toLowerCase().includes(q)) return false;
      return true;
    });

    const validSorts = ['chapter_number', 'title', 'created_at', 'updated_at'];
    const col  = validSorts.includes(sort) ? sort : 'chapter_number';
    const dir  = order === 'desc' ? -1 : 1;
    list.sort((a, b) => {
      if (a[col] < b[col]) return -1 * dir;
      if (a[col] > b[col]) return  1 * dir;
      return 0;
    });

    res.json(list);
  } catch (err) {
    console.error('Get chapters error:', err);
    res.status(500).json({ error: 'Failed to load chapters' });
  }
});

// Create chapter
app.post('/api/chapters', auth, (req, res) => {
  try {
    const { title, description, chapter_number, status = 'draft' } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'Chapter title is required' });
    const num = parseInt(chapter_number);
    if (!num || num < 1) return res.status(400).json({ error: 'Valid chapter number is required' });

    const n = now();
    const chapter = db.chapters.insert({
      id:             genId('ch'),
      author_id:      req.authorId,
      title:          title.trim(),
      description:    description?.trim() || '',
      chapter_number: num,
      video_filename: null,
      video_url:      null,
      video_size:     0,
      video_original_name: null,
      status,
      created_at:     n,
      updated_at:     n,
    });

    res.status(201).json(chapter);
  } catch (err) {
    console.error('Create chapter error:', err);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

// Update chapter
app.put('/api/chapters/:id', auth, (req, res) => {
  try {
    const chapter = db.chapters.findOne((c) => c.id === req.params.id && c.author_id === req.authorId);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    const { title, description, chapter_number, status } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Chapter title is required' });
    const num = parseInt(chapter_number);
    if (!num || num < 1) return res.status(400).json({ error: 'Valid chapter number is required' });

    const updated = db.chapters.update(
      (c) => c.id === req.params.id && c.author_id === req.authorId,
      {
        title:          title.trim(),
        description:    description?.trim() || '',
        chapter_number: num,
        status:         status || chapter.status,
        updated_at:     now(),
      }
    );

    res.json(updated);
  } catch (err) {
    console.error('Update chapter error:', err);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

// Delete chapter
app.delete('/api/chapters/:id', auth, (req, res) => {
  try {
    const chapter = db.chapters.findOne((c) => c.id === req.params.id && c.author_id === req.authorId);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    if (chapter.video_filename) {
      const fp = path.join(uploadsDir, chapter.video_filename);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }

    db.chapters.remove((c) => c.id === req.params.id && c.author_id === req.authorId);
    res.json({ message: 'Chapter deleted successfully' });
  } catch (err) {
    console.error('Delete chapter error:', err);
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

// Upload video
app.post('/api/chapters/:id/video', auth, upload.single('video'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file provided' });

    const chapter = db.chapters.findOne((c) => c.id === req.params.id && c.author_id === req.authorId);
    if (!chapter) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Delete old video
    if (chapter.video_filename) {
      const old = path.join(uploadsDir, chapter.video_filename);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    const updated = db.chapters.update(
      (c) => c.id === req.params.id && c.author_id === req.authorId,
      {
        video_filename:      req.file.filename,
        video_url:           `/uploads/${req.file.filename}`,
        video_size:          req.file.size,
        video_original_name: req.file.originalname,
        updated_at:          now(),
      }
    );

    res.json(updated);
  } catch (err) {
    console.error('Upload video error:', err);
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Delete video only
app.delete('/api/chapters/:id/video', auth, (req, res) => {
  try {
    const chapter = db.chapters.findOne((c) => c.id === req.params.id && c.author_id === req.authorId);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
    if (!chapter.video_filename) return res.status(400).json({ error: 'No video to delete' });

    const fp = path.join(uploadsDir, chapter.video_filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);

    const updated = db.chapters.update(
      (c) => c.id === req.params.id && c.author_id === req.authorId,
      {
        video_filename: null,
        video_url:      null,
        video_size:     0,
        video_original_name: null,
        updated_at:     now(),
      }
    );

    res.json(updated);
  } catch (err) {
    console.error('Delete video error:', err);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Toggle chapter status
app.patch('/api/chapters/:id/status', auth, (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Status must be draft or published' });
    }

    const chapter = db.chapters.findOne((c) => c.id === req.params.id && c.author_id === req.authorId);
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    const updated = db.chapters.update(
      (c) => c.id === req.params.id && c.author_id === req.authorId,
      { status, updated_at: now() }
    );

    res.json(updated);
  } catch (err) {
    console.error('Toggle status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 2GB.' });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  BookLegacy API   →  http://localhost:${PORT}`);
  console.log(`  Database dir     →  ${dataDir}`);
  console.log(`  Uploads dir      →  ${uploadsDir}\n`);
});
