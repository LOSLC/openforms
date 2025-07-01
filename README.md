# LOSLC Forms

A full-stack, open-source form builder and management system designed for online campaigns and registrations. Built with modern technologies including FastAPI, Next.js, PostgreSQL, and Docker.

## 🌟 Features

### For Form Creators (Admin Panel)
- **Dynamic Form Builder**: Create forms with multiple field types
- **Field Types Support**: Text, Number, Boolean, Single/Multiple Select
- **Form Management**: Create, edit, delete, open/close forms
- **Response Analytics**: View and export form submissions
- **User Authentication**: Secure login and registration system
- **Permission System**: Role-based access control

### For Form Respondents (Public Interface)
- **Anonymous Access**: Fill forms without registration
- **Session Management**: Resume form filling sessions
- **Real-time Validation**: Client and server-side validation
- **Mobile Responsive**: Works on all devices
- **Accessibility**: Screen reader and keyboard navigation support

## 🏗️ Architecture

### Tech Stack
- **Backend**: FastAPI (Python 3.13+) with SQLModel
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: PostgreSQL 17
- **State Management**: TanStack React Query
- **UI Components**: Shadcn/ui with Radix UI
- **Authentication**: Cookie-based sessions
- **Containerization**: Docker & Docker Compose

### Project Structure
```
loslc-forms/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes and controllers
│   │   │   └── routes/v1/  # Version 1 API endpoints
│   │   │       ├── controllers/   # Request handlers
│   │   │       ├── dto/           # Data transfer objects
│   │   │       ├── providers/     # Business logic
│   │   │       └── router.py      # Route registration
│   │   ├── core/           # Core application modules
│   │   │   ├── config/     # Environment configuration
│   │   │   ├── db/         # Database models and setup
│   │   │   ├── logging/    # Logging configuration
│   │   │   ├── security/   # Security and permissions
│   │   │   └── services/   # External services
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Alembic database migrations
│   ├── main.py            # Application entry point
│   └── pyproject.toml     # Dependencies and configuration
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── admin/     # Admin dashboard
│   │   │   ├── auth/      # Authentication pages
│   │   │   └── [formId]/  # Public form filling
│   │   ├── components/    # Reusable UI components
│   │   └── lib/          # Utilities and services
│   │       ├── hooks/     # React Query hooks
│   │       └── services/  # API service layer
│   └── package.json       # Dependencies
└── docker-compose.yml     # Multi-container orchestration
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/loslc-forms.git
cd loslc-forms
```

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Database
PG_USER=dbadmin
PG_PASSWORD=yourpassword
PG_DATABASE=yourdb
DB_STRING=postgresql://dbadmin:yourpassword@db:5432/yourdb
ALEMBIC_DB_URL=postgresql://dbadmin:yourpassword@db:5432/yourdb

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=8000

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8000

# Debug mode
DEBUG=True

# Email (Optional)
EMAIL_APP_PASSWORD=your_email_password
APP_EMAIL_ADDRESS=your_email@example.com
EMAIL_TEMPLATES_PATH=/app/templates
```

### 3. Start the Application
```bash
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (when DEBUG=True)

## 📋 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "user@example.com",
  "password": "string",
  "password_confirm": "string",
  "name": "string"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "string"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
```

### Form Management Endpoints (Admin)

#### Create Form
```http
POST /api/v1/forms
Content-Type: application/json

{
  "label": "Form Title",
  "description": "Optional description"
}
```

#### Get User Forms
```http
GET /api/v1/forms/my?skip=0&limit=10
```

#### Update Form
```http
PUT /api/v1/forms/{form_id}
Content-Type: application/json

