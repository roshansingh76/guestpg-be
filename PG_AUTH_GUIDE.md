# PG Staff Authentication Guide

## Overview

The PG module includes a complete authentication system for staff members (Owner/Manager) to login and manage PG information.

---

## Authentication Features

- ✅ Username/Password login
- ✅ JWT token-based sessions
- ✅ Role-based access control (Owner/Manager)
- ✅ Password change functionality
- ✅ Password hashing using bcryptjs
- ✅ Token expiration (24 hours)

---

## Authentication Endpoints

### 1. Staff Login
**Endpoint:** `POST /api/pg-auth/login`

**Request Body:**
```json
{
  "username": "alice_mgr",
  "password": "SecurePassword123!"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "name": "Alice Manager",
    "email": "alice@example.com",
    "role": "Manager",
    "pgId": 1
  }
}
```

**Response (Error):**
```json
{
  "message": "Invalid username or password"
}
```

---

### 2. Staff Logout
**Endpoint:** `POST /api/pg-auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logout successful. Please remove the token from client."
}
```

---

### 3. Change Password
**Endpoint:** `PUT /api/pg-auth/:pgId/staff/:staffId/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "SecurePassword123!",
  "newPassword": "NewSecurePassword456!",
  "confirmPassword": "NewSecurePassword456!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

### 4. Get Current Profile
**Endpoint:** `GET /api/pg-auth/:pgId/staff/:staffId/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
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
```

---

## JWT Token Usage

### What is JWT?
JWT (JSON Web Token) is a secure way to transmit information between client and server. The token contains encoded user information and expires after 24 hours.

### Token Format
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZXhwIjoxNjA0ODk5NjAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Structure:
- **Header**: Algorithm and token type
- **Payload**: User data (id, pgId, username, role)
- **Signature**: Security verification

### Token Expiration
Tokens expire after 24 hours. After expiration, user must login again to get a new token.

---

## Using Tokens in Requests

### Format
```
Authorization: Bearer <token>
```

### Example with cURL
```bash
curl -X GET http://localhost:3000/api/pg-auth/1/staff/1/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example with Fetch API (JavaScript)
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:3000/api/pg-auth/1/staff/1/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### Example with Axios (JavaScript)
```javascript
import axios from 'axios';

const token = localStorage.getItem('authToken');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

api.get('/pg-auth/1/staff/1/profile')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

---

## Frontend Implementation Example

### React Hook for Authentication

```javascript
import { useState } from 'react';

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/pg-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setToken(data.token);
      setUser(data.data);
      localStorage.setItem('authToken', data.token);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return { token, user, loading, error, login, logout };
};

export default useAuth;
```

### Login Component Example

```javascript
import { useState } from 'react';
import useAuth from './useAuth';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      // Redirect to dashboard
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

---

## Security Best Practices

### 1. Store Token Securely
```javascript
// Good: Use localStorage or sessionStorage
localStorage.setItem('authToken', token);

// Better: Use httpOnly cookies (backend set)
// Cookies are automatically sent with requests
```

### 2. Include Token in Requests
```javascript
// Always include token in Authorization header
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 3. Handle Token Expiration
```javascript
// Check for 401 responses and refresh token
if (response.status === 401) {
  // Token expired, redirect to login
  localStorage.removeItem('authToken');
  // Redirect to login page
}
```

### 4. Protect Sensitive Data
```javascript
// Never log tokens in console in production
console.log(token); // ❌ Don't do this

// Store sensitive data securely
const sensitiveData = useRef(null);
```

---

## Error Handling

### Common Errors

| Error | Status | Solution |
|-------|--------|----------|
| Invalid username or password | 401 | Check credentials |
| No token provided | 401 | Login first |
| Invalid token | 401 | Login again |
| Token expired | 401 | Login again (token lasts 24h) |
| Account deactivated | 403 | Contact PG owner |
| You do not have access to this PG | 403 | Wrong PG ID |

### Error Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Environment Variables

Add to `.env`:
```env
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRE="24h"
```

---

## Testing Authentication

### Login Test
```bash
curl -X POST http://localhost:3000/api/pg-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_mgr",
    "password": "SecurePassword123!"
  }'
```

### Use Token in Next Request
```bash
TOKEN="<token-from-login-response>"

curl -X GET http://localhost:3000/api/pg-auth/1/staff/1/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Postman Configuration

### 1. Create Environment Variable
- Environment name: "PG Auth"
- Variable: `token` (empty initially)

### 2. Login Request
- Method: POST
- URL: `http://localhost:3000/api/pg-auth/login`
- Body (JSON):
```json
{
  "username": "alice_mgr",
  "password": "SecurePassword123!"
}
```
- Tests tab:
```javascript
if (pm.response.code === 200) {
  pm.environment.set("token", pm.response.json().token);
}
```

### 3. Authenticated Requests
- Add to Headers:
  - Key: `Authorization`
  - Value: `Bearer {{token}}`

---

## Troubleshooting

### Issue: "Invalid token" Error
**Solution**: Token may be expired. Login again to get a new token.

### Issue: "You do not have access to this PG"
**Solution**: Ensure the pgId in URL matches the staff member's pgId.

### Issue: Token not being sent
**Solution**: Check Authorization header format: `Bearer <token>` (with space)

### Issue: Password change fails
**Solution**: Ensure new password is at least 8 characters and matches confirmation

---

## Session Management

### Client-side Storage

**Option 1: localStorage (Persists until cleared)**
```javascript
localStorage.setItem('authToken', token);
const token = localStorage.getItem('authToken');
localStorage.removeItem('authToken'); // logout
```

**Option 2: sessionStorage (Clears on browser close)**
```javascript
sessionStorage.setItem('authToken', token);
```

**Option 3: Memory (Lost on page refresh)**
```javascript
let authToken = null;
authToken = token;
```

### Recommended: httpOnly Cookies

For maximum security, use httpOnly cookies set by the backend:

**Backend (Express):**
```typescript
res.cookie('authToken', token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});
```

---

## Next Steps

1. Implement password reset via email
2. Add two-factor authentication
3. Implement token refresh endpoints
4. Add role-based route protection
5. Add audit logging for login attempts
6. Implement session timeout warnings

---

## Support

For authentication issues:
1. Verify JWT_SECRET is set in .env
2. Check token format in Authorization header
3. Use Postman to test endpoints
4. Check server logs for errors
5. Verify token hasn't expired (24 hours)
