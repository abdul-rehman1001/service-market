# Servizo - Service Marketplace

## Project Overview

Servizo is a service marketplace application built with Next.js, TypeScript, Prisma, PostgreSQL, Firebase, and an AI-based service classification feature. The application connects service seekers with verified service providers and provides separate workflows for seekers, providers, and administrators.

The system allows users to register, verify their email, search for services, view providers, create bookings, chat after confirmed bookings, receive notifications, and submit reviews. Providers can manage their services, availability, documents, portfolio, booking requests, and dashboard. Administrators can manage users, categories, services, bookings, reviews, content, FAQs, user queries, and provider verification requests.

The project also includes an AI search module. Users can type a service related problem in natural language, and the system attempts to classify the query into a relevant service category using keyword matching and text embeddings.

## Problem Statement

Many local service booking processes are informal, slow, and difficult to trust. Customers often struggle to find verified service providers, compare options, check availability, and communicate with providers in one place. Service providers also need a structured platform to present their services, manage bookings, verify identity, and communicate with customers.

Servizo solves this problem by providing a centralized platform where seekers can find and book services, providers can manage their work, and administrators can monitor platform quality. The AI based search feature improves service discovery by allowing users to describe their problem instead of manually selecting a category.

## Objectives

- Provide a digital marketplace for local service discovery and booking.
- Allow service seekers to search, compare, book, chat, and review providers.
- Allow service providers to manage services, availability, documents, portfolio, and booking requests.
- Provide an admin panel for platform moderation, verification, analytics, and content management.
- Support secure authentication using JWT access tokens and refresh tokens.
- Store core business data in PostgreSQL using Prisma ORM.
- Use Firebase Firestore and Firebase Cloud Messaging for chat and push notifications.
- Use Cloudinary for image and document related uploads.
- Use Mapbox for location search and geocoding.
- Use AI based classification to map user queries to service categories.


## Key Features

### User and Authentication Features

- User registration for seekers and providers.
- Email verification flow.
- Secure login using hashed passwords.
- JWT based authentication using HTTP-only cookies.
- Refresh token sessions stored as SHA-256 hashes in the database.
- Forgot password and reset password flow.
- User profile management.
- Account status handling for unverified, active, suspended, and deleted users.
- Role and mode handling for seeker, provider, and admin workflows.

### Seeker Features

- Browse available service providers.
- Search services and providers.
- AI-based service classification from natural language queries.
- View provider details, ratings, services, location, and reviews.
- Create booking holds before final booking.
- Manage bookings.
- Chat with providers after confirmed bookings.
- Receive in-app and push notifications.
- Submit reviews after completed bookings.
- View search history.

### Provider Features

- Provider profile creation and management.
- Provider dashboard.
- Manage services with price range, duration, and images.
- Manage weekly availability.
- Mark unavailable dates.
- Respond to booking requests.
- Update booking status such as en route, in progress, and completed.
- Upload verification documents.
- Manage portfolio items.
- View provider analytics and booking information.
- Receive booking and review notifications.

### Admin Features

- Admin dashboard.
- Manage users.
- Suspend or soft-delete accounts.
- Manage categories and services.
- Manage bookings and cancel bookings when required.
- Review provider verification requests.
- Approve or reject uploaded documents.
- Manage reviews.
- Manage FAQs and content pages.
- Manage user support queries.
- View analytics.

### Communication and Notification Features

- Real-time chat using Firebase Firestore.
- In-app notifications stored in PostgreSQL.
- Firebase Cloud Messaging for push notifications.
- Notification token registration.
- Mark notifications as read or read all.
- Chat notification support.
- Email notifications using SMTP and Nodemailer.

### AI Search Features

- Natural language query classification.
- Keyword based matching for clear queries.
- Text embedding generation using Xenova Transformers.
- Cosine similarity matching against stored embeddings.
- Stored AI category embeddings in PostgreSQL.
- Out-of-scope detection support.
- AI embedding sync scripts.

## Technology Stack

### Frontend

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React
- React Icons
- React Hot Toast
- React Slick
- Recharts
- HTML2Canvas
- jsPDF and jsPDF AutoTable

