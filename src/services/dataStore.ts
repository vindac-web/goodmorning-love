// This file now re-exports from database.ts for backward compatibility
export {
  ensureDataDir,
  getSettings,
  saveSettings,
  getQuestions,
  saveQuestions,
  getTemplates,
  saveTemplates,
  getHistory,
  addHistoryEntry,
  clearOldHistory,
  type ScheduleSettings,
  type HistoryEntry
} from './database';
