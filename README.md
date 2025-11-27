# Chat Online Frontend

A modern React application built with the following technologies:

## Tech Stack

- **React 18** - A JavaScript library for building user interfaces
- **Vite** - Next Generation Frontend Tooling
- **TypeScript** - JavaScript with syntax for types
- **Tailwind CSS** - A utility-first CSS framework
- **shadcn/ui** - Re-usable components built using Radix UI and Tailwind CSS
- **Zustand** - A small, fast and scalable bearbones state-management solution
- **ESLint** - Linting utility for JavaScript and TypeScript
- **Prettier** - Code formatter
- **Husky** - Git hooks made easy
- **lint-staged** - Run linters on git staged files

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 10 or higher

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Format

```bash
npm run format
```

## Project Structure

```
src/
├── components/      # Reusable UI components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions
├── store/           # Zustand stores
├── App.tsx          # Main application component
├── main.tsx         # Application entry point
└── index.css        # Global styles with Tailwind CSS
```

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

## License

MIT
