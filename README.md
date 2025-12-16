# 99-Challenge Project

This repository contains multiple independent coding challenges, each organized in its own folder. Each problem is a self-contained project with its own dependencies and setup instructions.

## Project Structure

```
├── problem1/    # First challenge
├── problem2/    # Second challenge (React/Vite project)
├── problem3/    # Third challenge
├── problem4/    # Fourth challenge
├── problem5/    # Fifth challenge (Node.js/Express with TypeScript)
├── problem6/    # Sixth challenge (Score board Architecture)
└── README.md    # This file
```

## How to Review Each Problem

Each problem folder is an independent package with its own:

- Source code
- Dependencies (package.json)
- Configuration files
- Setup instructions

### To review a specific problem:

1. Navigate to the problem folder:

   ```bash
   cd problem[number]
   ```

2. Read the problem-specific README or documentation (if available)

3. Install dependencies:

   ```bash
   npm install
   ```

4. Follow the specific instructions for that problem to run or build the project

## Problem-Specific Instructions

### Problem 2 (React/Vite Project)

For problem2, the following yarn scripts are available:

- `yarn dev` - Start development server with Vite
- `yarn build` - Build the project for production
- `yarn preview` - Preview the production build
- `yarn lint` - Run ESLint to check code quality

Example workflow:

```bash
cd problem2
yarn install
yarn dev       # For development
# or
yarn build     # To build for production
yarn preview   # To preview production build
```

### Problem 5 (Node.js/Express with TypeScript)

For problem5, the following npm scripts are available:

- `npm run dev` - Start development server with live-reloading using ts-node-dev
- `npm run build` - Compile TypeScript code to JavaScript
- `npm start` - Run the compiled application from dist directory

Example workflow:

```bash
cd problem5
npm install
npm run dev    # For development
# or
npm run build  # To compile
npm start      # To run compiled version
```

## Notes for Reviewers

- Each problem is completely independent
- Dependencies are not shared between problems
- Each problem may use different technologies and frameworks
- Review each problem individually based on its own requirements and setup
- Look for problem-specific README files or documentation within each folder

## Technologies Used

This repository showcases various technologies across different problems:

- JavaScript/TypeScript
- React with Vite
- Node.js with Express
- Various build tools and development environments
