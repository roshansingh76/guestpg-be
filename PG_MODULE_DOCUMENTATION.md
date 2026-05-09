# PG (Paying Guest) Module Documentation

## Overview
The PG Module provides complete management for Paying Guest establishments including:
- PG Information & Onboarding
- Room Management
- Staff/User Management
- Photo Gallery

---

## 1. PG Management

### 1.1 Create PG
**Endpoint:** `POST /api/pgs`

**Request Body:**
```json
{
  "pgName": "Sunrise PG",
  "ownerName": "John Doe",
  "ownerPhone": "9876543210",
  "ownerEmail": "john@example.com",
  "addressLine1": "123 Main Street",
  "addressLine2": "Near Railway Station",
  "nearbyMark": "Opp to City Hospital",
  "area": "Downtown",
  "city": "Mumbai",
  "state": "Maharashtra",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "pgType": "Boys",
  "numberOfRooms": 10,
  "isFoodAvailable": true
}
```

**Response:**
```json
{
  "message": "PG created successfully",
  "data": {
    "id": 1,
    "pgName": "Sunrise PG",
    "ownerName": "John Doe",
    "ownerPhone": "9876543210",
    "ownerEmail": "john@example.com",
    "addressLine1": "123 Main Street",
    "addressLine2": "Near Railway Station",
    "nearbyMark": "Opp to City Hospital",
    "area": "Downtown",
    "city": "Mumbai",
    "state": "Maharashtra",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "pgType": "Boys",
    "numberOfRooms": 10,
    "isFoodAvailable": true,
    "status": "active",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z",
    "rooms": [],
    "staff": [],
    "photos": []
  }
}
```

### 1.2 Get All PGs
**Endpoint:** `GET /api/pgs`

**Query Parameters:**
- `status` (optional): active/inactive
- `city` (optional): filter by city
- `pgType` (optional): Boys/Girls/CoLiving
- `page` (optional): default 1
- `limit` (optional): default 10

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### 1.3 Get PG by ID
**Endpoint:** `GET /api/pgs/:id`

### 1.4 Update PG
**Endpoint:** `PUT /api/pgs/:id`

**Request Body:** (Any field can be updated)
```json
{
  "pgName": "Updated PG Name",
  "numberOfRooms": 15,
  "isFoodAvailable": false
}
```

### 1.5 Delete PG
**Endpoint:** `DELETE /api/pgs/:id`

### 1.6 Change PG Status
**Endpoint:** `PATCH /api/pgs/:id/status`

**Request Body:**
```json
{
  "status": "inactive"
}
```

---

## 2. Room Management

### 2.1 Create Room
**Endpoint:** `POST /api/pgs/:pgId/rooms`

**Request Body:**
```json
{
  "roomType": "Standard",
  "roomNumber": "101",
  "totalBeds": 2,
  "availableBeds": 2,
  "pricePerBed": 5000,
  "acType": "AC"
}
```

