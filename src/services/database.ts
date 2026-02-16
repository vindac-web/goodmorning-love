import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Question } from '../config/questions';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'goodmorning.db');

// Ensure data directory exists
export function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('Created data directory');
  }
}

// Initialize database
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeTables();
  }
  return db;
}

function initializeTables(): void {
  const db = getDb();

  // Messages/History table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT NOT NULL,
      error TEXT,
      media_url TEXT
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Questions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER NOT NULL,
      text TEXT NOT NULL
    )
  `);

  // Templates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_text TEXT NOT NULL
    )
  `);

  console.log('Database tables initialized');
}

// Settings functions
export interface ScheduleSettings {
  morningTime: string;
  girlfriendSendTime: string;
  timezone: string;
}

export function getSettings(defaultSettings: ScheduleSettings): ScheduleSettings {
  const db = getDb();
  const stmt = db.prepare('SELECT key, value FROM settings');
  const rows = stmt.all() as { key: string; value: string }[];

  const settings: any = { ...defaultSettings };
  for (const row of rows) {
    if (row.key in settings) {
      settings[row.key] = row.value;
    }
  }

  return settings;
}

export function saveSettings(settings: ScheduleSettings): void {
  const db = getDb();
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  const transaction = db.transaction(() => {
    stmt.run('morningTime', settings.morningTime);
    stmt.run('girlfriendSendTime', settings.girlfriendSendTime);
    stmt.run('timezone', settings.timezone);
  });

  transaction();
}

// Questions functions
export function getQuestions(defaultQuestions: Question[]): Question[] {
  const db = getDb();
  const stmt = db.prepare('SELECT number, text FROM questions ORDER BY number');
  const rows = stmt.all() as { number: number; text: string }[];

  if (rows.length === 0) {
    // Initialize with default questions
    saveQuestions(defaultQuestions);
    return defaultQuestions;
  }

  return rows.map(row => ({
    number: row.number,
    text: row.text
  }));
}

export function saveQuestions(questions: Question[]): void {
  const db = getDb();

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM questions').run();
    const stmt = db.prepare('INSERT INTO questions (number, text) VALUES (?, ?)');

    for (const q of questions) {
      stmt.run(q.number, q.text);
    }
  });

  transaction();
}

// Templates functions
export function getTemplates(defaultTemplates: string[]): string[] {
  const db = getDb();
  const stmt = db.prepare('SELECT template_text FROM templates ORDER BY id');
  const rows = stmt.all() as { template_text: string }[];

  if (rows.length === 0) {
    // Initialize with default templates
    saveTemplates(defaultTemplates);
    return defaultTemplates;
  }

  return rows.map(row => row.template_text);
}

export function saveTemplates(templates: string[]): void {
  const db = getDb();

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM templates').run();
    const stmt = db.prepare('INSERT INTO templates (template_text) VALUES (?)');

    for (const template of templates) {
      stmt.run(template);
    }
  });

  transaction();
}

// Message History functions
export interface HistoryEntry {
  timestamp: string;
  type: 'question' | 'reply' | 'girlfriend_message';
  channel: 'sms' | 'whatsapp' | 'email' | 'voice';
  status: 'sent' | 'delivered' | 'failed';
  message: string;
  error?: string;
  mediaUrl?: string;
}

export function getHistory(): HistoryEntry[] {
  const db = getDb();

  // Filter to last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoISO = ninetyDaysAgo.toISOString();

  const stmt = db.prepare(`
    SELECT timestamp, type, channel, status, message, error, media_url
    FROM messages
    WHERE timestamp >= ?
    ORDER BY timestamp DESC
  `);

  const rows = stmt.all(ninetyDaysAgoISO) as any[];

  return rows.map(row => ({
    timestamp: row.timestamp,
    type: row.type,
    channel: row.channel,
    status: row.status,
    message: row.message,
    error: row.error || undefined,
    mediaUrl: row.media_url || undefined
  }));
}

export function addHistoryEntry(entry: HistoryEntry): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO messages (timestamp, type, channel, status, message, error, media_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    entry.timestamp,
    entry.type,
    entry.channel,
    entry.status,
    entry.message,
    entry.error || null,
    entry.mediaUrl || null
  );
}

export function clearOldHistory(): void {
  const db = getDb();

  // Delete messages older than 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoISO = ninetyDaysAgo.toISOString();

  const stmt = db.prepare('DELETE FROM messages WHERE timestamp < ?');
  stmt.run(ninetyDaysAgoISO);
}

// Close database connection
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