### Backend

- Next.js Route Handlers under `src/app/api`
- TypeScript server-side modules under `src/lib`
- Prisma Client
- bcrypt for password hashing
- jsonwebtoken for JWT signing and verification
- Nodemailer for SMTP email sending
- Firebase Admin SDK for server-side Firestore and FCM access
- Cloudinary upload utilities
- Mapbox geocoding utilities

### Database

- PostgreSQL
- Prisma ORM
- Prisma migrations

Main database models include:

- `User`
- `RefreshToken`
- `PasswordResetToken`
- `EmailVerificationToken`
- `ServiceProvider`
- `ServiceCategory`
- `Service`
- `Availability`
- `UnavailableDate`
- `Booking`
- `ProviderResponse`
- `Message`
- `Review`
- `ProblemQuery`
- `AiCategoryEmbedding`
- `SearchHistory`
- `Notification`
- `ProviderDocument`
- `PortfolioItem`
- `UserQuery`
- `FAQ`
- `Content`

### AI Technologies 

The project contains an AI based service classification feature.

- Library: `@xenova/transformers`
- Model: `Xenova/paraphrase-multilingual-MiniLM-L12-v2`
- Task: feature extraction / text embedding generation
- Embedding method: mean pooling with normalization
- Matching method: cosine similarity
- Storage: `AiCategoryEmbedding` table in PostgreSQL
- Supporting files:
  - `src/lib/embeddings.ts`
  - `src/lib/classifier.ts`
  - `src/lib/training-data.ts`
  - `src/lib/ai/embedding-store.ts`
  - `src/lib/ai/stored-embedding-classifier.ts`
  - `src/lib/ai/out-of-scope.ts`
  - `scripts/sync-ai-embeddings.ts`
  - `scripts/test-classifier.ts`



## System Architecture

Servizo follows Next.js architecture. The frontend pages, API routes, server-side logic, and database access are kept in a single codebase.

```text
User Browser
    |
    | Next.js Pages
    v
Next.js App Router
    |
    | API Requests
    v
Next.js Route Handlers
    |
    |--------------------------|
    |                          |
    v                          v
Prisma ORM                 Firebase
    |                      - Firestore chat
    |                      - FCM push notifications
    v
PostgreSQL
    |
    | Stores users, providers, services,
    | bookings, reviews, notifications,
    | documents, content, and AI embeddings

External Services:
- Cloudinary for image uploads
- Mapbox for geocoding and maps
- SMTP provider for email
- Xenova Transformers for AI embeddings
```

### Architecture Layers

- **Presentation Layer:** Pages and components under `src/app` and `src/components`.
- **API Layer:** Route handlers under `src/app/api`.
- **Business Logic Layer:** Shared utilities and domain modules under `src/lib`.
- **Database Layer:** Prisma schema and migrations under `prisma`.
- **Realtime Layer:** Firebase Firestore for chat conversations and messages.
- **Notification Layer:** PostgreSQL notifications plus Firebase Cloud Messaging.
- **AI Layer:** Query classification using embeddings and stored category vectors.

## Project Workflow

### Seeker Workflow

1. User registers as a seeker.
2. User verifies email.
3. User logs in.
4. User searches for services or enters a natural language query.
5. AI classifier can detect a relevant service category.
6. User views providers and provider details.
7. User checks available slots.
8. User creates a booking hold.
9. Booking becomes pending for provider response.
10. Provider accepts or rejects the booking.
11. If accepted, the seeker can chat with the provider.
12. Service progresses through status updates.
13. User submits a review after completion.

### Provider Workflow

1. User registers as a provider or upgrades to provider mode.
2. Provider completes profile and service information.
3. Provider manages weekly availability and unavailable dates.
4. Provider uploads verification documents.
5. Admin reviews verification documents.
6. Provider receives booking requests.
7. Provider accepts, rejects, or responds to booking requests.
8. Provider updates job status.
9. Provider receives reviews and notifications.

### Admin Workflow

1. Admin logs in.
2. Admin manages users, categories, services, reviews, bookings, and content.
3. Admin reviews provider verification requests.
4. Admin approves or rejects documents.
5. Admin handles user queries.
6. Admin monitors platform analytics.

