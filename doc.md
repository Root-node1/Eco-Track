# 🌱 EcoTrack Node.js API Documentation

## 📌 Overview

EcoTrack is a carbon footprint tracking platform where users log daily activities (transport, electricity, food) and receive:

* Carbon footprint scores
* Community comparisons
* Personalized recommendations
* Chatbot assistance

---

## 🌍 Base URL

| Environment | URL                                      |
| ----------- | ---------------------------------------- |
| Development | `http://localhost:5000/api`              |
| Production  | `https://ecotrack-node.onrender.com/api` |

---

## 🔐 Authentication

Most endpoints require a JWT token.

Include in headers:

```http
Authorization: Bearer {token}
```

---

# 🚀 Quick Start

1. **Register**
2. **Login**
3. **Copy Token**
4. **Use Token in Protected Routes**

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name":"John Doe","email":"john@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"john@example.com","password":"123456"}'
```

---

# 📡 API Endpoints

---

## 🩺 1. Health Check

### GET `/health`

* Auth: ❌ None

### ✅ Response

```json
{
  "status": "ok",
  "message": "EcoTrack server running",
  "timestamp": "2026-06-18T18:30:00.000Z"
}
```

---

## 🔑 2. Authentication Routes

### POST `/auth/register`

* Auth: ❌ None

#### 📥 Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "location": "Nairobi"
}
```

#### 📤 Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "u123",
      "name": "John Doe",
      "email": "john@example.com",
      "location": "Nairobi",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

---

### POST `/auth/login`

#### 📥 Body

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

#### 📤 Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "u123",
      "name": "John Doe",
      "email": "john@example.com",
      "location": "Nairobi",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

---

### GET `/auth/me`

* Auth: ✅ Required

#### 📤 Response

```json
{
  "success": true,
  "data": {
    "_id": "u123",
    "name": "John Doe",
    "email": "john@example.com",
    "location": "Nairobi",
    "role": "user"
  }
}
```

---

## 🚗 3. Activity Routes

### POST `/log`

* Auth: ✅ Required

#### 📥 Body

```json
{
  "transportType": "car",
  "distanceKm": 10,
  "electricityKwh": 5,
  "foodType": "meat"
}
```

#### 📤 Response

```json
{
  "success": true,
  "data": {
    "id": "log123",
    "score": 12.5,
    "breakdown": {
      "transport": 8.0,
      "electricity": 2.5,
      "food": 2.0
    },
    "createdAt": "2026-06-18T18:30:00.000Z"
  }
}
```

---

### GET `/stats`

* Auth: ✅ Required

#### 📤 Response

```json
{
  "success": true,
  "data": {
    "userScore": 10.2,
    "communityAverage": 14.5,
    "breakdown": {
      "transport": 5.0,
      "electricity": 3.0,
      "food": 2.2
    },
    "totalActivities": 25,
    "period": "weekly"
  }
}
```

---

## 🌦️ 4. Climate Route

### GET `/climate`

* Auth: ❌ None

#### 🔍 Query Params

| Param | Default   |
| ----- | --------- |
| lat   | -1.286389 |
| lon   | 36.817223 |

#### 📤 Response

```json
{
  "success": true,
  "data": {
    "location": {
      "city": "Nairobi",
      "country": "Kenya",
      "lat": -1.286389,
      "lon": 36.817223
    },
    "weather": {
      "temperature": 24,
      "condition": "Cloudy",
      "humidity": 65,
      "windSpeed": 10,
      "timestamp": "2026-06-18T18:30:00.000Z"
    },
    "carbonContext": {
      "message": "Cool weather reduces electricity usage.",
      "seasonalFactor": 0.9
    }
  }
}
```

---

## 4. POST /api/auth/register

### Purpose

Create a new user account and receive JWT tokens

### Request

```json id="req4"
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

> `email` is optional; `password` must be at least 8 characters

### Response (201)

```json id="res4"
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

---

## 5. POST /api/auth/login

### Purpose

Authenticate and receive JWT tokens

### Request

```json id="req5"
{
  "username": "johndoe",
  "password": "securepass123"
}
```

### Response (200)

```json id="res5"
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Error (401)

```json id="err5"
{
  "detail": "Invalid credentials"
}
```

---

## 6. POST /api/auth/refresh

### Purpose

Obtain a new access token using a valid refresh token

### Request

```json id="req6"
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Response (200)

```json id="res6"
{
  "access": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 7. POST /api/auth/logout

### Purpose

Blacklist a refresh token to prevent further use

### Request

```json id="req7"
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Response (200)

```json id="res7"
{
  "detail": "Logged out successfully"
}
```

> Requires authentication via `Authorization: Bearer <access_token>` header

---

## 8. /api/profile

### Purpose

Retrieve, update, or delete the authenticated user's profile

### Auth

All methods require `Authorization: Bearer <access_token>` header.

---

### 8a. GET /api/profile

#### Response (200)