{
  "label": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Form
```http
DELETE /api/v1/forms/{form_id}
```

#### Open/Close Form
```http
POST /api/v1/forms/{form_id}/open
POST /api/v1/forms/{form_id}/close
```

### Form Field Management

#### Add Field to Form
```http
POST /api/v1/forms/{form_id}/fields

{
  "label": "Field Label",
  "description": "Field description",
  "field_type": "Text|Numerical|Boolean|Select|Multiselect",
  "required": true,
  "possible_answers": "option1,option2,option3", // For Select/Multiselect
  "number_bounds": "1:100", // For Numerical (min:max)
  "text_bounds": "5:200"   // For Text (min_length:max_length)
}
```

#### Update Form Field
```http
PUT /api/v1/forms/fields/{field_id}

{
  "label": "Updated Label",
  "description": "Updated description",
  "required": false
}
```

#### Delete Form Field
```http
DELETE /api/v1/forms/fields/{field_id}
```

### Public Form Access

#### Get Form (Public)
```http
GET /api/v1/forms/{form_id}
```

#### Get Form Fields (Public)
```http
GET /api/v1/forms/{form_id}/fields
```

### Response Submission (Public)

#### Submit Response
```http
POST /api/v1/forms/responses
Content-Type: application/json

{
  "field_id": "uuid",
  "value": "response_value"
}
```

#### Edit Response
```http
PUT /api/v1/forms/responses/{answer_id}
Content-Type: application/json

{
  "value": "updated_value"
}
```

#### Submit Session
```http
POST /api/v1/forms/sessions/submit
```

### Response Analytics (Admin)

#### Get Form Responses
```http
GET /api/v1/forms/{form_id}/responses?skip=0&limit=10
```

## 🔧 Development Setup

### Backend Development

#### Prerequisites
- Python 3.13+
- UV package manager (recommended)

#### Setup
```bash
cd backend

pip install uv

uv sync
# Run database migrations
uv run alembic upgrade head

# Start development server
uv run main.py
```

#### Environment Variables
```env
DB_STRING=postgresql://user:password@localhost:5432/dbname
DEBUG=True
```

### Frontend Development

#### Prerequisites
- Node.js 18+
- Bun (recommended) or npm/yarn

#### Setup
```bash
cd frontend

# Install dependencies
bun install

# Start development server
bun run dev
```

#### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔒 Security Features

### Authentication & Authorization
- **Cookie-based Sessions**: Secure HTTP-only cookies
- **Role-based Access Control**: Admin and user roles
- **Permission System**: Resource-level permissions

### Data Protection
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: SQLModel/SQLAlchemy ORM
- **XSS Protection**: React's built-in XSS protection
- **CORS Configuration**: Properly configured CORS policies

### Privacy
- **Anonymous Form Filling**: No registration required for respondents
- **Session Management**: Temporary sessions for form filling
- **Data Encryption**: Sensitive data encryption at rest

## 📊 Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE user (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    name VARCHAR NOT NULL
);
```

#### Forms
```sql
CREATE TABLE form (
    id UUID PRIMARY KEY,
    user_id VARCHAR REFERENCES user(id),
    label VARCHAR NOT NULL,
    description TEXT,
    open BOOLEAN DEFAULT FALSE
);
```

#### Form Fields
```sql
CREATE TABLE formfield (
    id UUID PRIMARY KEY,
    form_id UUID REFERENCES form(id),
    label VARCHAR NOT NULL,
    description TEXT NOT NULL,
    field_type VARCHAR NOT NULL, -- Text, Numerical, Boolean, Select, Multiselect
    required BOOLEAN DEFAULT TRUE,
    possible_answers TEXT,       -- For Select/Multiselect
    number_bounds VARCHAR,       -- min:max for Numerical
    text_bounds VARCHAR          -- min_length:max_length for Text
);
```

#### Answer Sessions
```sql
CREATE TABLE answersession (
    id UUID PRIMARY KEY,
    form_id UUID REFERENCES form(id),
    submitted BOOLEAN DEFAULT FALSE
);
```

#### Field Answers
```sql
CREATE TABLE fieldanswer (
    id UUID PRIMARY KEY,
    field_id UUID REFERENCES formfield(id),
    session_id UUID REFERENCES answersession(id),
    value TEXT
);
```

## 🚦 Form Field Types

### Text Field
- **Validation**: Min/max length bounds
- **Format**: `text_bounds: "5:200"` (min 5, max 200 characters)
- **Use Cases**: Names, descriptions, comments

### Numerical Field
- **Validation**: Min/max value bounds
- **Format**: `number_bounds: "1:100"` (min 1, max 100)
- **Use Cases**: Age, quantity, ratings

### Boolean Field
- **Type**: Checkbox
- **Values**: `true` or `false`
- **Use Cases**: Agreements, yes/no questions

### Select Field
- **Type**: Dropdown (single selection)
- **Format**: `possible_answers: "option1,option2,option3"`
- **Use Cases**: Country selection, categories

### Multiselect Field
- **Type**: Checkbox group (multiple selections)
- **Format**: `possible_answers: "option1,option2,option3"`
- **Use Cases**: Skills, interests, preferences

## 🔄 Workflow

### Form Creation Workflow
1. **Admin Login**: Authenticate to access admin panel
2. **Create Form**: Set title and description
3. **Add Fields**: Configure field types and validation
4. **Open Form**: Make form available for responses
5. **Monitor**: View real-time response analytics

### Form Filling Workflow
1. **Access Form**: Visit public form URL
2. **Fill Fields**: Complete required and optional fields
3. **Validate**: Real-time validation feedback
4. **Submit**: Submit complete form response
5. **Confirmation**: Receive submission confirmation

## 📦 Deployment

### Production Docker
```bash
# Build and start production containers
docker-compose up -d --build
```

### Environment Variables for Production
```env
DEBUG=False
DB_STRING=postgresql://user:password@db:5432/dbname
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for frontend development
- Update documentation for API changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, questions, or feature requests:
- **Issues**: [GitHub Issues](https://github.com/LOSLC/loslc-forms/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LOSLC/loslc-forms/discussions)
- **Email**: support@loslc.tech


Built with ❤️ by and for the Linux & Open-Source Lovers community