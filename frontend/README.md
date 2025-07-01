# LOSLC Forms Frontend

A modern React/Next.js frontend for the LOSLC Forms dynamic form builder system.

## Architecture

The frontend is organized into three main parts:

### 🔐 Auth (`/auth`)
- User authentication (login/register)
- Built with React Hook Form + Zod validation
- Cookie-based session management

### 👑 Admin (`/admin`)
- Form creation and management
- Response analytics
- User dashboard
- Protected routes with authentication

### 📝 Main (`/[formId]`)
- Public form filling interface
- Dynamic field rendering
- Anonymous session management
- Real-time response submission

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: Shadcn/ui + Tailwind CSS
- **State Management**: TanStack React Query
- **HTTP Client**: Ky
- **Forms**: React Hook Form + Zod
- **Package Manager**: Bun

## API Integration

- **Base URL**: `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`)
- **Authentication**: Cookie-based sessions
- **Data Fetching**: React Query with Ky under the hood

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin panel
│   ├── [formId]/          # Public form pages
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── ui/                # Shadcn/ui components
│   └── providers/         # React Query provider
└── lib/
    ├── api.ts             # API types and client
    ├── services/          # API service functions
    │   ├── auth.ts        # Authentication services
    │   ├── admin.ts       # Admin panel services
    │   └── forms.ts       # Public form services
    ├── hooks/             # React Query hooks
    │   ├── useAuth.ts     # Auth hooks
    │   ├── useAdmin.ts    # Admin hooks
    │   └── useForms.ts    # Form hooks
    └── utils.ts           # Utility functions
```

## Features

### Authentication
- Login/Register forms with validation
- Automatic redirect on authentication state change
- Session persistence with cookies

### Admin Panel
- Dashboard with form overview
- Form creation with drag-and-drop builder
- Real-time response monitoring
- Form management (create, edit, delete, open/close)

### Form Filling
- Dynamic field rendering based on backend configuration
- Support for multiple field types:
  - Text input
  - Numerical input with bounds
  - Boolean (checkbox)
  - Single select (dropdown)
  - Multi-select (checkboxes)
- Real-time response submission
- Session management for anonymous users
- Form validation

### UI/UX
- Responsive design
- Modern, clean interface
- Loading states and error handling
- Toast notifications
- Accessibility support

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints Used

### Authentication
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Admin (Authenticated)
- `GET /api/v1/forms` - Get all forms
- `GET /api/v1/forms/my` - Get user forms
- `POST /api/v1/forms` - Create form
- `PUT /api/v1/forms/{id}` - Update form
- `DELETE /api/v1/forms/{id}` - Delete form
- `POST /api/v1/forms/{id}/close` - Close form
- `POST /api/v1/forms/{id}/open` - Open form

### Forms (Public)
- `GET /api/v1/forms/{id}` - Get form details
- `GET /api/v1/forms/{id}/fields` - Get form fields
- `POST /api/v1/forms/responses` - Submit response
- `PUT /api/v1/forms/responses/{id}` - Edit response
- `POST /api/v1/forms/sessions/{id}/submit` - Submit session

## Security

- All admin routes require authentication
- CSRF protection via cookies
- Input validation on client and server
- Secure session management
