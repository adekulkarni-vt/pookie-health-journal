# Pookie Health Journal - Database Schema

## Overview

This document outlines the planned database schema for the Pookie Health Journal application. The schema is built on Supabase PostgreSQL.

## Tables

### 1. `profiles`

User profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, FK users.id | User identifier |
| created_at | timestamp | DEFAULT now() | Account creation date |
| updated_at | timestamp | DEFAULT now() | Last profile update |
| username | text | | Display name |
| avatar_url | text | | Profile picture URL |

### 2. `journal_entries`

Daily journal entries for health tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Entry identifier |
| user_id | uuid | FK profiles.id | Entry owner |
| created_at | timestamp | DEFAULT now() | Entry creation date |
| updated_at | timestamp | DEFAULT now() | Last update |
| date | date | | Entry date |
| content | text | | Journal content |
| mood | text | | User's mood (optional) |

### 3. `symptom_entries`

Symptom tracking entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Entry identifier |
| user_id | uuid | FK profiles.id | Entry owner |
| created_at | timestamp | DEFAULT now() | Entry creation date |
| updated_at | timestamp | DEFAULT now() | Last update |
| date | date | | Symptom date |
| symptom | text | | Symptom description |
| severity | integer | 1-10 | Symptom severity level |

### 4. `gastritis_flare_entries`

Gastritis flare tracking (planned).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Entry identifier |
| user_id | uuid | FK profiles.id | Entry owner |
| created_at | timestamp | DEFAULT now() | Entry creation date |
| updated_at | timestamp | DEFAULT now() | Last update |
| date | date | | Flare date |
| severity | integer | 1-10 | Flare severity |
| triggers | text[] | | Potential triggers |
| relief_measures | text[] | | What helped |
| notes | text | | Additional notes |

### 5. `ai_insights`

Stored AI-generated insights (planned).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Insight identifier |
| user_id | uuid | FK profiles.id | User |
| created_at | timestamp | DEFAULT now() | Creation date |
| insight_type | text | | Type of insight |
| content | text | | Insight content |
| metadata | jsonb | | Additional data |

## Indexes (Planned)

- `journal_entries(user_id, date)` - For efficient user + date queries
- `symptom_entries(user_id, date)` - For efficient symptom queries
- `gastritis_flare_entries(user_id, date)` - For efficient flare queries

## Row Level Security (Planned)

- Users can only access their own entries
- Service role has full access for backend operations

## Notes

- All timestamps use UTC timezone
- UUIDs are used for all primary keys
- Soft deletes not currently planned; consider for future implementation
- Archive tables may be created for historical data
