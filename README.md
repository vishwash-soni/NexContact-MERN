# NexContact

NexContact is a full-stack contact management web app built with the MERN stack. Users sign up with email OTP verification, log in securely, and manage a private address book: add, view, edit, delete and search contacts, with optional profile photos.

- **Frontend (Vercel):** https://nex-contact-mern.vercel.app
- **Backend (Render):** https://nexcontact-mern.onrender.com

## Features

- Email OTP verification during registration (6-digit code, 2-minute expiry)
- Resend OTP with limits (3 resends, then a 3-hour lock)
- Secure login with bcrypt-hashed passwords and JWT stored in an HTTP-only cookie (7-day expiry)
- Full contact CRUD (name, phone, email, notes, profile image)
- Profile image upload to Cloudinary (JPG/PNG/WEBP, max 5 MB)
- Search contacts by name (case-insensitive, regex-safe)
- Every contact is scoped to its owner, so users only ever see their own data
- Protected routes on the frontend and protected API endpoints on the backend
- Light/dark theme toggle
- Responsive UI with client-side form validation

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite, React Router v7, React Hook Form, Axios, React Icons, plain CSS |
| Backend | Node.js, Express 5, Mongoose 9, JWT, bcrypt, cookie-parser, cors, Multer |
| Database | MongoDB (Atlas) |
| Media storage | Cloudinary |
| Email | Brevo HTTPS API (production) / Gmail SMTP via Nodemailer (local) |
| Deployment | Vercel (frontend), Render (backend) |

## Project Structure

```
NexContact MERN/
├── backend/
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── coudinary.js         # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js    # register/OTP, verify, login, logout, resend
│   │   └── myDataController.js  # contact CRUD + search
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT cookie check (protect)
│   ├── models/
│   │   ├── User.js
│   │   ├── Contact.js
│   │   └── Email.js             # OTP records (EmailVerify)
│   ├── routes/
│   │   ├── authRouter.js        # /api/auth
│   │   └── myDataRouter.js      # /api/mydata
│   ├── utils/
│   │   ├── generateMessage.js   # builds + sends OTP email, saves OTP
│   │   ├── otpGenerate.js       # 6-digit OTP using crypto
│   │   └── sendEmail.js         # Brevo / Gmail provider switch
│   └── server.js                # app entry point
└── frontend/
    ├── public/                  # logo and images
    └── src/
        ├── api/axios.js         # shared Axios instance
        ├── components/          # ContactCard, InputContact, ProtectedRoute
        ├── context/             # AuthContext, ThemeContext
        ├── pages/               # Home, Login, Register, VerifyOTP,
        │                        # Contacts, ContactDetails, NotFound
        ├── styles/              # per-page CSS files
        ├── App.jsx              # routes
        └── main.jsx             # providers + render
```

## Prerequisites

- Node.js 18 or newer
- A MongoDB database (local or MongoDB Atlas)
- A Cloudinary account (for image uploads)
- Either a Brevo account (API key + verified sender) or a Gmail account with an App Password (for OTP emails)

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd "NexContact MERN"

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=your_long_random_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email: option 1 (production): Brevo
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=verified_sender@example.com

# Email: option 2 (local): Gmail SMTP (used when BREVO_API_KEY is not set)
GMAIL_USER=your_gmail_address
GMAIL_PASS=your_gmail_app_password
```

> If `BREVO_API_KEY` is set, Brevo is used. Otherwise the app falls back to Gmail.

### 3. Point the app at your local servers

Two values are currently hardcoded for the deployed setup, so change them for local development:

- `backend/server.js`: add your frontend origin to `allowedOrigins`, e.g. `http://localhost:5173`
- `frontend/src/api/axios.js`: set `baseURL` to `http://localhost:5000/api`

### 4. Run the app

```bash
# Terminal 1: backend
cd backend
npm run dev        # nodemon, or: npm start

# Terminal 2: frontend
cd frontend
npm run dev
```

Open http://localhost:5173.

## Available Scripts

**Backend**

| Command | Description |
|---------|-------------|
| `npm start` | Start the server with Node |
| `npm run dev` | Start with nodemon (auto-reload) |

**Frontend**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## API Overview

Base URL: `/api`

### Auth (`/api/auth`), public

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Send an OTP to the given email |
| POST | `/emailverification` | Verify OTP and create the account (`name`, `email`, `otp`, `password`) |
| POST | `/resendotp` | Resend OTP (only after the previous one has expired) |
| POST | `/login` | Log in; sets the `token` HTTP-only cookie |
| POST | `/logout` | Clear the auth cookie |

### Contacts (`/api/mydata`), login required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/getmycontact` | List all contacts of the logged-in user |
| POST | `/addcontact` | Create a contact (multipart form, optional `image`) |
| PUT | `/updatemycontact/:id` | Update a contact (multipart form, optional `image`) |
| DELETE | `/deletemycontact/:id` | Delete a contact |
| GET | `/searchcontact?search=` | Search the user's contacts by name |

## Frontend Routes

| Path | Page | Access |
|------|------|--------|
| `/` | Landing page | Public |
| `/login` | Login | Public |
| `/register` | Enter email | Public |
| `/verify-otp` | OTP + account details | Public |
| `/contacts` | Contact list and search | Protected |
| `/view` | Contact details | Protected |
| `/add-contact` | Add contact | Protected |
| `/update/:id` | Edit contact | Protected |

## Deployment Notes

- Backend runs on Render with `NODE_ENV=production`. Cookies are then set with `secure: true` and `sameSite: "none"` so they work across the Vercel and Render domains.
- Render blocks SMTP ports, so production email goes through the Brevo HTTPS API.
- Set all backend environment variables in the Render dashboard.

## License

ISC (as declared in `backend/package.json`).
