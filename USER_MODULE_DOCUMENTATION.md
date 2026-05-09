# 👥 Users Management Module

## Overview

A complete user management system for the Flexi-Roomz platform with role-based access control and PG assignment.

---

## Features

✅ Create users with different roles (Admin, PG Owner, PG Staff)  
✅ Assign PG to PG Owner and PG Staff roles  
✅ User status management (Active/Inactive)  
✅ Secure password hashing with bcryptjs  
✅ List users with filtering and pagination  
✅ Update user information and password  
✅ Delete users  
✅ Get available PGs dropdown  
✅ User statistics  
✅ Get users by specific PG

---

## API Endpoints

### Base URL
```
http://localhost:3000/api/users
```

---

## 1. Create User
**Endpoint:** `POST /`

**Request Body:**
```json
{
  "name": "John Admin",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePassword123!",
  "role": "admin",
  "status": "active"
}
```

**For PG Owner (pgId required):**
```json
{
  "name": "Priya PG Owner",
  "email": "priya@example.com",
  "phone": "9876543211",
  "password": "SecurePassword123!",
  "role": "pg_owner",
  "pgId": 1,
  "status": "active"
}
```

**For PG Staff (pgId required):**
```json
{
  "name": "Raj Manager",
  "email": "raj@example.com",
  "phone": "9876543212",
  "password": "SecurePassword123!",
  "role": "pg_staff",
  "pgId": 1,
  "status": "active"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Admin",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "admin",
    "status": "active",
    "pgId": null,
    "pg": null,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

---

## 2. Get All Users
**Endpoint:** `GET /`

**Query Parameters:**
- `role` (optional): admin, pg_owner, pg_staff
- `status` (optional): active, inactive
- `pgId` (optional): filter by PG ID
- `page` (optional): default 1
- `limit` (optional): default 10

**Examples:**
```bash
# Get all users
GET /

# Get all admin users
GET /?role=admin

# Get active users with pagination
GET /?status=active&page=1&limit=20

# Get users of specific PG
GET /?pgId=1

# Get PG staff for specific PG
GET /?role=pg_staff&pgId=1
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Admin",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "admin",
      "status": "active",
      "pgId": null,
      "pg": null,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

## 3. Get User by ID
**Endpoint:** `GET /:id`

**Response:**
```json
{
  "id": 1,
  "name": "John Admin",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "admin",
  "status": "active",
  "pgId": null,
  "pg": null,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

---

## 4. Update User
**Endpoint:** `PUT /:id`

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "9876543220",
  "password": "NewPassword123!",
  "role": "pg_owner",
  "pgId": 2,
  "status": "active"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Name",
    "email": "newemail@example.com",
    "phone": "9876543220",
    "role": "pg_owner",
    "status": "active",
    "pgId": 2,
    "pg": {
      "id": 2,
      "pgName": "New PG",
      "city": "Mumbai",
      "state": "Maharashtra"
    },
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:05:00Z"
  }
}
```

---

## 5. Delete User
**Endpoint:** `DELETE /:id`

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## 6. Change User Status
**Endpoint:** `PATCH /:id/status`

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Response:**
```json
{
  "message": "User status updated successfully",
  "data": {
    "id": 1,
    "name": "John Admin",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "admin",
    "status": "inactive",
    "pgId": null,
    "pg": null,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:05:00Z"
  }
}
```

---

## 7. Get Users by PG
**Endpoint:** `GET /pg/:pgId`

**Query Parameters:**
- `page` (optional): default 1
- `limit` (optional): default 10

**Response:**
```json
{
  "data": [
    {
      "id": 2,
      "name": "Priya PG Owner",
      "email": "priya@example.com",
      "phone": "9876543211",
      "role": "pg_owner",
      "status": "active",
      "pgId": 1,
      "pg": {
        "id": 1,
        "pgName": "Sunrise PG",
        "city": "Mumbai",
        "state": "Maharashtra"
      },
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

## 8. Get Available PGs
**Endpoint:** `GET /pgs/available`

**Purpose:** Get list of active PGs for dropdown selection when creating/updating users

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "pgName": "Sunrise PG",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pgType": "Boys",
      "area": "Downtown",
      "ownerName": "John Doe"
    },
    {
      "id": 2,
      "pgName": "Starlight Girls PG",
      "city": "Bangalore",
      "state": "Karnataka",
      "pgType": "Girls",
      "area": "Indiranagar",
      "ownerName": "Jane Smith"
    }
  ],
  "total": 10
}
```

---

## Data Model

```typescript
{
  id: number
  name: string
  email: string (unique)
  phone: string
  passwordHash: string (hashed)
  role: 'admin' | 'pg_owner' | 'pg_staff'
  status: 'active' | 'inactive'
  pgId: number | null (required for pg_owner and pg_staff)
  pg: PG | null (relationship to PG)
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Roles & Responsibilities

### Admin
- Can create, read, update, delete all users
- Can assign users to PGs
- No PG assignment required (pgId = null)
- Full system access

### PG Owner
- Represents the owner of a PG
- Must be assigned to exactly one PG (pgId required)
- Can manage their PG and staff
- Limited to their assigned PG

### PG Staff
- Staff member working at a PG
- Must be assigned to exactly one PG (pgId required)
- Can manage PG operations
- Limited to their assigned PG

---

## Usage Examples

### cURL Examples

#### 1. Create Admin User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

#### 2. Create PG Owner (with PG selection)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Owner",
    "email": "priya@example.com",
    "phone": "9876543211",
    "password": "SecurePassword123!",
    "role": "pg_owner",
    "pgId": 1
  }'
```

