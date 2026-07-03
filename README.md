# HipHXP.id Backend Foundation

This workspace contains a production-ready backend foundation for a Hip-Hop Indonesia media platform. The focus is on database architecture, API structure, authentication, security, and scalability while keeping the frontend intentionally out of scope.

## What is included

- Enterprise Express + Prisma backend scaffold
- PostgreSQL schema for news, music, lifestyle, exclusive content, community directories, events, partnerships, analytics, files, notifications, logs, and authentication
- JWT authentication flow with refresh token support
- Maintenance / Coming Soon landing endpoint
- Admin dashboard statistics endpoint
- REST API route structure for authentication, content, events, partnerships, and documentation

## Project status

- Backend architecture: implemented
- Database schema: implemented
- Migration and seed scaffolding: implemented
- Runtime API: implemented

## API Endpoints

- `GET /api/docs`
- `GET /api/content/articles`
- `GET /api/content/articles/:slug`
- `GET /api/events`
- `GET /api/partnerships`
- `GET /api/partnerships/:id`
- `POST /api/partnerships`
- `PATCH /api/partnerships/:id`
- `DELETE /api/partnerships/:id`
- `GET /api/dashboard/stats`

## Next steps

1. Create the PostgreSQL database and update DATABASE_URL.
2. Run prisma migrate dev.
3. Run npm install.
4. Run npm run dev.
5. Connect the frontend to the published API once the maintenance page is ready.
