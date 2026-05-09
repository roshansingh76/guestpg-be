# 🏗️ PG Module - Architecture & API Structure

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
│                    (Web / Mobile Frontend)                       │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTP Requests (JSON)
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js Application                        │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │             Routes Layer (pg.routes.ts)                   │  │
│ │  POST/GET/PUT/DELETE /api/pgs                             │  │
│ │  POST/GET/PUT/DELETE /api/pgs/:pgId/rooms                │  │
│ │  POST/GET/PUT/DELETE /api/pgs/:pgId/staff                │  │
│ │  POST/GET/DELETE /api/pgs/:pgId/photos                   │  │
│ │  POST /api/pg-auth/login                                  │  │
│ └────────────────────────────────────────────────────────────┘  │
│             ↓                                                     │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │        Controllers Layer (*.controller.ts)               │  │
│ │  • pg.controller.ts (8 functions)                        │  │
│ │  • pgRoom.controller.ts (5 functions)                    │  │
│ │  • pgStaff.controller.ts (6 functions)                   │  │
│ │  • pgPhoto.controller.ts (3 functions)                   │  │
│ │  • pgAuth.controller.ts (4 functions)                    │  │
│ └────────────────────────────────────────────────────────────┘  │
│             ↓                                                     │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │        Services Layer (*.service.ts)                      │  │
│ │  • pg.service.ts (PG business logic)                      │  │
│ │  • room.service.ts (Room business logic)                  │  │
│ │  • pgStaff.service.ts (Staff + Auth logic)               │  │
│ │  • photo.service.ts (Photo management logic)             │  │
│ └────────────────────────────────────────────────────────────┘  │
│             ↓                                                     │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │        Prisma ORM Layer                                   │  │
│ │  • Database abstraction                                  │  │
│ │  • Type-safe queries                                    │  │
│ │  • Migration management                                 │  │
│ └────────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ SQL Queries
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │     PG       │ │   PGRoom     │ │   PGStaff    │            │
│  │   (1 table)  │ │  (1 table)   │ │  (1 table)   │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐                                               │
│  │   PGPhoto    │                                               │
│  │  (1 table)   │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP Request                               │
│  POST /api/pgs                                                  │
│  {pgName, ownerName, ownerEmail, ...}                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │  Routes (pg.routes)  │
              │  Match route pattern │
              └──────────────┬───────┘
                             │
                             ↓
              ┌──────────────────────────────┐
              │  Controller (createPG)       │
              │  • Validate input            │
              │  • Check for errors          │
              │  • Call service              │
              └──────────────┬───────────────┘
                             │
                             ↓
              ┌──────────────────────────────┐
              │  Service (PGService)         │
              │  • Business logic            │
              │  • Validation                │
              │  • Call Prisma               │
              └──────────────┬───────────────┘
                             │
                             ↓
              ┌──────────────────────────────┐
              │  Prisma ORM                  │
              │  • Generate SQL              │
              │  • Execute query             │
              │  • Return results            │
              └──────────────┬───────────────┘
                             │
                             ↓
              ┌──────────────────────────────┐
              │  PostgreSQL Database         │
              │  • Insert record             │
              │  • Return inserted data      │
              └──────────────┬───────────────┘
                             │
                    (Response flows back up)
                             │
                             ↓
              ┌──────────────────────────────┐
              │  Controller Response         │
              │  {                           │
              │    message: "...",           │
              │    data: {id, ...}           │
              │  }                           │
              └──────────────┬───────────────┘
                             │
                             ↓
                   ┌─────────────────────┐
                   │  JSON Response      │
                   │  Status: 201        │
                   │  Body: {...}        │
                   └─────────────────────┘
