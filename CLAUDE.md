# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Start development server (Remix + Vite)
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Firebase Development
- `firebase emulators:start` - Start Firebase emulators (hosting on port 3000, functions on port 5001)
- `firebase deploy --only functions` - Deploy functions to Firebase
- `firebase deploy --only hosting` - Deploy hosting to Firebase

### Testing
No specific test commands are configured in this project.

## Architecture Overview

**Meno** is a meeting notes and audio recording application built with:

### Tech Stack
- **Frontend**: React + Vite + React Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Firebase (Firestore, Storage, Functions)
- **Authentication**: Firebase Auth
- **Deployment**: Firebase Hosting

### Key Application Structure

#### Routes & Navigation
- `/` - Main meetings list with CRUD operations
- `/meetings/:id` - Individual meeting detail view with tabbed content/summary editor
- `/login` - Authentication page
- App uses React Router with components in `app/pages/`

#### Data Model
Main entity is `Meeting` with:
- `id`, `userId`, `title`, `description`, `content`, `summary`, `status`, `fileUrl`, `created_at`
- Meetings have three states: "in progress" (AI processing), "completed", "draft"
- Audio files are stored in Firebase Storage

#### Component Architecture
- **Layout**: Sidebar-based layout with responsive design
- **UI Components**: All built with shadcn/ui (Radix primitives + Tailwind)
- **Key Components**:
  - `AudioRecorderModal` - Record audio directly in browser
  - `FileUploadModal` - Upload audio files
  - `Editor` - Markdown editor for meeting content
  - `MeetingStatusChip` - Visual status indicators

#### Firebase Integration
- **Firestore**: Meeting data storage with user-scoped queries
- **Storage**: Audio file uploads
- **Functions**: Server-side processing (separate package in `/functions/`)
- **Auth**: Client-side Firebase Auth with email/password and Google sign-in

#### Styling Standards
- **Component Library**: shadcn/ui for all interactive elements
- **Design System**: Light mode default, consistent spacing/typography
- **Responsive**: Mobile-first with card layouts on mobile, tables on desktop
- **Animations**: Subtle loading states and transitions

## Important File Locations

- `app/services/meetings.ts` - Core meeting CRUD operations
- `app/firebase/` - Firebase configuration and utilities
- `app/main.tsx` - Application entry point
- `app/App.tsx` - Main app component with React Router setup
- `app/pages/` - Page components (HomePage, LoginPage, MeetingDetailPage)
- `app/components/auth.tsx` - Authentication context and state management
- `app/firebase/auth.ts` - Firebase Auth utilities (email/password, Google)
- `app/components/layout.tsx` - Main app layout with sidebar
- `app/components/ui/` - shadcn/ui component library
- `functions/` - Firebase Functions (serves static files)
- `.cursor/rules/ui.mdc` - Detailed UI/UX guidelines for components

## Development Notes

- Path aliases: `~/*` maps to `./app/*`
- Firebase config is committed (public keys only)
- **Authentication**: Client-side Firebase Auth with React context
- Audio processing happens server-side via Firebase Functions
- Meeting content supports Markdown with `markdown-it` rendering

## UI/UX Guidelines

From `.cursor/rules/ui.mdc`:
- **Component Library**: All UI components must use shadcn/ui for accessible, composable React primitives
- **Styling**: Tailwind CSS utility-first approach for all styling
- **Design System**: Light mode default, consistent spacing/typography with rounded corners and subtle shadows
- **Responsiveness**: Mobile-first design with responsive utilities
- **Accessibility**: Clear focus states and full keyboard navigation support
