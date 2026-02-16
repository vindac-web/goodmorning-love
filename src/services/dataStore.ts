import fs from 'fs';
import path from 'path';
import { Question } from '../config/questions';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
export function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('Created data directory');
  }
}

// Generic read/write functions
function readJsonFile<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

// Questions
export interface QuestionsData {
  questions: Question[];
}

export function getQuestions(defaultQuestions: Question[]): Question[] {
  const data = readJsonFile<QuestionsData>('questions.json', { questions: defaultQuestions });
  return data.questions;
}

export function saveQuestions(questions: Question[]): void {
  writeJsonFile('questions.json', { questions });
}

// Settings
export interface ScheduleSettings {
  morningTime: string;
  girlfriendSendTime: string;
  timezone: string;
}

export function getSettings(defaultSettings: ScheduleSettings): ScheduleSettings {
  return readJsonFile<ScheduleSettings>('settings.json', defaultSettings);
}

export function saveSettings(settings: ScheduleSettings): void {
  writeJsonFile('settings.json', settings);
}

// Templates
export interface MessageTemplate {
  id: number;
  template: string;
}

export interface TemplatesData {
  templates: MessageTemplate[];
}

export function getTemplates(defaultTemplates: string[]): string[] {
  const data = readJsonFile<TemplatesData>('templates.json', {
    templates: defaultTemplates.map((template, index) => ({ id: index, template }))
  });
  return data.templates.map(t => t.template);
}

export function saveTemplates(templates: string[]): void {
  const data: TemplatesData = {
    templates: templates.map((template, index) => ({ id: index, template }))
  };
  writeJsonFile('templates.json', data);
}

// Message History
export interface HistoryEntry {
  timestamp: string;
  type: 'question' | 'reply' | 'girlfriend_message';
  channel: 'sms' | 'whatsapp' | 'email';
  status: 'sent' | 'delivered' | 'failed';
  message: string;
  error?: string;
}

export function getHistory(): HistoryEntry[] {
  const history = readJsonFile<HistoryEntry[]>('history.json', []);

  // Filter to last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  return history.filter(entry => new Date(entry.timestamp) >= ninetyDaysAgo);
}

export function addHistoryEntry(entry: HistoryEntry): void {
  const history = getHistory();
  history.push(entry);
  writeJsonFile('history.json', history);
}

export function clearOldHistory(): void {
  const history = getHistory(); // This already filters to last 90 days
  writeJsonFile('history.json', history);
}
