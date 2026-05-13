# MajiFix API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "techuser",
  "password": "securepassword",
  "email": "tech@example.com",
  "role": "technician"
}

Response: 201
{
  "message": "User registered",
  "userId": 1
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "techuser",
  "password": "securepassword"
}

Response: 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "techuser",
    "role": "technician"
  }
}
```

---

## Water Points Endpoints

### List All Water Points
```
GET /water-points
Authorization: Bearer <token>

Response: 200
[
  {
    "id": 1,
    "name": "Korogwe Borehole",
    "district": "Tanga",
    "village": "Korogwe",
    "latitude": -4.6667,
    "longitude": 37.6667,
    "install_date": "2020-01-15",
    "water_source_type": "borehole",
    "status": "working",
    "managing_org": "UNICEF",
    "created_at": "2024-05-14T10:30:00Z"
  },
  ...
]
```

### Get Single Water Point
```
GET /water-points/:id
Authorization: Bearer <token>

Response: 200
{
  "id": 1,
  "name": "Korogwe Borehole",
  ...
}
```

### Create Water Point
```
POST /water-points
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Borehole",
  "district": "Tanga",
  "village": "Korogwe",
  "latitude": -4.6667,
  "longitude": 37.6667,
  "install_date": "2024-05-14",
  "water_source_type": "borehole",
  "status": "working",
  "managing_org": "NGO Name"
}

Response: 201
{
  "id": 2,
  "name": "New Borehole",
  ...
}
```

### Update Water Point
```
PUT /water-points/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "maintenance"
}

Response: 200
{
  "id": 1,
  "status": "maintenance",
  ...
}
```

### Delete Water Point
```
DELETE /water-points/:id
Authorization: Bearer <token>

Response: 200
{
  "message": "Water point deleted"
}
```

---

## Fault Reports Endpoints

### List All Faults
```
GET /fault-reports
Authorization: Bearer <token>

Response: 200
[
  {
    "id": 1,
    "water_point_id": 1,
    "issue_type": "low_pressure",
    "description": "Water pressure very low",
    "image_url": null,
    "reported_by": 2,
    "timestamp": "2024-05-14T08:00:00Z"
  },
  ...
]
```

### Create Fault Report
```
POST /fault-reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "water_point_id": 1,
  "issue_type": "no_water",
  "description": "No water coming out",
  "image_url": "https://example.com/image.jpg"
}

Response: 201
{
  "id": 2,
  "water_point_id": 1,
  "issue_type": "no_water",
  ...
}
```

### Issue Types
- `no_water`
- `low_pressure`
- `broken_pump`
- `leakage`
- `contamination`
- `vandalism`

---

## Assignments Endpoints

### List All Assignments
```
GET /assignments
Authorization: Bearer <token>

Response: 200
[
  {
    "id": 1,
    "fault_report_id": 1,
    "technician_id": 3,
    "status": "in_progress",
    "priority": "high",
    "assigned_date": "2024-05-14T10:00:00Z",
    "issue_type": "low_pressure",
    "description": "Water pressure very low",
    "water_point_name": "Korogwe Borehole",
    "technician_name": "tech1"
  },
  ...
]
```

### Create Assignment
```
POST /assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "fault_report_id": 1,
  "technician_id": 3,
  "priority": "high"
}

Response: 201
{
  "id": 2,
  "fault_report_id": 1,
  "technician_id": 3,
  ...
}
```

### Update Assignment Status
```
PUT /assignments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed"
}

Response: 200
{
  "id": 1,
  "status": "completed",
  ...
}
```

### Status Values
- `pending` - Just created
- `assigned` - Technician assigned
- `in_progress` - Work started
- `completed` - Work finished
- `escalated` - Needs higher level help

---

## Repairs Endpoints

### List All Repairs
```
GET /repairs
Authorization: Bearer <token>

Response: 200
[
  {
    "id": 1,
    "assignment_id": 1,
    "repair_date": "2024-05-14T15:30:00Z",
    "notes": "Replaced pump valve",
    "cost": 50.00,
    "technician_id": 3,
    "water_point_name": "Korogwe Borehole",
    "technician_name": "tech1"
  },
  ...
]
```

### Log Repair
```
POST /repairs
Authorization: Bearer <token>
Content-Type: application/json

{
  "assignment_id": 1,
  "notes": "Replaced pump valve and cleaned filter",
  "cost": 75.50
}

Response: 201
{
  "id": 2,
  "assignment_id": 1,
  "repair_date": "2024-05-14T16:00:00Z",
  ...
}
```

---

## Analytics Endpoints

### Get Statistics
```
GET /analytics
Authorization: Bearer <token>

Response: 200
{
  "waterPoints": 5,
  "working": 4,
  "broken": 1,
  "faults": 3,
  "assignments": 2,
  "completed": 1
}
```

---

## Notifications Endpoints

### List User Notifications
```
GET /notifications
Authorization: Bearer <token>

Response: 200
[
  {
    "id": 1,
    "user_id": 3,
    "message": "New assignment: Low pressure at Korogwe",
    "type": "assignment",
    "is_read": false,
    "created_at": "2024-05-14T10:00:00Z"
  },
  ...
]
```

### Mark as Read
```
PUT /notifications/:id/read
Authorization: Bearer <token>

Response: 200
{
  "message": "Notification marked as read"
}
```

### Create Notification
```
POST /notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 3,
  "message": "New fault reported at Korogwe",
  "type": "fault"
}

Response: 201
{
  "id": 2,
  "user_id": 3,
  ...
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "Water point not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database connection failed"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "role": "technician"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Get Water Points (with token)
```bash
curl -X GET http://localhost:5000/api/water-points \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Rate Limiting
Currently no rate limiting. For production, implement:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```