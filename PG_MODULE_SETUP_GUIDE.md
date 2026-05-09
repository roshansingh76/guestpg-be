# PG Module - Setup & Testing Guide

## Quick Setup

### 1. Run Database Migration
```bash
# Create migration
npx prisma migrate dev --name add_pg_module

# Or if using script in package.json
npm run prisma:migrate
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Verify Routes are Loaded
The routes are automatically loaded in `/src/routes/index.ts`

---

## API Testing Examples

### Using cURL

#### 1. Create a PG
```bash
curl -X POST http://localhost:3000/api/pgs \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

#### 2. Get All PGs
```bash
curl http://localhost:3000/api/pgs
curl http://localhost:3000/api/pgs?city=Mumbai&status=active&page=1&limit=10
```

#### 3. Create Room for PG (ID: 1)
```bash
curl -X POST http://localhost:3000/api/pgs/1/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomType": "Standard",
    "roomNumber": "101",
    "totalBeds": 2,
    "availableBeds": 2,
    "pricePerBed": 5000,
    "acType": "AC"
  }'
```

#### 4. Create Staff Member
```bash
curl -X POST http://localhost:3000/api/pgs/1/staff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Manager",
    "email": "alice@example.com",
    "phone": "9876543211",
    "role": "Manager",
    "username": "alice_mgr",
    "password": "SecurePassword123!"
  }'
```

#### 5. Add Photos
```bash
curl -X POST http://localhost:3000/api/pgs/1/photos \
  -H "Content-Type: application/json" \
  -d '{
    "photoUrl": "https://example.com/photos/pg-photo-1.jpg"
  }'
```

---

### Using Postman

#### Collection Setup
1. Create new collection "PG Module"
2. Add requests with following base URL: `http://localhost:3000/api`

#### Sample Requests

**POST /pgs**
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

**GET /pgs** (with query params)
- city: Mumbai
- status: active
- pgType: Boys
- page: 1
- limit: 10

**POST /pgs/1/rooms**
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

---

## Database Queries (Optional Testing)

### View PGs
```sql
SELECT * FROM "PG" LIMIT 10;
```

### View Rooms for PG
```sql
SELECT * FROM "PGRoom" WHERE "pgId" = 1;
```

### View Staff Members
```sql
SELECT id, "pgId", name, email, phone, role, username, status FROM "PGStaff" WHERE "pgId" = 1;
```

### View Photos
```sql
SELECT * FROM "PGPhoto" WHERE "pgId" = 1;
```

### Check Statistics
```sql
SELECT 
  COUNT(*) as total_pgs,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_pgs
FROM "PG";
```

---

## File Changes Summary

### New Files Created:
1. `/src/controllers/pg.controller.ts` - PG CRUD operations
2. `/src/controllers/pgRoom.controller.ts` - Room management
3. `/src/controllers/pgStaff.controller.ts` - Staff management
4. `/src/controllers/pgPhoto.controller.ts` - Photo management
5. `/src/services/pg.service.ts` - PG business logic
6. `/src/services/room.service.ts` - Room business logic
7. `/src/services/pgStaff.service.ts` - Staff business logic & authentication
8. `/src/services/photo.service.ts` - Photo business logic
9. `/src/routes/pg.routes.ts` - All PG-related routes
10. `prisma/schema.prisma` - Updated with new models
11. `PG_MODULE_DOCUMENTATION.md` - Complete API documentation

### Modified Files:
1. `/src/routes/index.ts` - Added PG routes
2. `prisma/schema.prisma` - Added PG, PGRoom, PGStaff, PGPhoto models and enums

---

## Troubleshooting

### Issue: Prisma Client not found
**Solution:**
```bash
npx prisma generate
npm install
```

### Issue: Port already in use
**Solution:**
```bash
# Change port in app.ts or .env
PORT=3001
```

### Issue: Database connection error
**Solution:**
```bash
# Check DATABASE_URL in .env
# Ensure database is running
# Run migrations
npx prisma migrate dev
```

### Issue: Module not found errors
**Solution:**
```bash
npm install bcrypt
npm install -D @types/bcrypt
npm install express cors dotenv
npm install prisma @prisma/client
```

---

## Next Steps

### Frontend Integration (Admin Panel)
Create React components for:
1. PG Onboarding Form
2. Room Management Dashboard
3. Staff Management Panel
4. Photo Gallery Upload

### Additional Features
1. Add authentication middleware for staff login
2. Add file upload for photos (S3/CloudStorage)
3. Add email notifications for PG registration
4. Add search and advanced filtering
5. Add analytics dashboard

### API Enhancements
1. Add batch operations
2. Add export to CSV/Excel
3. Add approval workflow for new PGs
4. Add audit logging
5. Add rate limiting

---

## Dependencies Required

Ensure these are installed in `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "@prisma/client": "latest",
    "bcrypt": "^5.1.0"
  },
  "devDependencies": {
    "prisma": "latest",
    "@types/express": "^4.17.0",
    "@types/node": "^18.0.0",
    "@types/bcrypt": "^5.0.0",
    "typescript": "^4.9.0"
  }
}
```

Install with:
```bash
npm install
npm install -D prisma typescript @types/express @types/node @types/bcrypt
```

---

## Environment Variables

Add to `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/flexi_roomz"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

---

## Helpful Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Run migrations
npx prisma migrate dev

# Generate Prisma types
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View schema
npx prisma db pull
```

---

## Support & Documentation

Refer to:
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
