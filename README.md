# 📚 RPS Management System

> Modern web-based RPS (Rencana Pembelajaran Semester) Management System for Indonesian Higher Education Institutions

Full-stack application with **React (Vite)** frontend and **Express.js** backend, featuring organizational hierarchy management, role-based access control, cross-faculty lecturer assignments, and comprehensive curriculum planning tools.

---

## 🌟 Key Features

### Organizational Hierarchy
- **3-Level Structure**: Institut → Fakultas → Program Studi
- Multi-faculty and multi-program support
- Hierarchical access control

### Role-Based Access Control (RBAC)
- **5 User Roles**: Admin Institusi, Dekan, Kaprodi, Dosen, Mahasiswa
- Granular permissions per organizational level
- Resource ownership verification

### Cross-Faculty Management
- **Lecturer Assignments**: Assign lecturers across faculties
- Smart categorization (same-prodi → same-fakultas → cross-faculty)
- Flexible assignment workflow

### RPS Workflow
- **Template & Instance Pattern**: Master templates by Kaprodi, instances by Dosen
- **Approval Workflow**: Draft → Submit → Approve/Reject
- Version control and revision tracking

### Curriculum Management
- **Multi-level CPL**: Institut, Fakultas, and Prodi level learning outcomes
- CPMK and Sub-CPMK management
- Bahan Kajian (study materials) integration

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite**
- **Zustand** for state management
- **TailwindCSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** database
- **Sequelize** ORM
- **JWT** authentication
- **bcrypt** for password hashing

---

## 📁 Project Structure

```
rps/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── stores/      # Zustand stores
│   │   └── App.jsx      # Main app component
│   └── package.json
│
├── server/              # Express backend
│   ├── controllers/     # API controllers
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── seeds/           # Database seeders
│   └── server.js        # Main server file
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rps
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup Database**
   ```bash
   # Create PostgreSQL database
   createdb rps_maker_db
   
   # Run seeders
   npm run seed
   ```

4. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

**Development Mode:**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api

### Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin Institusi | `admin_mahardika` | `password123` |
| Dekan Teknik | `dekan_teknik` | `password123` |
| Kaprodi IF | `kaprodi_informatika` | `password123` |
| Dosen | `dosen_andi` | `password123` |

---

## 📚 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Available Endpoints

**Authentication**
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update profile

**Organization**
- `GET /organization/institusi` - Get institution info
- `GET /organization/fakultas` - List faculties
- `GET /organization/prodi` - List study programs

**Dashboard**
- `GET /dashboard/stats` - Role-specific statistics

**Lecturer Assignments**
- `GET /lecturer-assignments` - List assignments
- `GET /lecturer-assignments/available-lecturers` - Get assignable lecturers
- `POST /lecturer-assignments` - Create assignment
- `PUT /lecturer-assignments/:id` - Update assignment
- `DELETE /lecturer-assignments/:id` - Delete assignment

**RPS**
- `GET /rps` - List RPS (role-filtered)
- `GET /rps/:id` - Get RPS details
- `POST /rps` - Create RPS
- `PUT /rps/:id` - Update RPS
- `PUT /rps/:id/submit` - Submit for approval
- `PUT /rps/:id/approve` - Approve RPS
- `PUT /rps/:id/reject` - Reject RPS
- `DELETE /rps/:id` - Delete RPS

**Curriculum**
- `GET /curriculum/cpl` - List learning outcomes
- `GET /curriculum/cpmk` - List course outcomes
- `GET /curriculum/bahan-kajian` - List study materials

---

## 🗄️ Database Schema

**Core Tables:**
- `institusi` - Institution
- `fakultas` - Faculties
- `prodi` - Study Programs
- `users` - All users (multi-role)
- `dosen_assignments` - Lecturer assignments
- `mata_kuliah` - Courses
- `cpl` - Learning outcomes (multi-level)
- `rps` - RPS templates & instances
- `rps_pertemuan` - Weekly schedules

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin Institusi** | Full system access, manage all organizational units |
| **Dekan** | Manage faculty, assign lecturers, approve RPS in faculty |
| **Kaprodi** | Manage prodi, assign lecturers, create RPS templates, approve RPS |
| **Dosen** | Create RPS instances, manage own courses |
| **Mahasiswa** | View courses and RPS (read-only) |

---

## 🔐 Environment Variables

**Server `.env`:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rps_maker_db
DB_USER=your_user
DB_PASSWORD=your_password

# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Client URL
CLIENT_URL=http://localhost:5173
```

---

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

---

## 📦 Deployment

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
# Deploy dist/ folder to static hosting
```

---

## 🤝 Contributing

This project is developed for Institut Mahardika. For contributions or modifications, please contact the development team.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏫 About Institut Mahardika

Institut Teknologi dan Kesehatan Mahardika is a higher education institution committed to excellence in technology and health sciences education.

**Website:** https://mahardika.ac.id

---

## 📞 Support

For issues, questions, or support, please contact:
- Email: info@mahardika.ac.id
- GitHub Issues: [Create an issue](<repository-url>/issues)

---

**Built with ❤️ for Indonesian Higher Education**
