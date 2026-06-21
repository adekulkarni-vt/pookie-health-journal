# Pookie Health Journal - Database Schema

## Philosophy

This application is an AI-powered journal, not a medical database.

The source of truth is always:

* Raw journal entries
* AI-generated summaries

We intentionally avoid extracting foods, symptoms, medications, or other entities into separate tables.

Instead, AI creates compressed memories that can later be used for retrieval and analysis.

---

# Tables

## entries

Purpose:

Primary journal storage.

Contains:

* User-entered data
* AI-generated memory of the entry

Columns:

| Column       | Type        | Description                           |
| ------------ | ----------- | ------------------------------------- |
| id           | uuid        | Primary key                           |
| user_id      | uuid        | References auth.users(id)             |
| created_at   | timestamptz | Entry creation timestamp              |
| journal_text | text        | Raw journal content                   |
| sleep_hours  | numeric     | User entered sleep duration           |
| weight       | numeric     | User entered weight                   |
| stress_level | integer     | User entered stress level (1-5)       |
| day_rating   | integer     | User entered overall day rating (1-5) |
| mood         | text        | AI-generated mood                     |
| ai_title     | text        | AI-generated title                    |
| ai_summary   | text        | AI-generated summary                  |
| severity     | integer     | AI-generated severity score (1-5)     |

---

## Example Entry

Raw Journal:

Had chai in the morning.

Work was stressful.

Felt nauseous after lunch.

Didn't sleep well.

Stored Data:

{
"ai_title": "Stressful day with afternoon nausea",

"ai_summary": "Poor sleep and work stress were major themes. Nausea developed after lunch and contributed to a difficult day overall.",

"mood": "stressed",

"severity": 4
}

---

## Severity Scale

1 = Excellent day

2 = Mild issues

3 = Moderate issues

4 = Significant symptoms

5 = Severe symptoms

---

## Mood Values

Allowed values:

* happy
* good
* neutral
* anxious
* stressed
* sad
* frustrated
* tired

---

## photos

Purpose:

Stores uploaded images associated with journal entries.

Examples:

* meal photos
* swelling photos
* medication photos
* health report photos

Columns:

| Column       | Type        |
| ------------ | ----------- |
| id           | uuid        |
| user_id      | uuid        |
| entry_id     | uuid        |
| storage_path | text        |
| created_at   | timestamptz |

---

## weekly_reflections

Purpose:

Stores AI-generated weekly reflections.

These are generated periodically from journal entries.

Columns:

| Column          | Type        |
| --------------- | ----------- |
| id              | uuid        |
| user_id         | uuid        |
| week_start      | date        |
| reflection_text | text        |
| created_at      | timestamptz |

---

# AI Memory Architecture

The system uses two levels of memory.

## Level 1

Compressed Memory

Fields:

* ai_title
* ai_summary
* mood
* severity

Used for:

* timeline
* dashboards
* AI retrieval
* weekly reflections

These records are small, cheap, and fast to analyze.

---

## Level 2

Raw Journal

Field:

* journal_text

Used when deeper context is needed.

The raw journal remains the ultimate source of truth.

---

# Ask My Diary Retrieval Strategy

When a user asks a question:

1. Determine date range.

Examples:

* yesterday
* last week
* June
* this month

2. Retrieve:

* created_at
* ai_title
* ai_summary

for matching entries.

3. Analyze summaries first.

4. If additional detail is required:

Retrieve full journal_text entries.

5. Generate answer.

---

# Explicit Non-Goals

We intentionally do NOT store:

* foods table
* symptoms table
* medications table
* trigger tables
* embeddings
* vectors
* RAG indexes

The application relies on:

* high-quality journal entries
* high-quality summaries
* Gemini reasoning

rather than heavy data normalization.
