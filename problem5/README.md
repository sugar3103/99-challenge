# ExpressJS Backend with Firebase Firestore

A backend server built with ExpressJS, TypeScript, and Firebase Firestore that provides CRUD operations with JWT-based authentication.

## Features

- **User Authentication**: Register and login with JWT tokens
- **CRUD Operations**: Create, read, update, and delete resources
- **Firebase Firestore Integration**: Data persistence using Firebase Firestore
- **TypeScript**: Full TypeScript support with type safety
- **Authentication Middleware**: Protected routes with JWT verification
- **Error Handling**: Comprehensive error handling throughout the application

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore enabled

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. **Firebase Setup**:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Firestore Database
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Environment Variables**:

   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your Firebase credentials:

     ```env
     # Firebase Configuration
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
     FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
     FIREBASE_STORAGE_BUCKET=your-storage-bucket
     FIREBASE_AUTH_DOMAIN=your-auth-domain

     # JWT Configuration
     JWT_SECRET=your-super-secret-jwt-key-here
     JWT_EXPIRES_IN=7d

     # Server Configuration
     PORT=3000
     NODE_ENV=development
     ```

3. **Contact owner if you can't create Firebase project**:

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server

## API Endpoints

### Authentication

#### Register User

- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

#### Login User

- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Resources (All endpoints require authentication)

#### Create Resource

- **POST** `/api/resources`
- **Headers**: `Authorization: Bearer <your-jwt-token>`
- **Body**:
  ```json
  {
    "title": "Resource Title",
    "description": "Resource Description"
  }
  ```

#### Get All Resources

- **GET** `/api/resources`
- **Headers**: `Authorization: Bearer <your-jwt-token>`

#### Get Single Resource

- **GET** `/api/resources/:id`
- **Headers**: `Authorization: Bearer <your-jwt-token>`

#### Update Resource

- **PUT** `/api/resources/:id`
- **Headers**: `Authorization: Bearer <your-jwt-token>`
- **Body**:
  ```json
  {
    "title": "Updated Title",
    "description": "Updated Description"
  }
  ```

#### Delete Resource

- **DELETE** `/api/resources/:id`
- **Headers**: `Authorization: Bearer <your-jwt-token>`

### Health Check

#### Server Health

- **GET** `/health`
- Returns server status and timestamp

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (in development mode)"
}
```

## Development

1. Start the development server:

   ```bash
   npm run dev
   ```

2. The server will start on `http://localhost:3000`

3. Test the API using tools like Postman, curl, or any HTTP client

## Production Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- All resource endpoints are protected
- Users can only access their own resources
- Environment variables are used for sensitive configuration

## Error Handling

The application includes comprehensive error handling:

- Input validation errors return 400 status
- Authentication errors return 401/403 status
- Not found errors return 404 status
- Server errors return 500 status with detailed information in development

## Data Models

### User

```typescript
{
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Resource

```typescript
{
  id: string;
  title: string;
  description: string;
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
}
```

## License

ISC
