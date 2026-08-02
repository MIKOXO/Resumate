# Project Overview — Resumate

## Application Overview

Resumate is a web-based dashboard that automates the resume update step of a job-search consultancy's placement pipeline. A Resume Update team member selects a prospect from their saved list, pastes in a job description, and the system generates an ATS-compatible Core Competencies section via AI, inserts it into the prospect's resume while preserving that resume's original formatting, and exports a correctly named PDF ready for the Job Applying team to submit. It replaces a fully manual process of copy-pasting into Gemini, hand-editing Word docs, and manually exporting/naming files, cutting a repetitive multi-step task down to upload-once-then-generate.

## Goals

1. Eliminate repetitive manual copy-paste between job postings, Gemini, and Word documents.
2. Preserve each prospect's original resume formatting (font, layout) without a shared template.
3. Let each Resume Update team member store their assigned prospects' resumes once and reuse them daily.
4. Produce a correctly named, ready-to-upload PDF in under 15 seconds per resume.
5. Support multiple team members with isolated accounts and data.
6. Ship an MVP that's convincing enough to pitch to the founders for adoption and eventual paid-tier upgrade.

## Core User Flow

1. User signs up with email/password.
2. System sends a 6-digit verification code to the user's email (Nodemailer + Gmail SMTP).
3. User enters the code to verify their account; login is blocked until verified.
4. User logs in.
5. User adds a Job Applying Team member (e.g. "John") — the colleague whose assigned prospects will be organized under them.
6. User uploads a prospect's Default Resume (.docx) once, under that team member — saved as a reusable template.
7. Daily: user expands a team member and selects one of their saved prospects.
8. User manually copies the job description from the job posting site and pastes it into the system.
9. User enters company name and date.
10. User clicks Generate.
11. System sends the JD to the Gemini API using a fixed prompt and receives a Core Competencies section.
12. System inserts that section at the end of the resume, matching the resume's existing font/style.
13. System converts the updated document to PDF and names it `Prospect_Company_MMDDYYYY.pdf`.
14. User downloads the PDF.
15. User manually uploads the PDF to Google Drive for the Job Applying team (outside the system).

## Features

**Auth**
- Self-signup with email/password
- Email verification via 6-digit code (Nodemailer + Gmail SMTP), required before login
- Resend verification code
- Forgot password: request a reset code by email, enter code + new password to reset
- Login with JWT session
- Per-user data isolation (each user sees only their own team members and prospects)

**Settings**
- Edit personal info: name, email
- Change password (current password required)

**Job Applying Team Management**
- Add a Job Applying Team member (name only)
- View team members as collapsible groups, each expandable to reveal their prospects
- Delete a team member (and, by extension, their prospects)

**Prospect Template Management**
- Upload a .docx resume once per prospect, nested under a team member
- View/select from a saved prospect list within a team member group
- Replace/re-upload a prospect's resume
- Delete a prospect

**Resume Generation**
- Paste job description text
- Enter company name and date
- Generate Core Competencies section via Gemini API (fixed prompt)
- Auto-insert section at end of resume, matching original formatting
- Convert to PDF
- Auto-name output file (`Prospect_Company_MMDDYYYY.pdf`)
- Download generated PDF

**Error Handling**
- Reject non-.docx uploads
- Clear error messages on generation/conversion failure

## In Scope

- Self-signup and login (JWT-based)
- Uploading and storing prospect resumes as reusable templates (Cloudflare R2 + MongoDB Atlas)
- Manual paste of job description text
- AI-generated Core Competencies section (Gemini API)
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

- A Resume Update team member can go from "job description in hand" to "downloaded, correctly named PDF" without opening Gemini or manually editing a Word document.
- Generated resumes visually preserve each prospect's original font and layout, with only the new section added.
- End-to-end generation completes in roughly 15 seconds or less.
- Two team members can use the system independently with no visibility into each other's prospects.
- The system holds up across a real batch of 15-20 daily resumes without formatting failures.
- The tool is stable and polished enough to demo to the founders as a pitch for company-wide adoption.
