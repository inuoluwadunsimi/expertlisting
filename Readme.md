# ExperListing API

Property listing API with geo-bucket based location search, featuring case-insensitive and typo-tolerant search capabilities.

## Tools

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with TypeORM
- **Validation:** OpenAPI Validator + class-validator
- **Caching:** Redis
- **Testing:** Jest + Supertest
- **Documentation:** Swagger

## Prerequisites

- Node.js 16+ (18+ recommended)
- PostgreSQL 15+
- Redis (optional, for caching)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>

npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb experlisting_dev

# Or using psql
psql -c "CREATE DATABASE experlisting_dev;"
```

### 3. Environment Configuration

```bash
# Copy sample environment file
cp sample.env .env

# Edit .env with your credentials
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run start:dev
```

Server will start at `http://localhost:8085`

## Available Scripts

```bash
# Development
npm run start:dev          # Start with nodemon (auto-reload)
npm start                  # Start without auto-reload

# Database
npm run seed              # Seed database with test data
npm run migration:generate # Generate migration from entity changes
npm run migration:run     # Run pending migrations
npm run migration:revert  # Revert last migration

# Testing
npm test                  # Run all tests with coverage
npm run test:watch        # Run tests in watch mode
```
