# Financial Data Grid (1M Row Virtualization)

A high-performance React data grid capable of rendering 1,000,000 transaction records with smooth scrolling, sorting, and filtering.

## 🚀 Features
- **Custom Virtualization**: Scratch-built windowing logic (no 3rd-party libs).
- **1,000,000 Rows**: Handles massive datasets at 60 FPS.
- **Selection**: Single and multi-row selection (Ctrl/Cmd).
- **Editing**: Inline cell editing with persistence.
- **Pinning**: Toggleable sticky columns for ID and Date.
- **Debug Panel**: Real-time FPS, row count, and scroll tracking.
- **Dockerized**: Easy deployment with Nginx and healthchecks.

## 🛠️ Tech Stack
- **React 19**
- **Vite** (Build Tool)
- **Zustand** (State Management)
- **Nginx & Docker** (Deployment)

## 📦 Setup & Installation

### 1. Data Generation
Generate the transaction dataset before starting:
```bash
npm install
# Defaults to 1,000,000 rows. Use DATA_COUNT=50000 for lighter environments (e.g. Vercel).
npm run generate-data
```

### 2. Local Development
```bash
npm run dev
```

### 3. Docker Deployment
```bash
docker-compose up -d --build
```
The application will be available at `http://localhost:8080`. The Docker build is pre-configured to generate the full **1,000,000 rows** automatically.

### 4. Vercel Deployment
To avoid Vercel's 50MB file limit:
1. Set the Environment Variable `DATA_COUNT=50000` in the Vercel dashboard.
2. Set the Build Command to `npm run generate-data && npm run build`.

## 🧪 Virtualization Approach
The core logic uses **Windowing**:
1. **Scrollable Viewport**: Captures scroll events.
2. **Sizer Element**: A placeholder `div` with a height of `totalRows * rowHeight` (40px) to simulate a million-row scrollbar.
3. **Sliding Window**: A container that only renders ~50 rows (visible area + buffer) and follows the scroll position using `transform: translateY`.
4. **Debounced Filters**: Prevents layout thrashing by delaying expensive search operations on the full 1M dataset.

## 📊 Performance Metrics
Observe the **Debug Panel** in the bottom-right corner:
- **FPS**: Monitor scroll smoothness.
- **Rendered Rows**: Confirms that DOM nodes remain constant (< 100) regardless of dataset size.
- **Scroll Position**: Live row index tracking.
