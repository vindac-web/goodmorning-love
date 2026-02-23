declare module 'better-sqlite3-session-store' {
  import session from 'express-session';
  import Database from 'better-sqlite3';

  interface SqliteStoreOptions {
    client: Database.Database;
    expired?: {
      clear?: boolean;
      intervalMs?: number;
    };
  }

  type SqliteStoreConstructor = new (options: SqliteStoreOptions) => session.Store;

  function SqliteStoreFactory(session: { Store: typeof session.Store }): SqliteStoreConstructor;

  export = SqliteStoreFactory;
}
