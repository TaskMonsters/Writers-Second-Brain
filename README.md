# Manuscript OS - Second Brain for Writers

A powerful Progressive Web App (PWA) writing companion that helps novelists organize projects, plan stories, and write distraction-free—all while keeping work safe and accessible, even offline.

![Manuscript OS](https://img.shields.io/badge/PWA-Ready-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

### 📊 Kanban Dashboard
Organize your writing tasks with a visual Kanban board featuring seven workflow sections:
- Backlog → Research → Outlining → First Draft → Revisions → Editing → Done
- Track progress from initial ideas to final edits
- Create custom sections and tickets

### 📚 Novel Kit
Build your story world with detailed planning tools:
- **Characters**: Create and manage character profiles
- **Locations**: Document settings and world-building details
- **Scenes**: Plan individual scenes and chapters
- **Plot**: Structure your narrative arc

### ✍️ The Sanctuary
Write in a distraction-free environment:
- Clean, minimal interface focused on writing
- Real-time word count tracking
- Fullscreen mode for maximum focus
- Beautiful Playfair Display typography
- Auto-save functionality

### 🏆 Achievements System
Track your writing milestones and stay motivated with unlockable achievements.

### 💾 Persistent Storage
- All data stored locally in IndexedDB
- Works completely offline via Service Worker
- Data persists even after clearing browser cache
- No server required, no data leaves your device

### 🎨 Neo-Brutalist Dark Academia Design
- Deep charcoal backgrounds with purple/pink gradient accents
- Elegant typography combining Playfair Display and Inter
- Paper texture overlays and glowing borders
- Sophisticated, focused aesthetic for serious writers

## Technology Stack

- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Wouter** - Lightweight routing
- **IndexedDB** - Client-side persistent storage
- **Service Worker** - Offline functionality
- **Vite** - Fast build tool

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/manuscript-os-pwa.git
cd manuscript-os-pwa
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Start the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
pnpm build
# or
npm run build
```

The built files will be in the `dist` directory.

### Running Production Build Locally

```bash
pnpm start
# or
npm start
```

## Deployment

### GitHub Pages

1. Update `vite.config.ts` to set the base path:
```typescript
export default defineConfig({
  base: '/manuscript-os-pwa/',
  // ... rest of config
});
```

2. Build the project:
```bash
pnpm build
```

3. Deploy the `dist/public` directory to GitHub Pages

### Netlify / Vercel

1. Connect your GitHub repository
2. Set build command: `pnpm build`
3. Set publish directory: `dist/public`
4. Deploy!

### Static Hosting (Any Provider)

Simply upload the contents of `dist/public` after running `pnpm build` to any static hosting service.

## PWA Installation

Once deployed, users can install Manuscript OS as a standalone app:

1. Visit the deployed URL in Chrome, Edge, or Safari
2. Look for the "Install" prompt in the address bar
3. Click "Install" to add to home screen/desktop
4. Launch as a native-like app with offline support

## Project Structure

```
manuscript-os-pwa/
├── client/
│   ├── public/          # Static assets
│   │   ├── manifest.json
│   │   ├── sw.js        # Service worker
│   │   └── icon-*.png   # PWA icons
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── contexts/    # React contexts (DataContext)
│       ├── lib/         # Utilities (storage, types)
│       ├── pages/       # Page components
│       ├── App.tsx      # Main app & routing
│       └── index.css    # Global styles & theme
├── server/              # Production server (optional)
├── package.json
└── README.md
```

## Data Storage

All data is stored locally in your browser using IndexedDB:

- **Projects**: Novel projects with metadata
- **Tickets**: Kanban board items
- **Sections**: Custom workflow sections
- **Characters/Locations/Scenes/Plot**: Novel planning data
- **Manuscripts**: Your written content
- **Achievements**: Progress tracking

**Note**: Data persists across sessions and survives cache clearing. However, for backup purposes, consider implementing export/import functionality (see Roadmap).

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Roadmap

- [ ] Drag-and-drop for Kanban tickets
- [ ] Data export/import (JSON backup)
- [ ] Writing statistics dashboard
- [ ] Multiple manuscript support per project
- [ ] Rich text editor with formatting
- [ ] Dark/light theme toggle
- [ ] Custom color schemes
- [ ] Markdown export
- [ ] Print-friendly manuscript formatting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Design inspired by Neo-Brutalist and Dark Academia aesthetics
- Built with modern web technologies for maximum performance
- No AI features - pure, focused writing tools

---

**Happy Writing! 📝**
