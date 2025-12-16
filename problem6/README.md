# Live Scoreboard API Service Specification

## Overview

This document specifies the architecture and implementation requirements for a live scoreboard system that displays the top 10 users' scores with real-time updates. The system prevents malicious score updates through proper authentication and authorization mechanisms using Firebase.

## System Architecture

### Components

1. **Frontend Website**: Displays the top 10 leaderboard with real-time updates
2. **Backend API Server**: Handles score updates and authentication
3. **Firebase Backend**:
   - Firestore for data persistence
   - Authentication for user management
   - Security rules for data protection

### Data Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │   Frontend   │    │  Backend    │    │  Firebase   │
│  Action     │───▶│   Website    │───▶│   API       │───▶│ Database    │
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
                           │                   │                   │
                           │                   │                   │
                           ▼                   ▼                   ▼
                    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
                    │  Firebase    │    │  Auth &     │    │  Security   │
                    │  Real-time   │    │ Validation  │    │  Rules      │
                    │  Listeners   │    │             │    │             │
                    └──────────────┘    └─────────────┘    └─────────────┘
```

## Firebase Data Model

### Collections

#### Users Collection

```
users/{userId}
{
  id: string,
  email: string,
  displayName: string,
  score: number,
  lastActionCompleted: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Score History Collection

```
scoreHistory/{historyId}
{
  userId: string,
  previousScore: number,
  newScore: number,
  actionType: string,
  timestamp: timestamp,
  ipAddress: string,
  userAgent: string
}
```

#### Leaderboard Cache Collection

```
leaderboard/top10
{
  users: [
    {
      userId: string,
      displayName: string,
      score: number,
      rank: number
    }
  ],
  lastUpdated: timestamp
}
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "PlayerName"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "displayName": "PlayerName",
      "score": 0,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST /api/auth/login

Authenticate user and return JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "displayName": "PlayerName",
      "score": 150,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Score Endpoints

#### POST /api/scores/update

Update user score after completing a valid action.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "actionType": "quest_completed",
  "scoreIncrement": 10,
  "metadata": {
    "questId": "quest_123",
    "difficulty": "hard"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Score updated successfully",
  "data": {
    "newScore": 160,
    "previousScore": 150,
    "rank": 5,
    "leaderboardPosition": 5
  }
}
```

#### GET /api/leaderboard

Get the current top 10 leaderboard.

**Query Parameters:**

- `limit` (optional): Number of top scores to return (default: 10)
- `includeUserRank` (optional): Include current user's rank if authenticated

**Response:**

```json
{
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "user_1",
        "displayName": "TopPlayer",
        "score": 1000
      },
      {
        "rank": 2,
        "userId": "user_2",
        "displayName": "SecondPlayer",
        "score": 950
      }
    ],
    "userRank": 5,
    "lastUpdated": "2023-01-01T12:00:00.000Z"
  }
}
```

### Firebase Real-time Updates

#### Real-time Database Listeners

Real-time leaderboard updates using Firebase's native real-time capabilities.

**Frontend Implementation:**

```javascript
// Set up real-time listener for leaderboard updates
const leaderboardRef = firebase.database().ref("leaderboard/top10");

leaderboardRef.on("value", (snapshot) => {
  const leaderboardData = snapshot.val();
  updateLeaderboardUI(leaderboardData);
});

// Set up real-time listener for specific user score changes
const userScoreRef = firebase.database().ref(`users/${userId}/score`);

userScoreRef.on("value", (snapshot) => {
  const newScore = snapshot.val();
  updateUserScoreUI(newScore);
});
```

**Data Structure for Real-time Updates:**

```json
// Real-time leaderboard data structure
{
  "users": [
    {
      "rank": 1,
      "userId": "user_1",
      "displayName": "TopPlayer",
      "score": 1000
    }
  ],
  "lastUpdated": "2023-01-01T12:00:00.000Z"
}
```

## Security Implementation

### Authentication & Authorization

1. **JWT Token Validation**

   - All score update requests must include valid JWT token
   - Tokens expire after 24 hours
   - Token contains user ID and permissions

2. **Rate Limiting**

   - Maximum 5 score updates per minute per user
   - Maximum 100 score updates per hour per user
   - IP-based rate limiting for anonymous requests

3. **Score Validation**
   - Maximum score increment per action: 100 points
   - Minimum time between score updates: 2 seconds
   - Suspicious patterns trigger alerts

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Score history is append-only for authenticated users
    match /scoreHistory/{docId} {
      allow create: if request.auth != null
        && request.auth.uid == resource.data.userId
        && request.resource.data.diff(resource.data).affectedKeys().hasAll(['newScore', 'timestamp']);
      allow read: if request.auth != null;
    }

    // Leaderboard is readable by all, writable only by server
    match /leaderboard/{docId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Anti-Cheat Measures

1. **Server-Side Validation**

   - Verify action legitimacy before score updates
   - Validate score increments based on action type
   - Check for impossible score progression patterns

2. **Anomaly Detection**

   - Monitor for rapid score increases
   - Detect unusual timing patterns
   - Flag suspicious IP addresses

3. **Audit Trail**
   - Log all score changes with metadata
   - Store IP addresses and user agents
   - Maintain immutable history for forensic analysis

## Implementation Recommendations

### Backend Architecture

1. **Express.js Server Structure**

```
src/
├── index.ts                 # Main server entry point
├── config/
│   ├── firebase.ts          # Firebase configuration
│   └── realtime.ts          # Firebase real-time setup
├── middleware/
│   ├── auth.ts              # JWT authentication
│   ├── rateLimit.ts         # Rate limiting
│   └── validation.ts       # Input validation
├── routes/
│   ├── auth.ts              # Authentication endpoints
│   ├── scores.ts            # Score management endpoints
│   └── leaderboard.ts      # Leaderboard endpoints
├── services/
│   ├── scoreService.ts      # Score business logic
│   ├── leaderboardService.ts # Leaderboard management
│   └── antiCheatService.ts # Anti-cheat validation
├── models/
│   ├── User.ts              # User data model
│   └── ScoreHistory.ts      # Score history model
└── utils/
    ├── validation.ts        # Input validation utilities
    └── logging.ts          # Logging utilities
```

2. **Real-time Updates Implementation**

   - Use Firebase Real-time Database for live leaderboard updates
   - Implement Firebase listeners for automatic data synchronization
   - Add offline support and automatic reconnection handling

3. **Performance Optimizations**
   - Cache leaderboard in memory with 5-second TTL
   - Use Firestore composite queries for efficient data retrieval
   - Implement database indexing for score queries

### Frontend Integration

1. **Firebase Real-time Client**

```javascript
import React, { useState, useEffect, useRef } from "react";

const LiveScoreboard = ({ firebaseApp, userId }) => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [userScore, setUserScore] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const databaseRef = useRef(null);
  const leaderboardRef = useRef(null);
  const userScoreRef = useRef(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!firebaseApp) return;

    // Initialize Firebase database reference
    databaseRef.current = firebase.database(firebaseApp);

    // Set up real-time listeners
    setupRealtimeListeners();

    // Cleanup function to remove listeners when component unmounts
    return () => {
      cleanupListeners();
    };
  }, [firebaseApp, userId]);

  const setupRealtimeListeners = () => {
    // Listen for leaderboard changes
    leaderboardRef.current = databaseRef.current.ref("leaderboard/top10");
    leaderboardRef.current.on("value", (snapshot) => {
      const data = snapshot.val();
      setLeaderboardData(data);
    });

    // Listen for user-specific score changes if userId is provided
    if (userId) {
      userScoreRef.current = databaseRef.current.ref(`users/${userId}/score`);
      userScoreRef.current.on("value", (snapshot) => {
        const score = snapshot.val();
        setUserScore(score);
      });
    }

    // Handle connection state
    connectionRef.current = databaseRef.current.ref(".info/connected");
    connectionRef.current.on("value", (snapshot) => {
      if (snapshot.val() === true) {
        console.log("Connected to Firebase");
        setConnectionStatus("Connected");
      } else {
        console.log("Disconnected from Firebase");
        setConnectionStatus("Disconnected - Reconnecting...");
      }
    });
  };

  const cleanupListeners = () => {
    if (leaderboardRef.current) {
      leaderboardRef.current.off();
    }
    if (userScoreRef.current) {
      userScoreRef.current.off();
    }
    if (connectionRef.current) {
      connectionRef.current.off();
    }
  };

  const renderLeaderboard = (users) => {
    if (!users || users.length === 0) {
      return <div>No leaderboard data available</div>;
    }

    return (
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td>{user.rank}</td>
              <td>{user.displayName}</td>
              <td>{user.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="live-scoreboard">
      <div className="connection-status">Status: {connectionStatus}</div>

      <div className="leaderboard-container">
        <h2>Live Leaderboard</h2>
        {leaderboardData
          ? renderLeaderboard(leaderboardData.users)
          : "Loading leaderboard..."}
      </div>

      {userScore !== null && (
        <div className="user-score">Your Score: {userScore}</div>
      )}
    </div>
  );
};

export default LiveScoreboard;
```

2. **Score Update Flow**

```javascript
async function completeAction(actionType, scoreIncrement) {
  try {
    const response = await fetch("/api/scores/update", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actionType,
        scoreIncrement,
        metadata: { timestamp: Date.now() },
      }),
    });

    const result = await response.json();
    if (result.success) {
      // Local UI update (optimistic)
      updateUserScore(result.data.newScore);
    }
  } catch (error) {
    console.error("Score update failed:", error);
    // Handle error gracefully
  }
}
```

## Deployment Considerations

### Environment Variables

```
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5
```

### Scaling Recommendations

1. **Database Optimization**

   - Implement sharding for high-traffic scenarios
   - Use Cloud Functions for leaderboard calculations
   - Consider Redis for session management

2. **Load Balancing**

   - Deploy multiple server instances behind load balancer
   - Firebase handles real-time connection scaling automatically
   - Use CDN for static assets

3. **Monitoring & Alerting**
   - Set up alerts for suspicious score patterns
   - Monitor Firebase real-time connection health
   - Track API response times and error rates

## Testing Strategy

### Unit Tests

- Score validation logic
- Authentication middleware
- Rate limiting functionality

### Integration Tests

- End-to-end score update flow
- Firebase real-time listener handling
- Firebase security rules

### Security Tests

- JWT token manipulation attempts
- Rate limiting bypass attempts
- Score injection attacks

### Performance Tests

- Load testing with concurrent users
- Firebase real-time connection limits
- Database query performance

## Conclusion

This specification provides a comprehensive foundation for implementing a secure, real-time leaderboard system. The key focus areas are:

1. **Security**: Robust authentication and anti-cheat mechanisms
2. **Performance**: Optimized data retrieval and real-time updates
3. **Scalability**: Architecture that supports growth
4. **Maintainability**: Clean code structure and comprehensive testing

The backend engineering team should use this specification as a guide while adapting implementation details to specific technical requirements and constraints.
