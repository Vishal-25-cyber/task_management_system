# 🚀 TaskFlow Pro

> A production-quality, full-stack SaaS-style Task Management Web Application — portfolio-worthy and built for internship evaluations.

![TaskFlow Pro](https://img.shields.io/badge/TaskFlow-Pro-6366f1?style=for-the-badge&logo=task&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?style=flat-square&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?style=flat-square&logo=tailwindcss)

---

## 📖 Project Overview

**TaskFlow Pro** is a modern, premium SaaS-style task management platform inspired by Trello, Asana, Jira, ClickUp, and Notion. Built with React, Vite, Node.js, Express, and MongoDB, it demonstrates clean architecture, production-ready code, and professional UI/UX design.

---

## ✨ Features

### 🔐 Authentication
- JWT-based secure authentication
- Registration with full validation
- Login / Logout with session persistence
- Password hashing via bcrypt
- Protected routes and auth middleware

### 📋 Task Management
- Full CRUD (Create, Read, Update, Delete)
- Categories: Work, College, Study, Personal, Shopping, Others
- Priority levels: Low, Medium, High
- Status tracking: Pending, In Progress, Completed
- Favorites & Archive system
- Task comments (add, edit, delete)

### 🎯 Views
- **Card View** — Beautiful task cards with hover actions
- **Table View** — Sortable data table
- **Kanban Board** — Drag-and-drop with instant DB persistence

### 🔍 Search & Filter
- Real-time search by title, description, category
- Filter by status, priority, category, favorites, archived
- Sort by newest, oldest, priority, deadline, alphabetical

### 📅 Calendar
- Monthly calendar view
- Visual task indicators per day
- Click any day to view its tasks

### 📊 Analytics
- Task Status donut chart
- Priority distribution bar chart
- Monthly task creation line chart
- Category distribution donut chart
- Completion rate gauge

### 🔔 Smart Reminders
- Overdue task detection (red badge)
- Due today alerts (orange badge)
- Due within 3 days highlights (yellow badge)
- React Hot Toast in-app notifications

### 🎨 UI/UX
- Premium dark/light mode (persisted)
- Fully responsive (mobile, tablet, desktop)
- Framer Motion animations throughout
- Glassmorphism effects
- Skeleton loading states
- Empty state illustrations
- Confirmation dialogs

---

## 🏗️ Architecture

```
taskflow-pro/
├── backend/                  # Node.js + Express REST API
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth + error handler
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routers
│   └── server.js             # Entry point
└── frontend/                 # React + Vite SPA
    └── src/
        ├── components/       # Reusable UI components
        ├── context/          # AuthContext, ThemeContext, TaskContext
        ├── hooks/            # Custom hooks
        ├── layouts/          # Dashboard + Auth layouts
        ├── pages/            # Route-level pages
        ├── routes/           # Router + ProtectedRoute
        ├── services/         # Axios API service modules
        └── utils/            # Helper functions
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | React 19, Vite, React Router DOM, Tailwind CSS v4 |
| Animations | Framer Motion                                     |
| Forms      | React Hook Form                                   |
| HTTP       | Axios                                             |
| Charts     | Chart.js, React-ChartJS-2                         |
| DnD        | @hello-pangea/dnd                                 |
| Toast      | React Hot Toast                                   |
| Backend    | Node.js, Express.js                               |
| Auth       | JWT, bcryptjs                                     |
| Validation | express-validator                                 |
| Database   | MongoDB, Mongoose                                 |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone <repo-url>
cd "Task Management system"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` in `/backend`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow_pro
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev    # Development (nodemon)
npm start      # Production
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev    # Starts at http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend `.env`

| Variable      | Description                    | Default                                    |
|---------------|--------------------------------|--------------------------------------------|
| `PORT`        | API server port                | `5000`                                     |
| `MONGO_URI`   | MongoDB connection string      | `mongodb://localhost:27017/taskflow_pro`   |
| `JWT_SECRET`  | JWT signing secret             | _(change in production)_                   |
| `JWT_EXPIRE`  | Token expiry duration          | `7d`                                       |
| `NODE_ENV`    | Environment                    | `development`                              |
| `FRONTEND_URL`| CORS allowed origin            | `http://localhost:5173`                    |

---

## 📡 API Documentation

### Authentication
| Method | Endpoint                     | Description          | Auth |
|--------|------------------------------|----------------------|------|
| POST   | `/api/auth/register`         | Register new user    | ❌   |
| POST   | `/api/auth/login`            | Login                | ❌   |
| GET    | `/api/auth/profile`          | Get own profile      | ✅   |
| PUT    | `/api/auth/profile`          | Update profile       | ✅   |
| PUT    | `/api/auth/change-password`  | Change password      | ✅   |

### Tasks
| Method | Endpoint                     | Description          | Auth |
|--------|------------------------------|----------------------|------|
| GET    | `/api/tasks`                 | Get all tasks        | ✅   |
| POST   | `/api/tasks`                 | Create task          | ✅   |
| GET    | `/api/tasks/:id`             | Get single task      | ✅   |
| PUT    | `/api/tasks/:id`             | Update task          | ✅   |
| DELETE | `/api/tasks/:id`             | Delete task          | ✅   |
| PATCH  | `/api/tasks/archive/:id`     | Toggle archive       | ✅   |
| PATCH  | `/api/tasks/favorite/:id`    | Toggle favorite      | ✅   |

#### Query Parameters (GET /api/tasks)
| Param        | Values                                         |
|--------------|------------------------------------------------|
| `search`     | Full-text search string                        |
| `status`     | `Pending`, `In Progress`, `Completed`          |
| `priority`   | `Low`, `Medium`, `High`                        |
| `category`   | `Work`, `College`, `Study`, `Personal`, etc.  |
| `archived`   | `true`, `false`                                |
| `favorite`   | `true`                                         |
| `sortBy`     | `createdAt`, `priority`, `deadline`, `title`   |
| `order`      | `asc`, `desc`                                  |

### Comments
| Method | Endpoint                     | Description          | Auth |
|--------|------------------------------|----------------------|------|
| POST   | `/api/comments/:taskId`      | Add comment          | ✅   |
| PUT    | `/api/comments/:commentId`   | Update comment       | ✅   |
| DELETE | `/api/comments/:commentId`   | Delete comment       | ✅   |

### Analytics
| Method | Endpoint          | Description      | Auth |
|--------|-------------------|------------------|------|
| GET    | `/api/analytics`  | Get all metrics  | ✅   |

---

## 🗄️ Database Schema

### User
```json
{
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Task
```json
{
  "userId": "ObjectId (ref: User)",
  "title": "String",
  "description": "String",
  "category": "Work | College | Study | Personal | Shopping | Others",
  "priority": "Low | Medium | High",
  "status": "Pending | In Progress | Completed",
  "favorite": "Boolean",
  "archived": "Boolean",
  "dueDate": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Comment
```json
{
  "taskId": "ObjectId (ref: Task)",
  "userId": "ObjectId (ref: User)",
  "comment": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 🔮 Future Scope

- [ ] Email notifications for due dates
- [ ] Team collaboration & task assignment
- [ ] File attachments
- [ ] Recurring tasks
- [ ] Time tracking
- [ ] Mobile app (React Native)
- [ ] AI-powered task prioritization
- [ ] Export to CSV/PDF
- [ ] Integrations: Slack, Google Calendar

---

## 🛡️ Security

- JWT authentication on all protected routes
- bcrypt password hashing (salt rounds: 12)
- express-validator input sanitization
- CORS restriction to frontend origin
- Environment variable secrets
- Authorization checks (users can only access their own data)

---

## 📸 Screenshots

> _Screenshots to be added after deployment_

---

## 👤 Author

Built as part of a Full Stack Engineering internship assessment.

---

## 📄 License

MIT License