**Response:**
```json
{
  "message": "Room created successfully",
  "data": {
    "id": 1,
    "pgId": 1,
    "roomType": "Standard",
    "roomNumber": "101",
    "totalBeds": 2,
    "availableBeds": 2,
    "pricePerBed": 5000,
    "acType": "AC",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

### 2.2 Get All Rooms for PG
**Endpoint:** `GET /api/pgs/:pgId/rooms`

**Query Parameters:**
- `page` (optional): default 1
- `limit` (optional): default 10

### 2.3 Get Room by ID
**Endpoint:** `GET /api/pgs/:pgId/rooms/:roomId`

### 2.4 Update Room
**Endpoint:** `PUT /api/pgs/:pgId/rooms/:roomId`

**Request Body:**
```json
{
  "availableBeds": 1,
  "pricePerBed": 5500
}
```

### 2.5 Delete Room
**Endpoint:** `DELETE /api/pgs/:pgId/rooms/:roomId`

---

## 3. Staff/User Management

### 3.1 Create Staff Member
**Endpoint:** `POST /api/pgs/:pgId/staff`

**Request Body:**
```json
{
  "name": "Alice Manager",
  "email": "alice@example.com",
  "phone": "9876543211",
  "role": "Manager",
  "username": "alice_mgr",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Staff member created successfully",
  "data": {
    "id": 1,
    "pgId": 1,
    "name": "Alice Manager",
    "email": "alice@example.com",
    "phone": "9876543211",
    "role": "Manager",
    "username": "alice_mgr",
    "status": "active",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```
*Note: Password is hashed and not returned in response*

### 3.2 Get All Staff Members
**Endpoint:** `GET /api/pgs/:pgId/staff`

**Query Parameters:**
- `status` (optional): active/inactive
- `role` (optional): Owner/Manager
- `page` (optional): default 1
- `limit` (optional): default 10

### 3.3 Get Staff Member by ID
**Endpoint:** `GET /api/pgs/:pgId/staff/:staffId`

### 3.4 Update Staff Member
**Endpoint:** `PUT /api/pgs/:pgId/staff/:staffId`

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "password": "NewPassword123!"
}
```

### 3.5 Delete Staff Member
**Endpoint:** `DELETE /api/pgs/:pgId/staff/:staffId`

### 3.6 Change Staff Status
**Endpoint:** `PATCH /api/pgs/:pgId/staff/:staffId/status`

**Request Body:**
```json
{
  "status": "inactive"
}
```

---

## 4. Photo Management

### 4.1 Add Photo
**Endpoint:** `POST /api/pgs/:pgId/photos`

**Request Body:**
```json
{
  "photoUrl": "https://example.com/photos/pg-photo-1.jpg"
}
```

**Response:**
```json
{
  "message": "Photo added successfully",
  "data": {
    "id": 1,
    "pgId": 1,
    "photoUrl": "https://example.com/photos/pg-photo-1.jpg",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

### 4.2 Get All Photos
**Endpoint:** `GET /api/pgs/:pgId/photos`

**Response:**
```json
{
  "data": [...],
  "total": 5
}
```

### 4.3 Delete Photo
**Endpoint:** `DELETE /api/pgs/:pgId/photos/:photoId`

---

## Data Models

### PG Model
```typescript
{
  id: number
  pgName: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string (unique)
  addressLine1: string
  addressLine2: string (optional)
  nearbyMark: string (optional)
  area: string
  city: string
  state: string
  latitude: number
  longitude: number
  pgType: 'Boys' | 'Girls' | 'CoLiving'
  numberOfRooms: number
  isFoodAvailable: boolean
  status: 'active' | 'inactive'
  createdAt: DateTime
  updatedAt: DateTime
  rooms: PGRoom[]
  staff: PGStaff[]
  photos: PGPhoto[]
}
```

### PGRoom Model
```typescript
{
  id: number
  pgId: number (foreign key)
  roomType: string
  roomNumber: string (unique per PG)
  totalBeds: number
  availableBeds: number
  pricePerBed: number
  acType: 'AC' | 'NonAC'
  createdAt: DateTime
  updatedAt: DateTime
}
```

### PGStaff Model
```typescript
{
  id: number
  pgId: number (foreign key)
  name: string
  email: string
  phone: string
  role: 'Owner' | 'Manager'
  username: string (unique)
  password: string (hashed)
  status: 'active' | 'inactive'
  createdAt: DateTime
  updatedAt: DateTime
}
```

### PGPhoto Model
```typescript
{
  id: number
  pgId: number (foreign key)
  photoUrl: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Missing required fields"
}
```

### 404 Not Found
```json
{
  "message": "PG not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error creating PG",
  "error": "Error details"
}
```

---

## File Structure

```
admin-be/
├── src/
│   ├── controllers/
│   │   ├── pg.controller.ts
│   │   ├── pgRoom.controller.ts
│   │   ├── pgStaff.controller.ts
│   │   └── pgPhoto.controller.ts
│   ├── services/
│   │   ├── pg.service.ts
│   │   ├── room.service.ts
│   │   ├── pgStaff.service.ts
│   │   └── photo.service.ts
│   ├── routes/
│   │   └── pg.routes.ts
│   └── db/
│       └── prisma.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

---

## Installation & Migration

1. Update Prisma schema:
```bash
npm run prisma migrate dev --name add_pg_module
```

2. Generate Prisma client:
```bash
npm run prisma generate
```

---

## Notes

- Passwords are automatically hashed using bcrypt before storage
- All timestamps are in UTC format
- Pagination starts from page 1 with default limit of 10
- Cascade delete is enabled for related entities (rooms, staff, photos deleted when PG is deleted)
