"""Small persistent store for the single-site pilot; never use the tracked Influx data."""

import sqlite3
from contextlib import contextmanager
from .config import settings


@contextmanager
def database():
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True, mode=0o700)
    connection = sqlite3.connect(settings.DATA_DIR / "ecotwin.sqlite", timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys=ON")
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def initialize():
    with database() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL, created_at REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS sessions (
          token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS login_attempts (address TEXT NOT NULL, attempted REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS maintenance (
          sensor TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_by TEXT NOT NULL REFERENCES users(id));
        CREATE TABLE IF NOT EXISTS actions (
          id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), payload TEXT NOT NULL);
        """)
