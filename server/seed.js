/**
 * BookLegacy seed script
 * Run: node seed.js
 */
const path     = require('path');
const bcryptjs = require('bcryptjs');
const { Database, genId, now } = require('./db');

const db = new Database(path.join(__dirname, 'data'));

// ── Clear existing data ──────────────────────────────────────
db.authors._records  = [];
db.chapters._records = [];
db.authors._save();
db.chapters._save();

// ── Helper ───────────────────────────────────────────────────
const hash = (p) => bcryptjs.hashSync(p, 10);
const n    = now();

// ════════════════════════════════════════════════════════════
// AUTHOR 1 — Jane Austen (fiction)
// ════════════════════════════════════════════════════════════
const jane = db.authors.insert({
  id:            genId('author'),
  email:         'jane@demo.com',
  password_hash: hash('demo1234'),
  author_name:   'Jane Austen',
  book_title:    'Pride and Prejudice: A Video Commentary',
  bio:           'Classic literature enthusiast and author of timeless romantic fiction.',
  avatar_color:  '#6366f1',
  created_at:    n,
  updated_at:    n,
});

const janeChapters = [
  { n: 1,  title: 'Introduction to the Bennet Family',  desc: 'Meet the five Bennet sisters and their matchmaking mother.', status: 'published' },
  { n: 2,  title: 'The Arrival of Mr. Bingley',         desc: 'A wealthy bachelor moves to Netherfield, causing a stir.', status: 'published' },
  { n: 3,  title: 'The Netherfield Ball',               desc: 'First impressions and first dances — prejudice begins.', status: 'published' },
  { n: 4,  title: 'Mr. Darcy\'s True Character',        desc: 'Beneath the pride lies a more complex man.', status: 'draft' },
  { n: 5,  title: 'Elizabeth\'s Refusal',               desc: 'A proposal declined — Elizabeth stands her ground.', status: 'draft' },
  { n: 6,  title: 'Letters and Revelations',            desc: 'Darcy\'s letter changes everything.', status: 'draft' },
];

janeChapters.forEach(({ n: num, title, desc, status }) => {
  db.chapters.insert({
    id:             genId('ch'),
    author_id:      jane.id,
    title,
    description:    desc,
    chapter_number: num,
    video_filename: null,
    video_url:      null,
    video_size:     0,
    video_original_name: null,
    status,
    created_at:     now(),
    updated_at:     now(),
  });
});

// ════════════════════════════════════════════════════════════
// AUTHOR 2 — Mark Twain (non-fiction / satire)
// ════════════════════════════════════════════════════════════
const mark = db.authors.insert({
  id:            genId('author'),
  email:         'mark@demo.com',
  password_hash: hash('demo1234'),
  author_name:   'Mark Twain',
  book_title:    'Adventures of Huckleberry Finn: Director\'s Cut',
  bio:           'Storyteller, satirist, and river adventurer from Hannibal, Missouri.',
  avatar_color:  '#10b981',
  created_at:    n,
  updated_at:    n,
});

const markChapters = [
  { n: 1,  title: 'Life on the Mississippi',     desc: 'Huck\'s world before the adventure begins.', status: 'published' },
  { n: 2,  title: 'Escaping Pap',                desc: 'Running away to freedom on the river.', status: 'published' },
  { n: 3,  title: 'Meeting Jim',                 desc: 'An unlikely friendship that changes everything.', status: 'published' },
  { n: 4,  title: 'The King and the Duke',       desc: 'Con men and moral dilemmas on the raft.', status: 'published' },
  { n: 5,  title: 'The Wilks Family Fraud',      desc: 'Huck\'s conscience wins out over loyalty.', status: 'draft' },
  { n: 6,  title: 'Tom Sawyer Returns',          desc: 'Chaos, plans, and a bittersweet ending.', status: 'draft' },
  { n: 7,  title: 'Themes and Legacy',           desc: 'Why this novel still matters 140 years later.', status: 'draft' },
  { n: 8,  title: 'Author\'s Reflections',       desc: 'A look at Twain\'s life and what shaped this work.', status: 'draft' },
];

markChapters.forEach(({ n: num, title, desc, status }) => {
  db.chapters.insert({
    id:             genId('ch'),
    author_id:      mark.id,
    title,
    description:    desc,
    chapter_number: num,
    video_filename: null,
    video_url:      null,
    video_size:     0,
    video_original_name: null,
    status,
    created_at:     now(),
    updated_at:     now(),
  });
});

// ════════════════════════════════════════════════════════════
// AUTHOR 3 — New Author (empty, for testing onboarding)
// ════════════════════════════════════════════════════════════
db.authors.insert({
  id:            genId('author'),
  email:         'new@demo.com',
  password_hash: hash('demo1234'),
  author_name:   'New Author',
  book_title:    'My First Book',
  bio:           '',
  avatar_color:  '#f97316',
  created_at:    n,
  updated_at:    n,
});

// ── Summary ──────────────────────────────────────────────────
const totalAuthors  = db.authors.find(() => true).length;
const totalChapters = db.chapters.find(() => true).length;

console.log('\n  BookLegacy seed complete!\n');
console.log(`  Authors created : ${totalAuthors}`);
console.log(`  Chapters created: ${totalChapters}\n`);
console.log('  Demo accounts (all passwords: demo1234)');
console.log('  ─────────────────────────────────────────────');
console.log('  jane@demo.com  →  6 chapters, mixed published/draft');
console.log('  mark@demo.com  →  8 chapters, mixed published/draft');
console.log('  new@demo.com   →  0 chapters (fresh onboarding)');
console.log('  ─────────────────────────────────────────────\n');