#### 3. Create PG Staff
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Manager",
    "email": "raj@example.com",
    "phone": "9876543212",
    "password": "SecurePassword123!",
    "role": "pg_staff",
    "pgId": 1
  }'
```

#### 4. Get All Users with Filters
```bash
# Get all admin users
curl http://localhost:3000/api/users?role=admin

# Get active users
curl http://localhost:3000/api/users?status=active

# Get users of specific PG
curl http://localhost:3000/api/users?pgId=1

# Get PG staff for specific PG
curl http://localhost:3000/api/users?role=pg_staff&pgId=1
```

#### 5. Get Available PGs for Dropdown
```bash
curl http://localhost:3000/api/users/pgs/available
```

#### 6. Update User
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "role": "pg_owner",
    "pgId": 2
  }'
```

#### 7. Change User Status
```bash
curl -X PATCH http://localhost:3000/api/users/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

#### 8. Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

---

## Frontend Integration

### React Example - User Form

```javascript
import { useState, useEffect } from 'react';

function UserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin',
    pgId: null,
    status: 'active'
  });
  const [pgs, setPGs] = useState([]);

  // Fetch available PGs when role is pg_owner or pg_staff
  useEffect(() => {
    if (formData.role === 'pg_owner' || formData.role === 'pg_staff') {
      fetch('http://localhost:3000/api/users/pgs/available')
        .then(res => res.json())
        .then(data => setPGs(data.data));
    }
  }, [formData.role]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate pgId for PG Owner/Staff
    if ((formData.role === 'pg_owner' || formData.role === 'pg_staff') && !formData.pgId) {
      alert('Please select a PG');
      return;
    }

    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    if (response.ok) {
      alert('User created successfully!');
    } else {
      alert(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="admin">Admin</option>
        <option value="pg_owner">PG Owner</option>
        <option value="pg_staff">PG Staff</option>
      </select>

      {(formData.role === 'pg_owner' || formData.role === 'pg_staff') && (
        <select name="pgId" value={formData.pgId || ''} onChange={handleChange}>
          <option value="">Select PG</option>
          {pgs.map(pg => (
            <option key={pg.id} value={pg.id}>
              {pg.pgName} - {pg.city}
            </option>
          ))}
        </select>
      )}

      <select name="status" value={formData.status} onChange={handleChange}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <button type="submit">Create User</button>
    </form>
  );
}

export default UserForm;
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Missing required fields"
}
```

```json
{
  "message": "Invalid role. Must be admin, pg_owner, or pg_staff"
}
```

```json
{
  "message": "pgId is required for role: pg_owner"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error creating user",
  "error": "Details..."
}
```

---

## Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ Email uniqueness constraint
- ✅ Password validation for required length
- ✅ Status-based access control
- ✅ Input validation
- ✅ Role-based constraints (pgId requirement)
- ✅ Passwords never returned in responses

---

## Validation Rules

| Field | Rule |
|-------|------|
| name | Required, string |
| email | Required, unique, valid email format |
| phone | Required, string |
| password | Required, minimum 8 characters |
| role | Required, must be admin/pg_owner/pg_staff |
| pgId | Required only for pg_owner and pg_staff roles |
| status | Optional, must be active/inactive |

---

## Best Practices

1. **Always validate role and pgId combination**
   - PG Owner and PG Staff must have pgId
   - Admin must not have pgId

2. **Secure password requirements**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, special characters

3. **Status management**
   - Use status to disable users without deleting
   - Active users only can perform operations

4. **PG dropdown**
   - Always fetch available PGs from `/pgs/available`
   - Show PG name with city for clarity
   - Make it required when role is pg_owner or pg_staff

5. **Pagination**
   - Use pagination for large user lists
   - Default limit is 10, can be changed
   - Always handle "pages" count for UI

---

## Database Queries

### View All Users
```sql
SELECT * FROM "User" LIMIT 10;
```

### View Users by Role
```sql
SELECT * FROM "User" WHERE role = 'pg_owner';
```

### View Users by PG
```sql
SELECT * FROM "User" WHERE "pgId" = 1;
```

### View Active Users
```sql
SELECT * FROM "User" WHERE status = 'active';
```

### Get User Statistics
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
  SUM(CASE WHEN role = 'pg_owner' THEN 1 ELSE 0 END) as pg_owners,
  SUM(CASE WHEN role = 'pg_staff' THEN 1 ELSE 0 END) as pg_staff,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
FROM "User";
```

---

## Testing with Postman

### Collection Setup
1. Create new collection "User Management"
2. Add requests with base URL: `http://localhost:3000/api/users`

### Sample Requests
**POST Create User:**
- URL: `http://localhost:3000/api/users`
- Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "1234567890",
  "password": "Password123!",
  "role": "admin"
}
```

**GET Get Available PGs:**
- URL: `http://localhost:3000/api/users/pgs/available`
- Method: GET

---

## Troubleshooting

### Issue: "Email already exists"
**Solution**: Use a unique email address

### Issue: "pgId is required for role"
**Solution**: Provide pgId when role is pg_owner or pg_staff

### Issue: "User not found"
**Solution**: Verify the user ID exists

### Issue: "Invalid role"
**Solution**: Use only admin, pg_owner, or pg_staff

---

## Summary

The Users Management Module provides:
- ✅ Complete CRUD operations for users
- ✅ Role-based user management (Admin, PG Owner, PG Staff)
- ✅ PG assignment for owners and staff
- ✅ Secure password handling
- ✅ User status management
- ✅ Flexible filtering and pagination
- ✅ Available PGs dropdown for frontend

Ready for production use! 🚀
