# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Setup
```bash
npm install              # Install dependencies
```

### Development
```bash
npm run dev             # Start development server (React + Electron)
npm run dev:linux       # Start with Linux-specific fixes (recommended for Linux)
npm run dev:react       # Start only React development server
npm run dev:electron    # Start only Electron (after React is running)
```

### Building
```bash
npm run build           # Build React app and Electron
npm run build:react     # Build only React app
npm run build:electron  # Build only Electron
```

### Distribution
```bash
npm run dist            # Build and package for current platform
npm run dist:win        # Build and package for Windows
npm run dist:linux      # Build and package for Linux
```

### Code Quality
```bash
npm run lint            # Run ESLint
```

## Architecture

### Technology Stack
- **Electron** - Cross-platform desktop application framework
- **React + TypeScript** - UI framework with type safety
- **Zustand** - State management with persistence
- **Tailwind CSS** - Styling with dark theme and Maver branding (#dc143c)
- **Framer Motion** - Smooth animations
- **@dnd-kit** - Drag and drop functionality

### Project Structure
```
src/
├── components/          # React components
│   ├── Sidebar.tsx     # Collapsible sidebar with boards
│   ├── Board.tsx       # Main Kanban board view
│   ├── Column.tsx      # Individual columns with cards
│   ├── Card.tsx        # Individual cards with priority/dates
│   └── *Modal.tsx      # Creation and editing modals
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component

electron/
├── main.ts            # Electron main process
└── preload.ts         # Secure context bridge
```

### Key Features
- **Persistent Storage**: Data saved automatically using Zustand persist middleware
- **Drag & Drop**: Cards and columns can be reordered using @dnd-kit
- **Priority System**: Cards have low/medium/high priority with color coding
- **Due Dates**: Cards support due dates in dd/mm/yy format with overdue warnings
- **JSON Import/Export**: Full data backup and restore functionality
- **Responsive Design**: Apple-inspired minimalist dark theme

### Data Models
- **Board**: Contains columns, has title, description, and emoji
- **Column**: Contains cards, has title, description, and color indicator
- **Card**: Has title, description, priority, and optional due date

### State Management
- All data persists in local storage automatically
- High priority cards are automatically sorted to the top of columns
- Import/export functionality preserves all board data and structure

## Development Notes

- The default "First Board" is created automatically with example content
- Sidebar can be collapsed to icon-only view
- All modals use Framer Motion for smooth animations
- Cards show overdue status when past due date
- Emoji picker is used for board icons
- Color picker is used for column indicators

## Linux-Specific Notes

### Common Issues and Solutions
- **Sandbox errors**: Automatically disabled in development mode
- **GPU/Graphics issues**: Use `npm run dev:linux` for optimized Linux experience
- **X11 authorization**: Environment variables are automatically configured
- **XDG_RUNTIME_DIR**: Set to /tmp if not available

### Running on Linux
```bash
# Recommended for Linux systems
npm run dev:linux

# Alternative if you encounter graphics issues
ELECTRON_DISABLE_SECURITY_WARNINGS=true npm run dev
```

### GPU Acceleration
- GPU acceleration is disabled by default to prevent graphics driver conflicts
- Software rendering is used for maximum compatibility
- X11 platform is used instead of Wayland for better stability

## Build and Release Context

### Build Archives
- **Release builds** are archived in `../Mavit-Archives/` (outside repository)
- **Build context** preserved in `docs/BUILD-CONTEXT.md`
- **Installer scripts** available in `docs/installers/`

### Recreating Builds
```bash
# Full rebuild process
npm run build && npm run dist

# Windows installer
node scripts/create-windows-ready.js

# Build outputs go to release/ (auto-created)
```

### Previous Builds Location
- **v1.0.0 builds**: `../Mavit-Archives/release-v1.0.0/`
- **Installer documentation**: `docs/BUILD-CONTEXT.md`
- **Working scripts**: All scripts preserved and functional