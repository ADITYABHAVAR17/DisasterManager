# File Upload Troubleshooting Guide

## Issue: Uploaded Images Not Working vs Captured Images Working

### Debugging Steps

#### 1. **Test the Upload Endpoint**
Use the new test endpoint to isolate the issue:
```bash
# Test with curl
curl -X POST http://localhost:5000/api/reports/test-upload \
  -F "media=@path/to/your/image.jpg"
```

#### 2. **Check Browser Console**
Open browser dev tools and check console for:
- FormData contents
- File properties (type, size)
- Network request details
- Error messages

#### 3. **Check Backend Logs**
Monitor the backend console for:
- Multer file filter logs
- Request body and file objects
- Cloudinary upload status
- Any error messages

### Common Issues & Solutions

#### **File Type Issues**
- **Problem**: File MIME type not recognized
- **Solution**: Check if the uploaded file has correct MIME type
- **Fix**: Updated multer fileFilter to handle more MIME types

#### **File Size Issues**
- **Problem**: File too large for upload
- **Solution**: Added 10MB file size limit
- **Check**: Verify file size before upload

#### **FormData Issues**
- **Problem**: File not properly appended to FormData
- **Solution**: Enhanced debugging in frontend handleSubmit
- **Check**: Console logs show FormData entries

#### **Cloudinary Configuration**
- **Problem**: Cloudinary not accepting file format
- **Solution**: Added `resource_type: "auto"` to auto-detect
- **Check**: Verify Cloudinary credentials in .env

### File Upload Flow

#### **Frontend (Captured Images)**
1. Camera captures canvas → blob
2. Convert blob to File object with proper MIME type
3. Append to FormData as "media"
4. Send via axios POST

#### **Frontend (Uploaded Files)**
1. User selects file via input
2. File object from input.files[0]
3. Validate file type and size
4. Append to FormData as "media"
5. Send via axios POST

#### **Backend Processing**
1. Multer middleware processes multipart/form-data
2. File filter validates file type
3. CloudinaryStorage uploads to Cloudinary
4. File path stored in req.file.path
5. Report saved with mediaUrl

### Enhanced Error Handling

#### **Frontend Changes**
- Added file type validation
- Added file size validation (10MB limit)
- Enhanced console logging
- Better error messages from server

#### **Backend Changes**
- Added debug logging in createReport
- Enhanced multer configuration
- Added test upload endpoint
- Improved error handling in AI verification

### Debugging Commands

#### **Test Upload Endpoint**
```javascript
// Frontend test
const testFormData = new FormData();
testFormData.append("media", selectedFile);

fetch("http://localhost:5000/api/reports/test-upload", {
  method: "POST",
  body: testFormData
})
.then(r => r.json())
.then(console.log);
```

#### **Check File Properties**
```javascript
// In browser console
console.log("File:", file);
console.log("Type:", file.type);
console.log("Size:", file.size);
console.log("Name:", file.name);
```

### Expected Behavior

#### **Working Upload Should Show**
1. Console: "File selected: [File object]"
2. Console: "Appending media file: [File object]"
3. Backend: "Request file: [multer file object]"
4. Success: Report created with mediaUrl

#### **Failed Upload Might Show**
1. Console: File validation errors
2. Network: 400/500 error responses
3. Backend: Missing req.file or multer errors
4. Cloudinary: Upload failures

### Next Steps

1. **Check console logs** during upload attempt
2. **Test with different file types** (JPEG, PNG, MP4)
3. **Try the test endpoint** to isolate the issue
4. **Verify Cloudinary settings** in backend config
5. **Check file permissions** and CORS settings

The enhanced debugging should help identify exactly where the upload is failing.