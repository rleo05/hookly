<h1 align="center">Hookly</h1>

A self-hosted webhook delivery platform with reliable message fanout, retry mechanisms, and delivery guarantees.

## Overview

Hookly is an infrastructure service for sending webhooks to multiple endpoints reliably. It handles the complexity of webhook delivery including:

- **Fan-out delivery**: Dispatch events to multiple endpoints simultaneously
- **Automatic retries**: Exponential backoff with configurable retry limits
- **Dead letter queues**: Capture failed deliveries for investigation
- **Idempotency**: Prevent duplicate event processing
- **Payload signing**: HMAC-SHA256 signatures for webhook verification
- **Private IP blocking**: Security protection against SSRF attacks

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│   API       │────────▶│  RabbitMQ        │────────▶│  Fanout Worker      │
│  (Fastify)  │         │  (Message Queue) │         │  (Event Routing)    │
└─────────────┘         └──────────────────┘         └──────────┬──────────┘
                                                                │
                                                                ▼
┌─────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│  PostgreSQL │◀────────│  Redis           │◀────────│  Dispatch Worker    │
│  (Storage)  │         │  (Cache)         │         │  (HTTP Delivery)    │
└─────────────┘         └──────────────────┘         └─────────────────────┘
```

### Data Flow

1. **Event Ingestion**: API receives events and publishes to `webhook.fanout.queue`
2. **Fan-out**: Fanout worker looks up subscribed endpoints and creates `EventAttempt` records
3. **Dispatch**: Each attempt is published to `webhook.dispatch.queue`
4. **Delivery**: Dispatch worker sends HTTP requests with signed payloads
5. **Retry**: Failed deliveries are re-queued with exponential backoff (15s base, up to 5 retries)
6. **DLQ**: Exhausted retries are sent to dead letter queues for manual inspection

## Project Structure

```
├── apps/
│   ├── api/                      # REST API (Fastify)
│   │   └── src/modules/          # Domain modules
│   │       ├── application/      # Application management
│   │       ├── endpoint/         # Webhook endpoints
│   │       ├── event/            # Events and event types
│   │       ├── api-key/          # API key authentication
│   │       └── auth/             # OAuth authentication
│   ├── web/                      # Frontend (Next.js)
│   ├── webhook-fanout-worker/    # Event routing worker
│   └── webhook-dispatch-worker/  # HTTP delivery worker
├── packages/
│   ├── database/                 # Prisma ORM and schema
│   ├── cache/                    # Redis client
│   ├── env/                      # Environment validation (Zod)
│   └── queue/                    # RabbitMQ producers/consumers
├── docker-compose.yml            # Infrastructure services
└── turbo.json                    # Monorepo build config
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| API Framework | Fastify 5 |
| Validation | Zod |
| Authentication | Better Auth (Google OAuth) |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Message Queue | RabbitMQ |
| HTTP Client | Undici |
| Build System | Turborepo |
| Runtime | Node.js 22+ |

## Prerequisites

- Node.js 22+
- npm 10+
- Docker and Docker Compose

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd hookly

# Install dependencies
npm install

# Start infrastructure services
docker compose up -d

# Generate Prisma client
npm run build -w @hookly/database

# Run database migrations
npm run db:push -w @hookly/database
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=8080
APP_ENV=dev
APP_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://root:root@localhost:5432/hookly

# Authentication
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
BETTER_AUTH_SECRET=<random-secret>
API_KEY_SECRET=<random-secret>

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://root:root1234@localhost:5672
RABBITMQ_USERNAME=root
RABBITMQ_PASSWORD=root1234
```

## Running Locally

```bash
# Start all services in development mode
npm run dev

# Or start individual services
npm run dev -w api
npm run dev -w web
npm run dev -w webhook-fanout-worker
npm run dev -w webhook-dispatch-worker
```

## API Endpoints

All API endpoints require authentication via API key header: `X-API-Key: <key>`

### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/application` | List applications |
| GET | `/application/:uid` | Get application by UID |
| POST | `/application` | Create application |
| PUT | `/application/:uid` | Update application |
| DELETE | `/application/:uid` | Delete application |

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/endpoint?applicationUid=...` | List endpoints |
| GET | `/endpoint/:uid?applicationUid=...` | Get endpoint by UID |
| POST | `/endpoint?applicationUid=...` | Create endpoint |
| PUT | `/endpoint/:uid?applicationUid=...` | Update endpoint |
| DELETE | `/endpoint/:uid?applicationUid=...` | Delete endpoint |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/event?applicationUid=...` | List events |
| GET | `/event/:uid` | Get event by UID |
| POST | `/event` | Create and dispatch event |

### Event Types

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/event-type?applicationUid=...` | List event types |
| GET | `/event-type/:name?applicationUid=...` | Get event type |
| POST | `/event-type?applicationUid=...` | Create event type |
| PUT | `/event-type/:name?applicationUid=...` | Update event type |

### Example: Creating and Sending an Event

```bash
# Create an event
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -H "Idempotency-Key: unique-key-123" \
  -d '{
    "applicationUid": "app_abc123",
    "eventType": "order.created",
    "payload": {
      "orderId": "12345",
      "amount": 99.99
    }
  }'
```

## Webhook Signature Verification

Hookly signs all webhook payloads using HMAC-SHA256. The signature is sent in the `X-Signature` header.

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

## Build & Type Check

```bash
# Build all packages
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Lint with auto-fix
npm run fix
```

## Queue Configuration

### Queues

| Queue | Purpose |
|-------|---------|
| `webhook.fanout.queue` | Event routing to endpoints |
| `webhook.fanout.retry` | Fanout retry with delay |
| `webhook.fanout.dlq` | Failed fanout messages |
| `webhook.dispatch.queue` | HTTP delivery jobs |
| `webhook.dispatch.retry` | Dispatch retry with delay |
| `webhook.dispatch.dlq` | Failed dispatch messages |

### Retry Strategy

- **Max retries**: 5
- **Base delay**: 15 seconds
- **Backoff**: Exponential (15s, 30s, 60s, 120s, 240s)
- **Retryable status codes**: 408, 429, 5xx

## Security Considerations

- **Private IP blocking**: The dispatch worker validates that webhook URLs resolve to public IPs only, preventing SSRF attacks to internal networks
- **HMAC signatures**: All payloads are signed with per-endpoint secrets
- **API key authentication**: All API endpoints require valid API keys
- **OAuth integration**: User authentication via Google OAuth

## Database Schema

### Core Models

- **Application**: Tenant container for organizing webhooks
- **Endpoint**: Webhook destination with URL, method, headers, and secret
- **EventType**: Named event categories per application
- **EndpointRouting**: Many-to-many mapping of endpoints to event types
- **Event**: Incoming event with payload
- **EventAttempt**: Delivery attempt record with status tracking


## Monitoring

- RabbitMQ Management UI: http://localhost:15672 (default: root/root1234)
- Check DLQ for failed messages requiring investigation
- Monitor `EventAttempt` table for delivery statistics

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
