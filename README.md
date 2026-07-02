# Libris — Modern Personal Bookshelf

<div align="center">
  <h3>A state-of-the-art, feature-complete personal library tracking web application built for speed, privacy, and visual excellence.</h3>
  <p>
    <b>Vanilla JS</b> • <b>Glassmorphism UI</b> • <b>XSS Immune</b> • <b>No Dependencies</b>
  </p>
</div>

---

## ✨ Overview

**Libris** transforms a basic book-tracking script into a modern, responsive, and secure personal reading dashboard. Designed with a premium **Deep Obsidian / Indigo** glassmorphic aesthetic, it allows book lovers and developers to catalog their reading journey, track live completion statistics, organize by categories and custom cover themes, and securely backup their data—all without external dependencies or tracking scripts.

---

## 🚀 Key Features

### 🎨 Visual Excellence & Glassmorphic UI
- **Obsidian Dark Mode**: Curated HSL/Hex color palette with backdrop blurring, subtle glowing borders, and micro-animations for card transitions.
- **Modern Typography**: Powered by Google Fonts (**Inter** for clean UI readability and **Outfit** for bold, impactful headings).
- **Custom Theme Swatches**: Personalize each book card with 6 unique gradient cover themes (Indigo, Emerald, Sunset, Cyber, Gold, and Slate).
- **Responsive Layout**: Seamless CSS Grid system that fluidly scales from mobile screens to ultra-wide desktop displays.

### 📊 Live Statistics Dashboard
- Automatically calculates and displays real-time metrics at the top of the workspace:
  - **Total Books**: Overall library count.
  - **Books Read**: Number of finished books.
  - **Pages Read**: Cumulative page count of finished reading goals.
  - **Average Rating**: Real-time mean rating (out of 5 stars) across all rated titles.

### 🔍 Real-Time Search, Filter & Sort Engine
- **Instant Search**: Query titles, author names, or personal review notes with zero latency.
- **Category Filtering**: Filter library by genres (e.g., *Fiction, Non-Fiction, Sci-Fi & Fantasy, Tech & Coding, Biography*, etc.).
- **Read Status Filtering**: Toggle between *All Books*, *Read Only*, or *Unread Only*.
- **Dynamic Sorting**: Sort collection by *Recently Added*, *Title (A-Z)*, *Author (A-Z)*, *Highest Rating*, or *Most Pages*.

### 💾 Local Persistence & JSON Backup/Restore
- **Automatic Storage**: All changes automatically persist to browser `localStorage` with built-in error recovery and quota handling.
- **Starter Library Seeding**: If launched with an empty storage, Libris automatically seeds a diverse set of sample books (Clean Code, Dune, Atomic Habits, etc.).
- **Export & Import**: Backup your entire library to a downloadable `.json` file, or restore/merge previous backups with duplicate detection.

### 🖼️ Native HTML5 `<dialog>` Modal
- Replaces legacy absolute-positioned forms with the modern semantic `<dialog>` API.
- Leverages `closedby="any"` for declarative light-dismiss (closing via Esc key or backdrop click) with a fallback script for legacy browser environments.
- Supports both **Adding new books** and **Editing existing book details** seamlessly in one unified interface.

---

## 🔒 Security & Architecture Highlights

Libris adheres to strict web security and modern engineering best practices:

1. **XSS (Cross-Site Scripting) Immunity**:
   - In standard vanilla JS prototypes, user input is often interpolated directly into `innerHTML`, creating severe XSS vulnerabilities.
   - Libris constructs all DOM elements safely using `document.createElement()` and assigns user-supplied strings exclusively via `.textContent`. Even if an attacker enters `<script>alert('XSS')</script>` as a title or author, it is rendered harmlessly as literal text.

2. **Cryptographically Secure UUID Tracking**:
   - Legacy implementations rely on array indices (`myLibrary[idx]`) to delete or modify items. When arrays are filtered or sorted, indices shift, leading to bug-ridden state corruption (e.g., deleting the wrong book).
   - Libris assigns every book a unique UUID via `crypto.randomUUID()` (with a timestamp/random fallback), guaranteeing accurate state manipulation regardless of active filters or sort orders.

3. **Input Validation & Sanitization**:
   - Enforces strict numeric bounds checking on page counts (1–10,000) and ratings (0–5).
   - Validates `coverTheme` and `category` fields against whitelisted sets of allowed values, rejecting any untrusted data from imports or corrupted storage.
   - Trims leading and trailing whitespace and validates required text fields before state updates occur.

---

## 🛠️ Project Structure

```text
book_library/
├── index.html       # Semantic HTML5 structure, dashboard, controls, and native <dialog> modal
├── style.css        # Premium Obsidian Glassmorphism design system, grid, and animations
├── app.js           # Secure DOM construction, UUID tracking, search/filter engine, and storage logic
├── package.json     # Basic NPM project definition
└── .gitignore       # Comprehensive Git ignore rules for web and node development
```

---

## ⚡ Getting Started

Since Libris is built with 100% standard web technologies (HTML, CSS, Vanilla JS), zero compilation or build steps are required!

### Method 1: Direct File Access
1. Clone this repository:
   ```bash
   git clone https://github.com/hamilto8/book_library.git
   cd book_library
   ```
2. Double-click `index.html` to open it directly in any modern web browser (Chrome, Firefox, Safari, Edge).

### Method 2: Local Development Server
If you prefer running via a local HTTP server (e.g., VS Code Live Server or Node `http-server`):
```bash
npx -y http-server . -p 8080 -c-1
```
Then navigate to `http://localhost:8080` in your browser.

---

## 📝 License

This project is open-source and available under the [ISC License](LICENSE). Designed and refactored by Michael Hamilton & Antigravity.