### AI Search Workflow

1. User enters a query such as a service problem.
2. `/api/classify` receives the query.
3. The classifier first checks keyword matches.
4. If needed, the system generates a text embedding.
5. The embedding is compared with stored category/example embeddings.
6. Cosine similarity is used to rank possible categories.
7. Out-of-scope detection helps prevent irrelevant matches.
8. The best category result is returned with confidence information.

### Booking Workflow

1. User selects a service, date, and time.
2. The system validates the selected slot.
3. The system checks provider weekly availability.
4. The system checks unavailable dates.
5. The system checks overlapping active bookings.
6. A booking hold is created for a limited time.
7. Expired holds are cancelled automatically when booking related APIs run.
8. Provider receives booking request.
9. Booking status changes according to provider and user actions.

## Installation Guide

Follow these steps to run the project locally.

## Prerequisites

Required:

- Node.js 20 or later
- npm
- PostgreSQL database
- Firebase project with Firestore and Firebase Cloud Messaging enabled
- Cloudinary account for uploads
- Mapbox token for geocoding and maps
- SMTP email account for sending emails

Recommended:

- VS Code
- Prisma Studio for database inspection
- Git

## Setup Instructions

1. Clone or copy the project.

```bash
git clone <repository-url>
cd service-market
```

If a repository URL is not available, copy the project folder manually.

2. Install dependencies.

```bash
npm install
```

3. Create the local environment file.

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

4. Fill the required environment variables in `.env.local`.

Do not commit or submit `.env.local` because it contains real credentials.

5. Prepare Prisma.

```bash
npx prisma generate
```

6. Apply database migrations.

For an existing configured database:

```bash
npx prisma migrate deploy
```

For local development when creating new migrations:

```bash
npx prisma migrate dev
```

7. Optional: sync AI embeddings.

```bash
npm run ai:sync-embeddings
```

For incremental syncing:

```bash
npm run ai:sync-embeddings:new
```

## Environment Variables

The project uses `.env.example` as a template. Real values should be placed in `.env.local` for local development or in the hosting platform environment settings for production.

### Database

```env
DATABASE_URL=
DATABASE_URL_LOCAL=
DATABASE_URL_PRODUCTION=
APP_ENV=
```

### Authentication

```env
NEXTAUTH_URL=
NEXTAUTH_SECRET=
JWT_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SHORT_DAYS=
REFRESH_TOKEN_LONG_DAYS=
```

`ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_SHORT_DAYS`, and `REFRESH_TOKEN_LONG_DAYS` are used in code with defaults if not provided.

### Firebase Web

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

### Firebase Admin

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Email / SMTP

```env
SMTP_SERVICE=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### App URL

```env
NEXT_PUBLIC_APP_URL=
```

### Cloudinary

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Note: `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are present in `.env.example` and the environment check route, but no direct usage was found in the analyzed source files. Client upload logic mainly uses `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

### Mapbox

```env
NEXT_PUBLIC_MAPBOX_TOKEN=
MAPBOX_TOKEN=
```

### AI / Embedding Configuration

```env
TRANSFORMERS_CACHE=
ONNX_WASM_PATH=
HUGGINGFACEHUB_API_TOKEN=
AI_SYNC_ONLY_NEW=
AI_SYNC_SKIP_LABELED_DATA=
AI_EMBED_DB_BATCH_SIZE=
AI_EMBED_CONCURRENCY=
```

Note: `HUGGINGFACEHUB_API_TOKEN` is present in `.env.example`, but no direct usage was found in the analyzed source files.

## Running the Application

Start the development server:

```bash
npm run dev
```

Open the application in the browser:

```text
http://localhost:3000
```

Build the production version:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Run linting:

```bash
npm run lint
```

Open Prisma Studio:

```bash
npx prisma studio
```

## API Documentation

The project contains 84 Next.js API route handlers under `src/app/api`. The following table summarizes the major API groups found during analysis.

### Authentication APIs

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register` | Register a new user. |
| `POST /api/auth/login` | Login and create an authenticated session. |
| `POST /api/auth/logout` | Logout and clear auth cookies. |
| `POST /api/auth/refresh` | Refresh authentication session. |
| `POST /api/auth/switch-mode` | Switch active mode between seeker and provider where allowed. |
| `POST /api/auth/become-provider` | Upgrade/create provider profile flow. |
| `GET /api/auth/verify-email` | Verify email using token. |
| `POST /api/auth/send-email-verification` | Send verification email. |
| `POST /api/auth/forgot-password` | Send password reset email. |
| `POST /api/auth/reset-password` | Reset password with token. |
| `GET /api/auth/user/[userId]` | Fetch user information by ID. |

