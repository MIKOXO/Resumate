# Project Overview — Resumate

## Application Overview

Resumate is a web-based dashboard that automates the resume update step of a job-search consultancy's placement pipeline. Each employee gets their own account, adds their assigned prospect(s), and generates a tailored, ATS-compatible resume PDF from a job description — without opening Gemini or manually editing a Word document. The system replaces a fully manual process of copy-pasting into Gemini, hand-editing Word docs, and manually exporting/naming files.

## Goals

1. Eliminate repetitive manual copy-paste between job postings, Gemini, and Word documents.
2. Preserve each prospect's original resume formatting (font, layout) without a shared template.
3. Let each employee store their assigned prospect(s)' resumes once and reuse them daily.
4. Produce a correctly named, ready-to-upload PDF in under 15 seconds per resume.
5. Support multiple employees with isolated accounts and data (12 employees currently).
6. Ship an MVP stable enough for company-wide adoption.

## Workflow

Each of the 12 employees has their own Resumate account. They add their assigned prospect(s) directly — no team member grouping layer. Daily use: select a prospect → paste the job description → enter company name and date → generate → download PDF → apply manually outside the system.

The "one prospect per employee" rule is a current operational constraint, not a system limit — the app supports adding more than one prospect per account for flexibility.

## Core User Flow

1. User signs up with email/password.
2. System sends a 6-digit verification code to the user's email (Brevo HTTP API).
3. User enters the code to verify their account; login is blocked until verified.
4. User logs in.
5. User adds a prospect — name + .docx resume file upload. Stored as a reusable template.
6. User selects a prospect from their flat prospect list.
7. User pastes the job description, enters company name and date.
8. User clicks Generate.
9. System sends the JD to the Groq API using a fixed prompt and receives a Core Competencies section.
10. System inserts that section at the end of the resume, matching the resume's existing font/style.
11. System converts the updated document to PDF and names it `Prospect_Company_MMDDYYYY.pdf`.
12. User downloads the PDF.
13. User applies manually outside the system.

## Features

**Auth**

- Self-signup with email/password
- Email verification via 6-digit code (Brevo HTTP API), required before login
- Resend verification code
- Forgot password: request a reset code by email, enter code + new password to reset
- Login with JWT session
- Per-user data isolation (each user sees only their own prospects)

**Settings**

- Edit personal info: name only (email is fixed at signup, tied to verification)
- Change password (current password required)
- Delete account (current password required; cascades through all prospects and B2 files)

**Prospect Management**

- Add a prospect (name + .docx upload)
- View prospects as a flat list
- Select a prospect to work on
- Replace a prospect's resume (.docx)
- Delete a prospect (removes from DB and B2)

**Resume Generation**

- Paste job description text
- Enter company name and date (custom date picker)
- Generate Core Competencies section via Groq API (fixed prompt)
- Auto-insert section at end of resume, matching original formatting
- Convert to PDF
- Auto-name output file (`Prospect_Company_MMDDYYYY.pdf`)
- Download generated PDF
- Per-prospect result cache — switching prospects preserves previous download

**Error Handling**

- Reject non-.docx uploads
- Clear error messages on generation/conversion failure

## In Scope

- Self-signup and login (JWT-based)
- Uploading and storing prospect resumes as reusable templates (Backblaze B2 + MongoDB Atlas)
- Manual paste of job description text
- AI-generated Core Competencies section (Groq API)
- Automated formatting-matched insertion into the resume (Python/python-docx)
- Automated docx → PDF conversion (LibreOffice headless)
- Automated file naming
- PDF download

## Out of Scope

- Scraping job descriptions automatically from job posting URLs
- Automatic fetching of Default Resumes from Google Drive
- Automatic uploading of finished PDFs to Google Drive
- Role-based permissions or an admin panel beyond basic per-user isolation
- SMS-based verification (email only)
- OAuth/social login (email/password only)
- Multi-theme support (dark theme only, no toggle)

## Success Criteria

- An employee can go from "job description in hand" to "downloaded, correctly named PDF" without opening Gemini or manually editing a Word document.
- Generated resumes visually preserve each prospect's original font and layout, with only the new section added.
- End-to-end generation completes in roughly 15 seconds or less.
- Two employees can use the system independently with no visibility into each other's prospects.
- The system holds up across a real batch of 15-20 daily resumes without formatting failures.