```

---

## Database Schema Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                             PG Table                                 │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ id (PK)           │ Integer, Auto-increment                 │  │
│ │ pgName            │ String                                  │  │
│ │ ownerName         │ String                                  │  │
│ │ ownerPhone        │ String                                  │  │
│ │ ownerEmail        │ String (UNIQUE)                         │  │
│ │ addressLine1      │ String                                  │  │
│ │ addressLine2      │ String (Optional)                       │  │
│ │ nearbyMark        │ String (Optional)                       │  │
│ │ area              │ String                                  │  │
│ │ city              │ String                                  │  │
│ │ state             │ String                                  │  │
│ │ latitude          │ Float                                   │  │
│ │ longitude         │ Float                                   │  │
│ │ pgType            │ Enum (Boys/Girls/CoLiving)             │  │
│ │ numberOfRooms     │ Integer                                 │  │
│ │ isFoodAvailable   │ Boolean (default: false)                │  │
│ │ status            │ Enum (active/inactive)                 │  │
│ │ createdAt         │ DateTime (default: now)                 │  │
│ │ updatedAt         │ DateTime (auto-updated)                 │  │
│ └────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ↓                     ↓
    ┌──────────────────────┐  ┌──────────────────────┐
    │    PGRoom Table      │  │   PGStaff Table      │
    ├──────────────────────┤  ├──────────────────────┤
    │ id (PK)              │  │ id (PK)              │
    │ pgId (FK) ──┐        │  │ pgId (FK) ──┐        │
    │ roomType    │        │  │ name        │        │
    │ roomNumber  │        │  │ email       │        │
    │ totalBeds   │        │  │ phone       │        │
    │ availBeds   │        │  │ role        │        │
    │ pricePerBed │        │  │ username ◄──┼─ UNIQUE
    │ acType      │        │  │ password    │        │
    │ createdAt   │        │  │ status      │        │
    │ updatedAt   │        │  │ createdAt   │        │
    └──────────────────────┘  │ updatedAt   │        │
           (1-n)              └──────────────────────┘
                                      (1-n)
                  │
                  │
                  ↓
    ┌──────────────────────┐
    │   PGPhoto Table      │
    ├──────────────────────┤
    │ id (PK)              │
    │ pgId (FK) ◄──────────┼─ CASCADE DELETE
    │ photoUrl            │
    │ createdAt           │
    │ updatedAt           │
    └──────────────────────┘
            (1-n)
```

---

## API Endpoint Tree

```
/api
│
├── /pgs ...................... PG Management
│   ├── POST / ............... Create PG
│   ├── GET / ................ List all PGs (paginated)
│   ├── GET /:id ............. Get PG details
│   ├── PUT /:id ............. Update PG
│   ├── DELETE /:id .......... Delete PG
│   ├── PATCH /:id/status .... Change PG status
│   │
│   ├── /:pgId/rooms ......... Room Management
│   │   ├── POST / ........... Create room
│   │   ├── GET / ............ List rooms
│   │   ├── GET /:roomId ..... Get room
│   │   ├── PUT /:roomId ..... Update room
│   │   └── DELETE /:roomId .. Delete room
│   │
│   ├── /:pgId/staff ......... Staff Management
│   │   ├── POST / ........... Create staff
│   │   ├── GET / ............ List staff
│   │   ├── GET /:staffId .... Get staff
│   │   ├── PUT /:staffId .... Update staff
│   │   ├── DELETE /:staffId . Delete staff
│   │   └── PATCH /:staffId/status . Change status
│   │
│   └── /:pgId/photos ........ Photo Management
│       ├── POST / ........... Add photo
│       ├── GET / ............ List photos
│       └── DELETE /:photoId . Delete photo
│
└── /pg-auth .................. Authentication
    ├── POST /login ......... Staff login
    ├── POST /logout ........ Staff logout
    ├── PUT /:pgId/staff/:staffId/change-password
    └── GET /:pgId/staff/:staffId/profile
```

---

## Data Flow for Common Operations

### 1. Create PG Operation
```
Client Request
    ↓
POST /api/pgs
{pgName, ownerName, ...}
    ↓
pg.routes.ts (POST /)
    ↓
pg.controller.ts (createPG)
    - Validate required fields
    - Check email uniqueness
    ↓
pg.service.ts (createPG)
    - Create Prisma record
    ↓
Prisma ORM
    - Generate INSERT SQL
    ↓
PostgreSQL
    - Insert record
    - Return with relations
    ↓
Response
{
  message: "PG created successfully",
  data: {id, pgName, ...}
}
```

### 2. Add Staff to PG
```
Client Request
    ↓
POST /api/pgs/:pgId/staff
{name, email, role, username, password}
    ↓
pg.routes.ts (POST /:pgId/staff)
    ↓
pgStaff.controller.ts (createPGStaff)
    - Validate all fields
    - Check username unique
    ↓
pgStaff.service.ts (createStaff)
    - Hash password (bcryptjs)
    - Create Prisma record
    ↓
Prisma ORM
    - Generate INSERT SQL
    ↓
PostgreSQL
    - Insert staff record
    - Return (no password)
    ↓
Response
{
  message: "Staff created successfully",
  data: {id, name, email, role, ...}
}
```

### 3. Authentication Flow
```
Client Request
    ↓
POST /api/pg-auth/login
{username, password}
    ↓
pgAuth.routes.ts (POST /login)
    ↓
pgAuth.controller.ts (pgStaffLogin)
    ↓
pgStaff.service.ts (authenticateStaff)
    - Find staff by username
    - Compare password (bcryptjs)
    - Return staff without password
    ↓
Generate JWT Token
    - Payload: {id, pgId, username, role}
    - Secret: JWT_SECRET
    - Expiry: 24 hours
    ↓
Response
{
  message: "Login successful",
  token: "eyJhbGciOiJIUzI1NiIs...",
  data: {id, name, email, role, pgId}
}
```