### User and Profile APIs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/user` | Get current user session/profile data. |
| `GET /api/profile` | Fetch profile information. |
| `PUT /api/profile` | Update profile information. |
| `POST /api/profile/change-password` | Change account password. |

### Service and Category APIs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/categories` | Fetch service categories. |
| `GET /api/services` | Fetch services. |
| `GET /api/services/[id]` | Fetch service details. |
| `GET /api/providers` | Fetch approved and available providers. |
| `GET /api/providers/[id]` | Fetch provider details. |
| `GET /api/providers/top-rated` | Fetch top-rated providers. |
| `GET /api/providers/random` | Fetch random providers. |
| `GET /api/providers/ai-search` | Provider search related to AI/category flow. |

### Booking APIs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/bookings` | Fetch seeker bookings. |
| `POST /api/bookings` | Create/confirm booking flow depending on route logic. |
| `POST /api/bookings/hold` | Create a temporary booking hold. |
| `GET /api/bookings/[id]` | Fetch booking details. |
| `PATCH /api/bookings/[id]` | Update booking details/status depending on route logic. |
| `POST /api/bookings/[id]/confirm` | Confirm a booking. |
| `PATCH /api/bookings/[id]/status` | Update booking status. |
| `POST /api/bookings/[id]/review` | Create a review for a booking. |

### Provider APIs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/provider/dashboard` | Fetch provider dashboard data. |
| `GET /api/provider/bookings` | Fetch provider bookings. |
| `POST /api/provider/bookings/[id]/respond` | Respond to a booking request. |
| `POST /api/provider/location` | Update provider location. |
| `GET /api/providers/services` | Fetch provider services. |
| `POST /api/providers/services` | Create provider service. |
| `PATCH /api/providers/services/[id]` | Update provider service. |
| `DELETE /api/providers/services/[id]` | Delete or deactivate provider service. |
| `GET /api/providers/availability` | Fetch provider availability. |
| `POST /api/providers/availability` | Create/update availability. |
| `GET /api/providers/[id]/slots` | Fetch available booking slots for a provider. |
| `GET /api/providers/availability-check` | Check provider availability. |
| `GET /api/providers/unavailability` | Fetch unavailable dates. |
| `POST /api/providers/unavailability` | Add unavailable date. |
| `DELETE /api/providers/unavailability/[id]` | Remove unavailable date. |
| `GET /api/providers/[id]/reviews` | Fetch provider reviews. |
| `GET /api/providers/[id]/documents` | Fetch provider documents. |
| `POST /api/providers/[id]/documents` | Upload/provider document flow. |
| `POST /api/providers/[id]/documents/cnic-request` | CNIC-related request flow. |

### Chat APIs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/chat/conversations` | Fetch user conversations. |
| `GET /api/chat/messages` | Fetch messages for a conversation. |
| `POST /api/chat/messages` | Send a chat message. |
| `POST /api/chat/messages/read` | Mark messages as read. |
| `GET /api/chat/access` | Verify chat access. |
| `GET /api/chat/health` | Check chat/Firebase health. |
| `GET /api/chat/diagnose` | Diagnostic endpoint for chat. |
| `POST /api/chat/seed` | Seed/test chat data if used during development. |

### Notification APIs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/notifications` | Fetch notifications. |
| `POST /api/notifications/register-token` | Register FCM token. |
| `POST /api/notifications/read` | Mark one notification as read. |
| `POST /api/notifications/read-all` | Mark all notifications as read. |
| `GET /api/firebase-messaging-sw` | Dynamic Firebase messaging service worker. |

