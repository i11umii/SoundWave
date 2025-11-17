# 🎵 SoundWave - Music Streaming Platform

Full-stack music streaming application built with React, Node.js, Express, and MongoDB.

## 📋 Features

### 🎧 Core Features
- **User Authentication** - JWT-based secure login/registration
- **Playlist Management** - Create, edit, delete playlists
- **Music Player** - Global audio player with controls
- **Artist Pages** - Detailed artist information and discography
- **User Profiles** - Personal stats and listening history
- **Track Management** - Like songs, add to playlists

### 🎨 UI/UX
- Fully responsive design (mobile, tablet, desktop)
- Modern dark theme with gradients
- Smooth animations and transitions
- TailwindCSS styling
- FontAwesome icons

### 🔒 Security
- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- CORS configuration
- Input validation

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **FontAwesome** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
soundwave/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # API services
│   │   ├── utils/         # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Backend Node.js app
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── seeds/             # Database seeding
│   ├── server.js
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd soundwave
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../client
npm install
```

4. **Configure Environment Variables**

Create a `.env` file in the `server` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/soundwave

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:5173
```

5. **Start MongoDB**

Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
net start MongoDB
```

6. **Seed the Database**

Populate the database with initial data:
```bash
cd server
npm run seed
```

This will create:
- Demo user (email: demo@soundwave.com, password: demo123)
- Sample artists (The Midnight, FM-84, Dua Lipa, The Weeknd, Ed Sheeran)
- Sample tracks
- Sample playlists

7. **Start Backend Server**
```bash
cd server
npm run server
```

Backend will run on `http://localhost:5000`

8. **Start Frontend Development Server**

In a new terminal:
```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:5173`

9. **Open the Application**

Navigate to `http://localhost:5173` in your browser

## 🔐 Demo Credentials

```
Email: demo@soundwave.com
Password: demo123
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/me` - Get user profile (protected)
- `PATCH /api/users/me` - Update user profile (protected)
- `GET /api/users/stats` - Get user statistics (protected)

### Playlists
- `GET /api/playlists` - Get all user playlists (protected)
- `GET /api/playlists/:id` - Get single playlist (protected)
- `POST /api/playlists` - Create playlist (protected)
- `DELETE /api/playlists/:id` - Delete playlist (protected)
- `POST /api/playlists/:id/tracks` - Add track to playlist (protected)
- `DELETE /api/playlists/:id/tracks/:trackId` - Remove track (protected)

### Artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get single artist
- `POST /api/artists/:id/follow` - Follow artist (protected)
- `DELETE /api/artists/:id/follow` - Unfollow artist (protected)

### Tracks
- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/:id` - Get single track
- `POST /api/tracks/:id/like` - Like track (protected)
- `DELETE /api/tracks/:id/like` - Unlike track (protected)

## 🎯 Key Features Implementation

### Global Music Player
- Zustand store for player state management
- Audio API integration
- Play, pause, next, previous controls
- Volume control
- Progress bar with seek functionality
- Persistent across page navigation

### Authentication Flow
- JWT token stored in localStorage
- Automatic token inclusion in API requests
- Protected routes redirect to login
- Logout clears token and state

### Playlist Management
- Create custom playlists with icons and colors
- Add/remove tracks
- View playlist details
- Delete playlists

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interface
- Adaptive layouts

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Or check service status
brew services list  # macOS
sudo systemctl status mongod  # Linux
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill

# Kill process on port 5173
lsof -ti:5173 | xargs kill
```

### CORS Errors
- Ensure `CLIENT_URL` in `.env` matches your frontend URL
- Check that CORS middleware is properly configured

## 🔄 Development Workflow

### Backend Development
```bash
cd server
npm run server  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd client
npm run dev  # Hot module replacement
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
# Build output in client/dist
```

**Backend:**
- Set `NODE_ENV=production` in `.env`
- Use process manager like PM2 or Docker

## 📝 Available Scripts

### Backend (server/)
- `npm run server` - Start dev server with nodemon
- `npm run seed` - Seed database with sample data
- `npm start` - Start production server

### Frontend (client/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎨 Customization

### Adding New Colors
Edit `client/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      'custom-color': '#hexcode'
    }
  }
}
```

### Adding New Icons
Icons are from FontAwesome. Browse available icons at [fontawesome.com](https://fontawesome.com/icons)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the client: `npm run build`
2. Deploy the `client/dist` folder
3. Set environment variable: `VITE_API_URL=your-backend-url`

### Backend (Heroku/Railway/Render)
1. Set environment variables
2. Deploy from `server/` directory
3. Ensure MongoDB Atlas is configured

### MongoDB Atlas
1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in `.env`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👥 Authors

- Your Name (@i11umii)

## 🙏 Acknowledgments

- Design inspired by Spotify and Apple Music
- Images from Unsplash
- Icons from FontAwesome

## 📞 Support

For support, email support@soundwave.com or create an issue in the repository.

---

Made with ❤️ and 🎵 by SoundWave Team
```

### 25. Package.json для root (опционально)

````json name=package.json
{
  "name": "soundwave",
  "version": "1.0.0",
  "description": "Full-stack music streaming platform",
  "scripts": {
    "install-all": "cd server && npm install && cd ../client && npm install",
    "dev": "concurrently \"cd server && npm run server\" \"cd client && npm run dev\"",
    "seed": "cd server && npm run seed"
  },
  "keywords": ["music", "streaming", "react", "nodejs", "mongodb"],
  "author": "i11umii",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}