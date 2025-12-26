# URL Shortener Frontend

This repository contains the frontend application for a URL Shortener service. Built with Next.js 16 and React 19, this project demonstrates a modern, type-safe, and performance-oriented architecture. It features a responsive user interface, internationalization support, and comprehensive testing coverage.

## Key Features

- **Authentication**: Secure login and registration flows with client-side validation using Zod.
- **URL Management**: Interface for shortening URLs and viewing a paginated history of shortened links.
- **Internationalization (i18n)**: Full support for multiple languages (English and Portuguese - pt-BR) using i18next.
- **Theming**: Dark and light mode support via a dedicated theme context.
- **Responsive Design**: Mobile-first approach using Tailwind CSS v4.
- **Error Handling**: Robust error boundaries and toast notifications for user feedback.

## Technology Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion, clsx, tailwind-merge
- **State Management**: React Context API, Custom Hooks
- **Form Validation**: Zod
- **Internationalization**: i18next, react-i18next
- **Testing**: Vitest, React Testing Library
- **Icons**: Lucide React

## Project Structure

The project follows a modular structure designed for scalability:

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components, separated into feature-specific (e.g., `auth-card`, `urls-table`) and generic UI elements.
- `lib/`: Core utilities, API service layers, Zod schemas, and context providers.
- `hooks/`: Custom React hooks for logic encapsulation (e.g., `useAsync`, `useApi`).
- `public/locales/`: Translation files for i18n.
- `__tests__/`: Unit and integration tests configured with Vitest.

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd url-shortener-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Runs the built application in production mode.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run test`: Executes the test suite using Vitest.
- `npm run test:ui`: Opens the Vitest UI for interactive testing.
- `npm run test:coverage`: Generates a test coverage report.
