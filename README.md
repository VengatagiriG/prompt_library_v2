# Prompt Library Application

A comprehensive full-stack Prompt Library Application that allows users to store, search, organize, and reuse prompts across multiple categories and domains.

## 🚀 Features

### Frontend Features
- **Clean UI**: Built with React + Tailwind CSS
- **Dark/Light Mode**: Toggle between themes
- **Search & Filter**: Advanced search with category and tag filtering
- **Favorites**: Star and organize favorite prompts
- **Responsive Design**: Works on all devices
- **Authentication**: JWT-based user authentication

### Backend Features
- **Django REST API**: Robust backend with Django REST Framework
- **PostgreSQL Database**: Scalable database solution
- **Full-Text Search**: Search across titles, content, and tags
- **Categories & Tags**: Organize prompts efficiently
- **User Management**: Role-based access control
- **Analytics**: Usage statistics and reporting

### Advanced Features
- **Export/Import**: JSON and CSV format support
- **Version History**: Track prompt changes
- **Collaboration**: Share prompts with other users
- **Analytics Dashboard**: Most used prompts and trending categories

## 🛠️ Tech Stack

### Backend
- **Python 3.8+**
- **Django 4.2**
- **Django REST Framework**
- **PostgreSQL**
- **JWT Authentication**
- **Gunicorn** (Production server)

### Frontend
- **React 18**
- **Tailwind CSS**
- **React Router**
- **Axios** (HTTP client)
- **React Hot Toast** (Notifications)

### Development Tools
- **Docker & Docker Compose**
- **Git** (Version control)
- **Postman** (API testing)

## 📁 Project Structure

```
prompt_library_v2/
├── backend/
│   ├── prompt_library/          # Django project
│   │   ├── settings.py         # Main configuration
│   │   ├── urls.py            # URL routing
│   │   └── wsgi.py           # WSGI config
│   ├── prompts/               # Prompts app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API views
│   │   ├── serializers.py    # Data serialization
│   │   └── urls.py           # App URLs
│   ├── users/                # Users app
│   │   ├── views.py          # Auth views
│   │   └── serializers.py    # User serialization
│   ├── seed_data.py          # Sample data
│   ├── requirements.txt      # Python dependencies
│   └── manage.py            # Django CLI
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── App.js          # Main app component
│   ├── public/              # Static assets
│   ├── package.json        # Node dependencies
│   └── tailwind.config.js  # Tailwind config
├── config/                 # Configuration files
├── docs/                  # Documentation
└── README.md             # This file
```

## 🏃‍♂️ Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **PostgreSQL 12+**
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd prompt_library_v2
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Database Setup
```bash
# Create PostgreSQL database
createdb prompt_library

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

#### Seed Sample Data
```bash
python manage.py shell < seed_data.py
```

#### Start Development Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Development Server
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/prompt_library

# Security
SECRET_KEY=your-secret-key-here
DEBUG=True

# JWT
JWT_SECRET_KEY=your-jwt-secret-key

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

## 📊 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/register/` | User registration |
| POST | `/api/auth/refresh/` | Refresh JWT token |
| GET | `/api/auth/me/` | Get current user |

### Prompts Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prompts/` | List prompts |
| POST | `/api/prompts/` | Create prompt |
| GET | `/api/prompts/{id}/` | Get prompt |
| PUT | `/api/prompts/{id}/` | Update prompt |
| DELETE | `/api/prompts/{id}/` | Delete prompt |
| POST | `/api/prompts/{id}/favorite/` | Toggle favorite |
| POST | `/api/prompts/{id}/use/` | Increment usage |
| GET | `/api/prompts/favorites/` | Get favorites |
| GET | `/api/prompts/search/` | Search prompts |
| GET | `/api/prompts/stats/` | Get statistics |

### Categories Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prompts/categories/` | List categories |
| POST | `/api/prompts/categories/` | Create category |
| GET | `/api/prompts/categories/{id}/` | Get category |
| PUT | `/api/prompts/categories/{id}/` | Update category |
| DELETE | `/api/prompts/categories/{id}/` | Delete category |

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login** with username/password to get access and refresh tokens
2. **Include** the access token in the `Authorization` header: `Bearer <token>`
3. **Refresh** tokens when they expire using the refresh token

## 🎨 Frontend Features

### Dashboard
- Overview of prompt statistics
- Recent prompts with usage tracking
- Quick actions and navigation

### Prompt Management
- Create, edit, delete prompts
- Search and filter functionality
- Category-based organization
- Tag-based filtering
- Favorite prompts

### User Features
- Profile management
- Dark/light mode toggle
- Responsive design
- Mobile-friendly interface

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
# Build the containers
docker-compose build

# Start the application
docker-compose up

# Run in background
docker-compose up -d
```

### Production Deployment

```bash
# Set environment variables
export DJANGO_SETTINGS_MODULE=prompt_library.settings.production
export SECRET_KEY=your-production-secret-key

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Start server with Gunicorn
gunicorn prompt_library.wsgi:application --bind 0.0.0.0:8000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 Sample Data

The application includes sample data with:

- **2 Users**: admin/admin123, user/user123
- **5 Categories**: Writing, Programming, Business, Education, Creative
- **7 Sample Prompts** with various categories and tags
- **Usage Statistics** and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the API documentation

## 🔄 Updates and Maintenance

- **Regular Updates**: Keep dependencies updated
- **Security**: Monitor for security vulnerabilities
- **Performance**: Optimize queries and frontend performance
- **Backup**: Regular database backups recommended

---

**Happy Prompting! 🚀**
