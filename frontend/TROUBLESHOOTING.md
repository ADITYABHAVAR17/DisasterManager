# Troubleshooting Guide

## Error: `data.filter is not a function` / `reports.map is not a function`

### Problem
The application was encountering errors when trying to display the admin dashboard and live map because:

1. **API Response Format**: The backend API might not be returning an array as expected
2. **Server Connection**: The backend server might not be running
3. **Network Issues**: Connection to localhost:5000 might be failing

### Solutions Implemented

#### 1. **Data Validation**
Added checks to ensure data is always an array:
```javascript
const reportsArray = Array.isArray(data) ? data : [];
setReports(reportsArray);
```

#### 2. **Safe Mapping**
Protected all map operations:
```javascript
{Array.isArray(reports) && reports.map((report) => (
  // Component code
))}
```

#### 3. **Error Boundaries**
Added error boundary components to catch and handle rendering errors gracefully.

#### 4. **Better Error Handling**
Implemented proper error states with user-friendly messages and retry functionality.

#### 5. **Safe Property Access**
Added optional chaining for nested properties:
```javascript
{report.location?.lat?.toFixed(4) || 'N/A'}
```

### How to Fix Backend Issues

#### Start the Backend Server
```bash
cd backend
npm install
npm start
```

#### Verify API Endpoint
Test if the API is working:
```bash
curl http://localhost:5000/api/reports
```

Expected response should be an array:
```json
[
  {
    "_id": "...",
    "name": "John Doe",
    "disasterType": "Fire",
    "description": "...",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "verified": false,
    "createdAt": "2025-10-11T..."
  }
]
```

### Backend Troubleshooting

#### Check if MongoDB is Running
Make sure your MongoDB connection is working in `backend/config/db.js`

#### Verify Environment Variables
Ensure `.env` file exists with:
```
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MONGO_URI=...
```

#### Common Backend Issues
1. **Port already in use**: Change port in server.js
2. **CORS issues**: Verify CORS configuration
3. **Database connection**: Check MongoDB connection string
4. **Missing dependencies**: Run `npm install` in backend folder

### Testing the Application

1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Test API**: Visit `http://localhost:5000/api/reports`
4. **Test Frontend**: Visit `http://localhost:5173`

The application now handles these errors gracefully and provides helpful error messages to users.