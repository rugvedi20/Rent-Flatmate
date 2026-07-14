# API & Sockets Reference Documentation 🚀

This document outlines the REST API routes, payloads, responses, and Socket.IO events for the Rent & Flatmate Finder platform.

---

## 1. Authentication Endpoints

All auth routes are prefixed with `/api/auth`.

### Register User
* **Method**: `POST`
* **Endpoint**: `/api/auth/register`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "password": "password123",
  "role": "tenant" 
}
```
> Note: `role` must be one of `"tenant"`, `"owner"`, or `"admin"`.
* **Success Response (HTTP 201)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d5f15c72c1c61864a78c10",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "role": "tenant"
  }
}
```

### Login User
* **Method**: `POST`
* **Endpoint**: `/api/auth/login`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "email": "alex@example.com",
  "password": "password123"
}
```
* **Success Response (HTTP 200)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d5f15c72c1c61864a78c10",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "role": "tenant"
  }
}
```

---

## 2. Profile Endpoints

All profile routes are prefixed with `/api/profile`. Requests require an `Authorization: Bearer <JWT_TOKEN>` header.

### Fetch Public/Self Profile Details
* **Method**: `GET`
* **Endpoint**: `/api/profile/:userId`
* **Success Response (HTTP 200)**:
```json
{
  "user": {
    "_id": "60d5f15c72c1c61864a78c10",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "role": "tenant"
  },
  "profile": {
    "tenantId": "60d5f15c72c1c61864a78c10",
    "preferredLocation": "Baner, Pune",
    "budgetMin": 8000,
    "budgetMax": 15000,
    "moveInDate": "2026-08-01T00:00:00.000Z",
    "preferredRoomType": "single",
    "preferredFurnishing": "furnished",
    "bio": "Software engineer looking for a quiet place.",
    "phone": "+91 9999999999",
    "avatarUrl": "https://images.unsplash.com/...",
    "coverImageUrl": "https://images.unsplash.com/...",
    "locationCoords": {
      "type": "Point",
      "coordinates": [73.7898, 18.5597]
    }
  },
  "reviews": [],
  "reviewsStats": {
    "averageRating": 0,
    "totalReviews": 0
  }
}
```

### Save/Update Unified Profile Details
* **Method**: `POST`
* **Endpoint**: `/api/profile`
* **Request Body**:
```json
{
  "name": "Alex Mercer Updated",
  "phone": "+91 9999999999",
  "bio": "Quiet flatmate looking in Baner.",
  "preferredLocation": "Baner, Pune",
  "budgetMin": 9000,
  "budgetMax": 16000,
  "moveInDate": "2026-08-05",
  "preferredRoomType": "single",
  "preferredFurnishing": "furnished",
  "locationCoords": {
    "type": "Point",
    "coordinates": [73.7898, 18.5597]
  }
}
```
* **Success Response (HTTP 200)**: Returns the updated Profile object.

---

## 3. Listing Endpoints

All listing routes are prefixed with `/api/listings`.

### Browse & Search Listings (with Tenant Compatibility Ratings)
* **Method**: `GET`
* **Endpoint**: `/api/listings`
* **Query Parameters**:
  * `location` (string)
  * `minRent` (number)
  * `maxRent` (number)
  * `roomType` (string)
  * `furnishing` (string)
* **Success Response (HTTP 200)**:
```json
{
  "ranked": true,
  "listings": [
    {
      "listing": {
        "_id": "60d5f2fc72c1c61864a78c22",
        "title": "Spacious Room in Baner Gated Society",
        "rent": 12000,
        "location": "Baner, Pune",
        "roomType": "single",
        "furnishing": "furnished",
        "societyName": "Ganga Acropolis",
        "locationCoords": {
          "coordinates": [73.7898, 18.5597]
        }
      },
      "compatibility": {
        "score": 92,
        "badge": "Excellent",
        "explanation": "This property is only 0.4 km away from your preferred location and fits inside your budget.",
        "pros": ["Rent fits budget", "Commute under 1 km"],
        "cons": [],
        "summary": "Highly recommended match for commute convenience."
      }
    }
  ]
}
```

### Create Listing (Owner Only)
* **Method**: `POST`
* **Endpoint**: `/api/listings`
* **Request Body**:
```json
{
  "title": "Spacious Room in Baner",
  "location": "Baner, Pune",
  "rent": 12000,
  "availableFrom": "2026-08-01",
  "roomType": "single",
  "furnishing": "furnished",
  "description": "Quiet room in apartment.",
  "societyName": "Ganga Acropolis",
  "area": "Baner",
  "city": "Pune",
  "state": "Maharashtra",
  "pincode": "411045",
  "locationCoords": {
    "type": "Point",
    "coordinates": [73.7898, 18.5597]
  }
}
```
* **Success Response (HTTP 201)**: Returns the created listing object.

---

## 4. Landlord Review Endpoints

All review routes are prefixed with `/api/reviews`.

### Submit Landlord Review (Tenant Only)
* **Method**: `POST`
* **Endpoint**: `/api/reviews`
* **Request Body**:
```json
{
  "ownerId": "60d5f15c72c1c61864a78c15",
  "rating": 5,
  "reviewText": "Great landlord, very responsive and helpful."
}
```
* **Success Response (HTTP 201)**: Returns the populated review.

---

## 5. WebSockets Reference (Socket.IO)

Clients connect to the Socket.IO instance and join room channels for secure real-time messaging.

### Connection
Configure client auth handshakes:
```js
const socket = io("http://localhost:5000", {
  auth: {
    token: "YOUR_JWT_ACCESS_TOKEN"
  }
});
```

### Client Actions (emit)
* **`join_chat`**: Join room for a listing chat.
  ```json
  { "conversationId": "60d5f3ac72c1c61864a78c44" }
  ```
* **`send_message`**: Send chat string.
  ```json
  {
    "conversationId": "60d5f3ac72c1c61864a78c44",
    "message": "Hello! Is the room still available?"
  }
  ```

### Server Broadcasts (on)
* **`receive_message`**: Dispatched to room when a new message is saved.
  ```json
  {
    "_id": "60d5f3cf72c1c61864a78c48",
    "conversationId": "60d5f3ac72c1c61864a78c44",
    "senderId": "60d5f15c72c1c61864a78c10",
    "text": "Hello! Is the room still available?",
    "createdAt": "2026-07-14T10:02:40.000Z"
  }
  ```
