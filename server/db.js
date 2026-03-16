/**
 * BookLegacy embedded database
 * Pure JavaScript, file-backed, in-memory with atomic writes.
 * No native compilation required — works on all platforms.
 */
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

class Collection {
  constructor(filePath) {
    this._file = filePath;
    this._records = [];
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this._file)) {
        this._records = JSON.parse(fs.readFileSync(this._file, 'utf8'));
      }
    } catch {
      this._records = [];
    }
  }

  _save() {
    // Atomic write: write to temp file then rename
    const tmp = this._file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this._records, null, 2));
    fs.renameSync(tmp, this._file);
  }

  // ── Read operations ─────────────────────────────

  findOne(predicate) {
    return this._records.find(predicate) || null;
  }

  find(predicate) {
    return predicate ? this._records.filter(predicate) : [...this._records];
  }

  // ── Write operations ────────────────────────────

  insert(doc) {
    const record = { ...doc };
    this._records.push(record);
    this._save();
    return record;
  }

  update(predicate, changes) {
    let updated = null;
    this._records = this._records.map((r) => {
      if (predicate(r)) {
        updated = { ...r, ...changes };
        return updated;
      }
      return r;
    });
    if (updated) this._save();
    return updated;
  }

  remove(predicate) {
    const before = this._records.length;
    this._records = this._records.filter((r) => !predicate(r));
    if (this._records.length !== before) this._save();
  }
}

class Database {
  constructor(dataDir) {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    this.authors  = new Collection(path.join(dataDir, 'authors.json'));
    this.chapters = new Collection(path.join(dataDir, 'chapters.json'));
  }
}

// ── Helpers ──────────────────────────────────────

const genId = (prefix) =>
  `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

const now = () => new Date().toISOString();

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
};

module.exports = { Database, genId, now, formatBytes };
