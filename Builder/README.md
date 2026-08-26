# Builder Platform

Turborepo workspace for the Builder Platform frontend and backend.

## Structure

- `apps/web` — Vite + React form-builder frontend.
- `apps/api` — Express + PostgreSQL API.
- `packages/*` — shared configuration and UI-package space for future cross-app code.

## Getting started

Install all workspace dependencies from the repository root:

```sh
npm install
```

Set `DATABASE_URL` in `apps/api/.env`, then run both applications:

```sh
npm run dev
```

Run one app when needed:

```sh
npm run dev --workspace=@builder/web
npm run dev --workspace=@builder/api
```

Other root commands:

```sh
npm run build
npm run check-types
npm run lint
npm run seed
```