```json id="res8a"
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "avatar": null,
  "bio": "",
  "location": "",
  "created_at": "2026-06-18T10:00:00Z",
  "updated_at": "2026-06-18T10:00:00Z"
}
```

---

### 8b. PUT /api/profile

Full update of profile fields.

#### Request

```json id="req8b"
{
  "bio": "Eco-warrior from Nairobi",
  "location": "Nairobi"
}
```

#### Response (200)

Same shape as GET /api/profile.

---

### 8c. PATCH /api/profile

Partial update — only send the fields to change.

#### Request

```json id="req8c"
{
  "location": "Mombasa"
}
```

#### Response (200)

Same shape as GET /api/profile.

---

### 8d. DELETE /api/profile

Permanently delete the user account and all associated data.

#### Response (204)

*No body*

---

#  Monorepo Structure

### POST `/chatbot/message`

* Auth: ❌ None

#### 📥 Body

```json
{
  "message": "How can I reduce carbon?",
  "userId": "u123"
}
```

#### 📤 Response

```json
{
  "success": true,
  "data": {
    "userMessage": "How can I reduce carbon?",
    "botResponse": "Try using public transport and reducing meat consumption.",
    "timestamp": "2026-06-18T18:30:00.000Z"
  }
}
```

#### 💡 Supported Keywords

`carbon, transport, electricity, food, hello, hi, help, tip, thanks, bye`

---

### GET `/chatbot/history/:userId`

#### 📤 Response

```json
{
  "success": true,
  "data": [
    {
      "userId": "u123",
      "userMessage": "Hello",
      "botResponse": "Hi! How can I help?",
      "timestamp": "2026-06-18T18:00:00.000Z"
    }
  ]
}
```

---

## 💡 6. Recommendations Route

### GET `/recommendations/:userId`

* Auth: ✅ Required

#### 📤 Response

```json
{
  "success": true,
  "data": {
    "recommendations": [
      "Use public transport more often",
      "Reduce electricity usage at night",
      "Switch to a plant-based diet twice a week"
    ],
    "summary": {
      "avgTransport": 6.5,
      "avgElectricity": 3.2,
      "avgFood": 2.1
    }
  }
}
```

---

# ❌ Error Responses

| Status | Response                                                   |
| ------ | ---------------------------------------------------------- |
| 400    | `{ "success": false, "error": "Message" }`                 |
| 401    | `{ "success": false, "error": "Authentication required" }` |
| 404    | `{ "success": false, "error": "Route not found" }`         |
| 500    | `{ "success": false, "error": "Internal server error" }`   |

---

# 🧪 Testing with cURL

```bash
# Get stats
curl -X GET http://localhost:5000/api/stats \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

# 📬 Postman Setup

```json id="postman1"
{
  "info": {
    "name": "EcoTrack API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Log Activity",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/log",
        "body": {
          "mode": "raw",
          "raw": "{ \"transportType\": \"car\", \"distanceKm\": 10 }"
        }
      }
    },
    {
      "name": "Get Stats",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/stats"
      }
    },
    {
      "name": "Get Climate",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/climate?lat=-1.286389&lon=36.817223"
      }
    },
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{ \"username\": \"johndoe\", \"email\": \"john@example.com\", \"password\": \"securepass123\" }"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{ \"username\": \"johndoe\", \"password\": \"securepass123\" }"
        }
      }
    },
    {
      "name": "Refresh Token",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/refresh",
        "body": {
          "mode": "raw",
          "raw": "{ \"refresh\": \"...\" }"
        }
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/logout",
        "body": {
          "mode": "raw",
          "raw": "{ \"refresh\": \"...\" }"
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/profile"
      }
    },
    {
      "name": "Update Profile",
      "request": {
        "method": "PUT",
        "url": "{{baseUrl}}/profile",
        "body": {
          "mode": "raw",
          "raw": "{ \"bio\": \"Eco-warrior\", \"location\": \"Nairobi\" }"
        }
      }
    },
    {
      "name": "Delete Profile",
      "request": {
        "method": "DELETE",
        "url": "{{baseUrl}}/profile"
      }
    }
  ]
}
```

---

# ⚛️ Frontend Integration (React / Vite)

```javascript
const API_URL = import.meta.env.VITE_API_URL;

export const getStats = async (token) => {
  const res = await fetch(`${API_URL}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};
```

---

# 🌱 Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 🔄 API Flow

| Version | Date       | Changes                |
| ------- | ---------- | ---------------------- |
| v0.1.0  | 2026-06-16 | Initial practice setup |
| v0.2.0  | 2026-06-18 | Add auth + user profile |
| v0.3.0  | TBD        | Add leaderboard        |

---

# 📝 Changelog

## v1.0.0

* Initial release
* Authentication system
* Activity logging
* Stats & recommendations
* Climate endpoint
* Chatbot integration

---

## 👨‍💻 Maintainers

Backend: Winstone
Frontend: Del & Lenny

---

**EcoTrack API — Build sustainable habits 🌍**
