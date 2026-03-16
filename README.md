# 📚 Book Video Upload Platform

A beautiful, full-featured web application where book authors can upload videos for each chapter of their book with a stunning orange and black UI.

![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![License](https://img.shields.io/badge/License-MIT-orange)

## Features

✨ **Authentication** - Secure author registration and login with JWT tokens
📖 **Chapter Management** - Create, edit, and delete book chapters
🎬 **Video Uploads** - Upload, preview, and manage chapter videos
📊 **Progress Tracking** - Real-time upload progress indicators
🎨 **Beautiful UI** - Modern orange and black responsive design
💾 **Local Storage** - SQLite database + local file system
🚀 **Full Stack** - React frontend + Node.js/Express backend

## Project Structure

```
book-video-upload/
├── server/                    # Express.js backend
│   ├── index.js              # Main server file
│   ├── package.json          # Server dependencies
│   ├── .env.example          # Environment variables template
│   ├── uploads/              # Video storage directory
│   └── data.db               # SQLite database (created on first run)
│
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html            # HTML template
│   ├── vite.config.js        # Vite configuration
│   └── package.json          # React dependencies
│
├── package.json              # Root dependencies (concurrently)
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Installation

### Prerequisites

- **Node.js** v14+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)

### Step 1: Install Dependencies

Open PowerShell in the project root and run:

```powershell
npm run install:all
```

This will install dependencies for the root, server, and client folders.

**Or manually install each:**

```powershell
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Set Up Environment Variables

#### Server Configuration

In the `server/` folder, copy `.env.example` to `.env`:

```powershell
cd server
Copy-Item .env.example .env
```

Edit `server/.env` with your settings:

```
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

### Step 3: Start the Application

From the **project root**, run both servers with a single command:

```powershell
npm run dev
```

This uses `concurrently` to start:

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

#### Starting Servers Separately

If you prefer to run them in separate terminals:

**Terminal 1 - Backend:**

```powershell
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```powershell
cd client
npm run dev
```

## First Usage

### 1. Create an Account

- Open http://localhost:3000 in your browser
- Click "Sign Up"
- Fill in:
  - **Author Name**: Your name
  - **Book Title**: Your book title
  - **Email**: Any email address
  - **Password**: Create a password
- Click "Create Account"

### 2. Log In

- Use your email and password from registration
- You'll be taken to the dashboard

### 3. Add a Chapter

- Click **"➕ Add Chapter"**
- Fill in:
  - **Chapter Number**: 1, 2, 3, etc.
  - **Chapter Title**: e.g., "The Beginning"
  - **Description**: Optional chapter summary
- Click "Create Chapter"

### 4. Upload a Video

- Click **"📤 Upload Video"** on any chapter card
- Select a video file (mp4, webm, etc.)
- Watch the progress bar as it uploads
- Video will be playable in the chapter card once uploaded

### 5. Edit or Delete

- Use **✏️** button to edit chapter details
- Use **🗑️** button to delete a chapter and its video

## Demo Credentials

For quick testing without creating an account:

```
Email:    test@example.com
Password: test123
```

_Note: This account is auto-created on first server start if it doesn't exist._

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new author account
- `POST /api/auth/login` - Log in
- `GET /api/auth/me` - Get current author (requires token)

### Chapters

- `GET /api/chapters` - Get all chapters
- `POST /api/chapters` - Create new chapter
- `PUT /api/chapters/:id` - Update chapter
- `DELETE /api/chapters/:id` - Delete chapter

### Videos

- `POST /api/chapters/:id/video` - Upload video for chapter

All endpoints (except auth register/login) require `Authorization: Bearer <token>` header.

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is in use:

**Change Server Port:**
Edit `server/.env`:

```
PORT=5001
```

**Change Client Port:**
Edit `client/vite.config.js`:

```javascript
server: {
  port: 3001,
  host: true,
}
```

### Database Issues

If you get database errors:

```powershell
# Delete the old database
Remove-Item server/data.db

# Restart the server - database will be recreated
cd server
npm run dev
```

### CORS Errors

Make sure:

1. Backend is running on port 5000
2. Frontend is running on port 3000
3. Check `server/index.js` CORS configuration

### Video Won't Upload

- Check file size (max 500MB)
- Ensure format is a video file (mp4, webm, mov, etc.)
- Check `server/uploads/` folder exists
- Check browser console for error details

## Building for Production

### Build Frontend

```powershell
cd client
npm run build
```

Creates optimized files in `client/dist/`

### Build Server

The server is already production-ready. Just set environment variables:

```powershell
cd server
$env:NODE_ENV = "production"
$env:JWT_SECRET = "your-strong-secret-key"
npm run start
```

## Environment Variables Reference

### Server `.env`

| Variable   | Default            | Description            |
| ---------- | ------------------ | ---------------------- |
| PORT       | 5000               | Server port            |
| JWT_SECRET | (required in prod) | Token signing secret   |
| NODE_ENV   | development        | development/production |

## File Upload Location

Videos are stored in:

```
server/uploads/
```

They are served via:

```
http://localhost:5000/uploads/filename.mp4
```

## Database

SQLite database `server/data.db` contains:

**Authors Table**

- id, email, password_hash, book_title, author_name, created_at

**Chapters Table**

- id, author_id, title, description, chapter_number, video_filename, video_url, created_at

## Technology Stack

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **CSS3** - Styling with CSS modules

### Backend

- **Express.js** - Web framework
- **MultiPart/multer** - File uploads
- **SQLite3** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## Security Notes

⚠️ **Important for Production:**

1. **Change JWT_SECRET** - Use a strong random string

   ```powershell
   $env:JWT_SECRET = ([System.Guid]::NewGuid()).ToString()
   ```

2. **Use HTTPS** - Deploy with SSL/TLS

3. **Database** - Move to PostgreSQL/MySQL

4. **File Storage** - Use cloud storage (AWS S3, Azure Blob, etc.)

5. **Environment** - Never commit `.env` to git

## License

MIT License - Feel free to use and modify!

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review the API endpoints documentation
3. Verify all dependencies are installed
4. Check browser console for error messages
5. Check server logs for backend errors

---

**Happy uploading! 🎬📚**