### AI APIs

| Endpoint | Purpose |
| --- | --- |
| `POST /api/classify` | Classify a natural language query into a service category. |
| `GET/POST /api/search/history` | Manage search history. |
| `DELETE /api/search/history/[id]` | Delete a search history item. |

### Admin APIs

| Endpoint | Purpose |
| --- | --- |
| `/api/admin/users` | Manage users. |
| `/api/admin/users/[id]` | Manage a specific user. |
| `/api/admin/users/[id]/status` | Update user status. |
| `/api/admin/categories` | Manage categories. |
| `/api/admin/categories/[id]` | Manage a specific category. |
| `/api/admin/services` | Manage services. |
| `/api/admin/services/[id]` | Manage a specific service. |
| `/api/admin/bookings` | Manage bookings. |
| `/api/admin/bookings/[id]` | Manage a specific booking. |
| `/api/admin/bookings/[id]/cancel` | Cancel a booking as admin. |
| `/api/admin/reviews` | Manage reviews. |
| `/api/admin/reviews/[id]` | Manage a specific review. |
| `/api/admin/verification-requests` | Fetch verification requests. |
| `/api/admin/verification-requests/[id]/approve` | Approve verification request. |
| `/api/admin/verification-requests/[id]/reject` | Reject verification request. |
| `/api/admin/analytics` | Fetch analytics. |
| `/api/admin/content` | Manage CMS content. |
| `/api/admin/faq` | Manage FAQs. |
| `/api/admin/queries` | Manage user queries. |

### Content and Utility APIs

| Endpoint | Purpose |
| --- | --- |
| `GET /api/content/[slug]` | Fetch content page by slug. |
| `GET /api/content/faq` | Fetch FAQ content. |
| `GET /api/env-check` | Check missing required environment variables. |
| `GET /api/documents/signed-url` | Document URL endpoint. Current code marks it deprecated. |
| `POST /api/queries` | Submit user/support query. |

## Folder Structure

```text
service-market/
|-- prisma/
|   |-- schema.prisma
|   |-- migrations/
|
|-- public/
|   |-- file.svg
|   |-- vercel.svg
|   |-- window.svg
|
|-- scripts/
|   |-- sync-ai-embeddings.ts
|   |-- test-classifier.ts
|
|-- src/
|   |-- app/
|   |   |-- (auth)/
|   |   |-- (marketing)/
|   |   |-- (site)/
|   |   |-- admin/
|   |   |-- api/
|   |   |-- bookings/
|   |   |-- messages/
|   |   |-- notifications/
|   |   |-- profile/
|   |   |-- provider/
|   |   |-- services/
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |
|   |-- components/
|   |   |-- admin/
|   |   |-- auth/
|   |   |-- bookings/
|   |   |-- chat/
|   |   |-- home/
|   |   |-- layout/
|   |   |-- profile/
|   |   |-- provider/
|   |   |-- providerDetail/
|   |   |-- services/
|   |   |-- ui/
|   |
|   |-- data/
|   |   |-- ai-categories.json
|   |
|   |-- hooks/
|   |
|   |-- lib/
|   |   |-- admin/
|   |   |-- ai/
|   |   |-- location/
|   |   |-- validation/
|   |   |-- auth.ts
|   |   |-- bookings.ts
|   |   |-- classifier.ts
|   |   |-- cookies.ts
|   |   |-- email.ts
|   |   |-- embeddings.ts
|   |   |-- firebaseAdmin.ts
|   |   |-- firebaseConfig.ts
|   |   |-- fcm.ts
|   |   |-- geocoding.ts
|   |   |-- jwt.ts
|   |   |-- notifications.ts
|   |   |-- prisma.ts
|   |   |-- session.ts
|   |   |-- training-data.ts
|   |
|   |-- services/
|   |-- types/
|
|-- .env.example
|-- .gitignore
|-- next.config.ts
|-- package.json
|-- package-lock.json
|-- postcss.config.mjs
|-- README.md
|-- tsconfig.json
```