---

## Authentication & Authorization Flow

```
┌──────────────────────────────────────────────────────────────┐
│              Protected Endpoint Request                      │
│  PUT /api/pg-auth/:pgId/staff/:staffId/change-password      │
│  Headers: Authorization: Bearer <token>                     │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ↓
    ┌────────────────────────────────┐
    │  verifyToken Middleware        │
    │  • Extract token from header   │
    │  • Verify JWT signature        │
    │  • Decode payload              │
    │  • Attach user to request      │
    └────────────┬───────────────────┘
                 │
         ┌───────┴───────┐
         │               │
      Valid           Invalid
        │               │
        ↓               ↓
    Continue    ┌──────────────┐
                │  401 Error   │
                │  No token    │
                │  Invalid sig │
                └──────────────┘
        │
        ↓
    ┌────────────────────────────────┐
    │  belongsToPG Middleware        │
    │  • Check pgId in params        │
    │  • Compare with user.pgId      │
    │  • Validate ownership          │
    └────────────┬───────────────────┘
                 │
         ┌───────┴───────┐
         │               │
      Match        Mismatch
        │               │
        ↓               ↓
    Continue    ┌──────────────┐
                │  403 Error   │
                │  No access   │
                │  to this PG  │
                └──────────────┘
        │
        ↓
    ┌────────────────────────────────┐
    │  Controller Function           │
    │  changePassword                │
    │  • Process request             │
    │  • Call service                │
    │  • Return response             │
    └────────────────────────────────┘
```

---

## Technology Stack Diagram

```
┌──────────────────────────────────────┐
│         Frontend (Client)            │
│  React / Vue / Angular / Mobile      │
└─────────────┬──────────────────────┬─┘
              │ HTTP/JSON            │
              │                      │
          ┌───┴──────────────────────┴──┐
          │   Express.js Server         │
          ├─────────────────────────────┤
          │ TypeScript (Type Safety)    │
          │ Middleware (Auth, CORS)     │
          │ Routes (RESTful API)        │
          │ Controllers (Business)      │
          │ Services (Logic)            │
          └──────────┬──────────────────┘
                     │ SQL Queries
                     ↓
          ┌──────────────────────┐
          │  Prisma ORM          │
          │  • Schema            │
          │  • Migrations        │
          │  • Type Generation   │
          └──────────┬───────────┘
                     │ SQL
                     ↓
          ┌──────────────────────┐
          │ PostgreSQL Database  │
          │ • Tables             │
          │ • Indexes            │
          │ • Relationships      │
          └──────────────────────┘

Other Services:
├── bcryptjs (Password Hashing)
├── jsonwebtoken (JWT Auth)
├── cors (Cross-Origin)
├── express (Framework)
└── dotenv (Config)
```

---

## Module Dependencies

```
PG Module
│
├── Express.js
│   ├── Routes
│   ├── Middleware
│   └── Controllers
│
├── TypeScript
│   ├── Type Definitions
│   ├── Interfaces
│   └── Enums
│
├── Prisma
│   ├── Schema
│   ├── Migrations
│   └── Client
│
├── PostgreSQL
│   ├── Database
│   ├── Tables
│   └── Relationships
│
├── bcryptjs
│   └── Password Hashing
│
├── jsonwebtoken
│   └── JWT Generation/Verification
│
├── cors
│   └── Cross-Origin Support
│
└── dotenv
    └── Environment Variables
```

---

## Performance Characteristics

```
Operation           │ Time Complexity │ Database Hits
─────────────────────┼─────────────────┼──────────────
Create PG          │ O(1)            │ 1 INSERT
Get PG            │ O(1)            │ 1 SELECT
Update PG         │ O(1)            │ 1 UPDATE
Delete PG         │ O(1)            │ 1 DELETE + CASCADE
List PGs          │ O(n)            │ 1 COUNT + 1 SELECT
Search PGs        │ O(n)            │ 1 COUNT + 1 SELECT
Create Room       │ O(1)            │ 1 INSERT
Get Rooms (PG)    │ O(n)            │ 1 COUNT + 1 SELECT
Create Staff      │ O(1)            │ 1 INSERT (hash ~50ms)
Staff Login       │ O(1)            │ 1 SELECT + compare (~10ms)
Change Password   │ O(1)            │ 1 UPDATE (hash ~50ms)
```

---

**Architecture Ready for Production! 🚀**
