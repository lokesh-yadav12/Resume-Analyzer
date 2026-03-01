# Career Boost AI - Quick Start Guide

## 🚀 Start the Application

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend will run on: http://localhost:5000

### 2. Start ML Service
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```
ML Service will run on: http://localhost:5001

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: http://localhost:5173

## ✅ Verify Everything Works

### Test Backend
```bash
cd backend
node test-endpoints.js
```

### Test Frontend
1. Open http://localhost:5173
2. Sign up with a new account
3. Go to Profile page - should show your data ✅
4. Upload a resume
5. Go to Job Recommendations - should show matches ✅

## 🎯 Key Features to Test

### 1. Profile Management
- Navigate to `/profile`
- View your profile information
- Toggle notification preferences
- Click "Save Changes"
- Refresh page - settings should persist

### 2. Resume Analysis
- Navigate to `/resume-analyzer`
- Upload a PDF/DOCX/TXT resume
- Wait for analysis
- View ATS score and breakdown

### 3. Job Recommendations
- Navigate to `/job-recommendations`
- View personalized job matches
- See match percentages
- Filter jobs by preferences
- Save favorite jobs

## 🔧 Configuration

### Demo Mode (Default)
- No database required
- Returns mock data
- Perfect for testing
- Set in `backend/.env`: `DEMO_MODE=true`

### Production Mode
- Requires MongoDB
- Real data persistence
- Set in `backend/.env`: `DEMO_MODE=false`
- Configure `MONGODB_URI`

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/career-boost-ai
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:5001
DEMO_MODE=true
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is available
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID> /F

# Restart backend
npm run dev
```

### Frontend shows errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Profile page shows "Failed to load"
- Check if backend is running
- Check browser console for errors
- Verify DEMO_MODE is enabled
- Check if you're logged in

### Job recommendations empty
- Upload a resume first
- Check if ML service is running
- Verify backend can connect to ML service

## 📊 API Testing

### Using cURL

**Get Profile**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Job Recommendations**
```bash
curl -X GET http://localhost:5000/api/jobs/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Preferences**
```bash
curl -X PUT http://localhost:5000/api/auth/profile/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notifications":{"email":true,"jobAlerts":false}}'
```

## 🎓 User Flow

1. **Sign Up** → Create account
2. **Verify Email** → Check inbox (demo mode skips this)
3. **Upload Resume** → Go to Resume Analyzer
4. **View ATS Score** → See compatibility score
5. **Get Recommendations** → View personalized jobs
6. **Update Profile** → Set preferences
7. **Save Jobs** → Bookmark interesting positions

## 📱 Features Overview

### ✅ Working Features
- User authentication (signup, login, logout)
- Profile management (view, update)
- Preference settings (notifications)
- Resume upload and analysis
- ATS compatibility scoring
- Skill extraction
- Job recommendations
- Job search and filters
- Save/unsave jobs

### 🚧 Coming Soon
- Application tracking
- Learning recommendations
- AI chatbot
- Advanced analytics
- Email notifications
- Social sharing

## 🔐 Security Notes

- Passwords are hashed with bcrypt
- JWT tokens expire after 15 minutes
- Refresh tokens valid for 7 days
- Rate limiting enabled
- CORS configured
- Input validation active

## 📈 Performance Tips

1. **Enable Caching**: Set up Redis for better performance
2. **Optimize Images**: Use WebP format
3. **Code Splitting**: Already implemented
4. **Lazy Loading**: Components load on demand
5. **Database Indexing**: Indexes on frequently queried fields

## 🎯 Next Steps

1. ✅ Test all features
2. ✅ Verify data persistence
3. ✅ Check error handling
4. 📝 Customize branding
5. 🚀 Deploy to production

## 📞 Need Help?

- Check `FIXES_APPLIED.md` for recent changes
- Review `PRODUCTION_READY_SUMMARY.md` for complete guide
- Check browser console for errors
- Review backend logs
- Verify all services are running

---

**Quick Links**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- ML Service: http://localhost:5001
- API Docs: http://localhost:5000/health

🎉 **Happy Coding!**
