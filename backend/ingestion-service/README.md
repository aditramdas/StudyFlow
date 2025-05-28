# StudyFlow Ingestion Service

The ingestion service is responsible for handling document uploads, validation, and processing in the StudyFlow platform.

## Features

- Document upload with validation
- File type and size restrictions
- Document processing status tracking
- Integration with RabbitMQ for async processing
- PostgreSQL database integration
- JWT-based authentication

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- RabbitMQ
- Redis (optional, for caching)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:

   ```env
   # Server Configuration
   INGESTION_PORT=3002
   NODE_ENV=development

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173

   # JWT Configuration
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=1d

   # File Upload Configuration
   UPLOAD_DIR=uploads

   # RabbitMQ Configuration
   RABBITMQ_URL=amqp://localhost:5672

   # Database Configuration
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/studiflow
   ```

3. Create the uploads directory:

   ```bash
   mkdir uploads
   ```

4. Build the project:

   ```bash
   npm run build
   ```

5. Start the service:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check

- `GET /health`
  - Returns service health status

### Document Upload

- `POST /api/documents/upload`
  - Upload a document for processing
  - Requires authentication
  - Accepts multipart/form-data with 'document' field

### Document Status

- `GET /api/documents/status/:documentId`
  - Get the processing status of a document
  - Requires authentication

## Development

1. Start in development mode:

   ```bash
   npm run dev
   ```

2. Run tests:

   ```bash
   npm test
   ```

3. Lint code:
   ```bash
   npm run lint
   ```

## Architecture

The service follows a layered architecture:

1. Routes: Handle HTTP requests and responses
2. Controllers: Process requests and manage business logic
3. Services: Implement core business logic
4. Models: Define data structures and database interactions
5. Middleware: Handle cross-cutting concerns (auth, validation, etc.)

## Error Handling

The service implements centralized error handling with appropriate HTTP status codes and error messages. All errors are logged for debugging purposes.

## Security

- JWT-based authentication
- File type validation
- File size limits
- CORS protection
- Helmet security headers
