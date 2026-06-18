#  EcoTrack Documentation (Practice Project)

##  Overview

EcoTrack is a **community carbon footprint tracker** that allows users to log daily activities (transport, electricity, food) and compare their carbon impact against a community average.

>  This project is for **A weekly PRACTICE session** — not the final hackathon build.

---

#  Architecture

```id="arch1"
                  ┌──────────────────────┐
                  │     Frontend         │
                  │ React + Vite         │
                  │ (Del + Lenny)        │
                  └─────────┬────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
         ▼                                     ▼
┌──────────────────────┐             ┌──────────────────────┐
│ Backend A            │             │ Backend B            │
│ Django + PostgreSQL  │             │ Node + MongoDB       │
│ (Isaac)              │             │ (Winstone)           │
└──────────────────────┘             └──────────────────────┘
         │                                     │
         └──────────────┬──────────────────────┘
                        ▼
              IDENTICAL JSON RESPONSES
```

---

# Critical Rule

Both backends **MUST return IDENTICAL JSON shapes** for all endpoints.

This ensures:

* Frontend can switch between APIs seamlessly
* Integration testing remains consistent
* No breaking changes between implementations

---

#  Base URLs

| Backend    | URL                                      |
| ---------- | ---------------------------------------- |
| Django API | https://ecotrack-django.onrender.com/api |
| Node API   | https://ecotrack-node.onrender.com/api   |
| Frontend   | http://localhost:5173                    |

---

#  Data Flow

* User logs activity via frontend
* Frontend calls **either backend (A or B)**
* Backend:

  * Calculates carbon footprint
  * Stores activity
  * Returns standardized response
* Frontend:

  * Displays user score
  * Compares with community average

---

#  API Endpoints (IDENTICAL for BOTH Backends)

---

## 1. POST /api/log

### Purpose

Log a daily activity and calculate carbon footprint

### Request

```json id="req1"
{
  "transportType": "car",
  "distanceKm": 10,
  "electricityKwh": 5,
  "foodType": "meat"
}
```

> At least **one field is required**

---

### Response

```json id="res1"
{
  "success": true,
  "data": {
    "id": "act_123",
    "score": 12.5,
    "breakdown": {
      "transport": 6.0,
      "electricity": 3.5,
      "food": 3.0
    },
    "createdAt": "2026-06-16T10:00:00Z"
  }
}
```

---

## 2. GET /api/stats

### Purpose

Get carbon footprint statistics vs community average

### Response

```json id="res2"
{
  "success": true,
  "data": {
    "userScore": 75,
    "communityAverage": 68,
    "breakdown": {
      "transport": 40,
      "electricity": 20,
      "food": 15
    },
    "totalActivities": 25,
    "period": "7d"
  }
}
```

---

## 3. GET /api/climate

### Purpose

Fetch weather data + carbon context

### Query Params

* lat (default: -1.286389)
* lon (default: 36.817223)

---

### Response

```json id="res3"
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
      "humidity": 60,
      "windSpeed": 10,
      "timestamp": "2026-06-16T10:00:00Z"
    },
    "carbonContext": {
      "message": "Cool weather reduces energy usage",
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

```id="mono1"
ecotrack/
├── client/
├── server-django/
├── server-node/
└── tests/
```

---

# 🔧 Environment Variables

## Frontend (.env)

```env id="env1"
VITE_API_URL=https://ecotrack-node.onrender.com/api
```

---

## Django Backend (.env)

```env id="env2"
DATABASE_URL=postgresql://user:password@localhost:5432/ecotrack
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://ecotrack.vercel.app
```

---

## Node Backend (.env)

```env id="env3"
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecotrack
CORS_ORIGIN=http://localhost:5173,https://ecotrack.vercel.app
CARBON_FACTOR_TRANSPORT=0.6
CARBON_FACTOR_ELECTRICITY=0.7
CARBON_FACTOR_FOOD=0.5
```

---

#  CORS Configuration

## Node (Express)

```js id="cors1"
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ecotrack.vercel.app"
  ],
  credentials: true
}));
```

---

## Django

```python id="cors2"
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://ecotrack.vercel.app"
]
```

---

#  Postman Collection

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

#  Testing Strategy

* Backend A vs Backend B responses must match exactly
* Use:

  * Jest (Node)
  * Pytest (Django)
* Integration tests stored in `/tests`

---

#  Git Workflow

* `main` → production-ready
* Feature branches per developer
* PRs required for all merges
* Only Winstone merges PRs
* No self-merging

---

#  Changelog

| Version | Date       | Changes                |
| ------- | ---------- | ---------------------- |
| v0.1.0  | 2026-06-16 | Initial practice setup |
| v0.2.0  | 2026-06-18 | Add auth + user profile |
| v0.3.0  | TBD        | Add leaderboard        |

---

#  Sign-off

| Name     | Role               | Signature | Date   |
| -------- | ------------------ | --------- | ------ |
| Del      | Team Lead + UI     | ______    | ______ |
| Lenny    | State + Charts     | ______    | ______ |
| Isaac    | Django Backend     | ______    | ______ |
| Winstone | Node + Integration | ______    | ______ |
| Kigen    | DevOps + ML        | ______    | ______ |

---

#  Final Notes

* Both backends are **equal implementations**
* Frontend should work with either backend without changes
* Consistency > optimization for this practice
* Focus: **team coordination, API contracts, integration**

---

**End of Doc**
