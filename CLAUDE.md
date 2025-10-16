# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nevada Operational Canine Medical Group (nvopk9medgrp) - A Next.js 15 application providing life-saving medical training, equipment, and emergency protocols for police, military, and SAR K9 units.

## Tech Stack

- **Framework**: Next.js 15.5.5 (App Router)
- **React**: 19.1.0
- **Styling**: Tailwind CSS v4 (CSS-based configuration in `app/globals.css`)
- **UI Components**: shadcn/ui with Radix UI primitives (New York style)
- **Theme**: next-themes for dark mode support
- **Linter/Formatter**: Biome 2.2.0 (replaces ESLint + Prettier)
- **Icons**: lucide-react
- **Build Tool**: Turbopack

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build with Turbopack
npm build

# Start production server
npm start

# Lint code with Biome
npm run lint

# Format code with Biome
npm run format
```

## Architecture

### Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4, which has a fundamentally different configuration approach:

- **No `tailwind.config.js/ts`**: Configuration is done entirely in CSS
- **Configuration location**: `app/globals.css` using `@theme inline { }` blocks
- **Theme customization**: Colors, fonts, spacing, etc. are defined as CSS variables in the `@theme` block
- **Custom variants**: Use `@custom-variant` directive (e.g., `@custom-variant dark (&:is(.dark *))`)
- **Font families**: Define fonts in `@theme` with `--font-{name}` syntax (e.g., `--font-inter`) which creates `font-{name}` utility classes

### shadcn/ui Setup

- **Components directory**: `components/ui/`
- **Path aliases**: Configured via `components.json` and `tsconfig.json`
  - `@/components` → `./components`
  - `@/lib` → `./lib`
  - `@/hooks` → `./hooks`
- **Style**: New York variant
- **Theme**: Uses CSS variables for theming in `app/globals.css`
- **Base color**: Neutral
- **No prefix**: Component classes have no prefix

### Biome Configuration

- **Replaces ESLint and Prettier**: Use Biome for all linting and formatting
- **Indent**: 2 spaces
- **Import organization**: Automatically organizes imports on save
- **Next.js + React rules**: Enabled via `domains` configuration
- **Unknown CSS at-rules disabled**: Tailwind v4 uses new at-rules like `@theme`

### Dark Mode

- Dark mode is implemented using `next-themes` with class-based theming
- Theme provider wraps the app in `app/layout.tsx`
- System theme detection enabled
- Custom dark variant defined in `app/globals.css`

## Project Structure

```
app/
  ├── layout.tsx       # Root layout with ThemeProvider
  ├── page.tsx         # Home page
  └── globals.css      # Tailwind v4 config + theme variables

components/
  ├── ui/              # shadcn/ui components
  └── ModeToggle.tsx   # Dark mode toggle component

lib/
  └── utils.ts         # cn() utility for class merging
```

## Important Notes

- When adding Google Fonts or local fonts, define them in the `@theme inline` block in `app/globals.css` using `--font-{name}` syntax
- Always use `npm run lint` and `npm run format` with Biome, not ESLint or Prettier
- The project uses Turbopack for faster builds (included in both dev and build commands)
