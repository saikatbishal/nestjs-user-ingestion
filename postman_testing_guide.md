# 📋 Postman API Testing Guide

**NestJS User & Document Management API**  
**Version:** 1.0.0  
**Base URL:** `http://localhost:3000`  
**Date:** July 20, 2025

---

## 🚀 Quick Setup

### **1. Environment Setup**

Create a new Postman environment with these variables:

```
base_url: http://localhost:3000
jwt_token: (will be set after login)
user_id: (will be set after registration)
document_id: (will be set after document creation)
process_id: (will be set after ingestion trigger)
```

### **2. Collection Structure**

```
📁 NestJS API Tests
├── 📁 0. Health Check
├── 📁 1. Authentication
├── 📁 2. User Management (Admin Only)
├── 📁 3. Document Management
└── 📁 4. Ingestion Management
```

---

## 🏥 0. Health Check

### **0.1 Root Endpoint**

```http
GET {{base_url}}
```

**Expected Response:**

```json
{
  "message": "NestJS User & Document Management API",
  "version": "1.0.0",
  "endpoints": {
    "swagger": "/api",
    "auth": {
      "register": "POST /auth/register",
      "login": "POST /auth/login",
      "logout": "POST /auth/logout",
      "refresh": "POST /auth/refresh",
      "request-password-reset": "POST /auth/request-password-reset",
      "reset-password": "POST /auth/reset-password"
    },
    "users": "GET /users",
    "documents": "GET /documents",
    "ingestion": "GET /ingestion"
  }
}
```

### **0.2 Health Check**

```http
GET {{base_url}}/health
```

**Expected Response:**

```json
{
  "status": "OK",
  "timestamp": "2025-07-20T14:30:00.000Z"
}
```

### **0.3 Swagger Documentation**

```http
GET {{base_url}}/api
```

Opens Swagger UI in browser for interactive API documentation.

---

## 🔐 1. Authentication APIs

### **1.1 Register Admin User**

```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin User",
  "role": "admin"
}
```

**Expected Response:**

```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",
  "createdAt": "2025-07-20T14:30:00.000Z"
}
```

**Post-Response Script:**

```javascript
// Save user_id for later use
if (pm.response.code === 201) {
  const responseJson = pm.response.json();
  pm.environment.set("user_id", responseJson.id);
}
```

### **1.2 Register Editor User**

```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "email": "editor@example.com",
  "password": "password123",
  "name": "Editor User",
  "role": "editor"
}
```

### **1.3 Register Viewer User**

```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "email": "viewer@example.com",
  "password": "password123",
  "name": "Viewer User",
  "role": "viewer"
}
```

### **1.4 Login as Admin**

```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Expected Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "def50200...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Post-Response Script:**

```javascript
// Save JWT token for authorization
if (pm.response.code === 200) {
  const responseJson = pm.response.json();
  pm.environment.set("jwt_token", responseJson.accessToken);
}
```

### **1.5 Login as Editor**

```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "editor@example.com",
  "password": "password123"
}
```

### **1.6 Refresh Token**

```http
POST {{base_url}}/auth/refresh
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

### **1.7 Request Password Reset**

```http
POST {{base_url}}/auth/request-password-reset
Content-Type: application/json

{
  "email": "admin@example.com"
}
```

### **1.8 Reset Password**

```http
POST {{base_url}}/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

### **1.9 Logout**

```http
POST {{base_url}}/auth/logout
Authorization: Bearer {{jwt_token}}
```

**Expected Response:**

```json
{
  "message": "Logged out (client should delete token)"
}
```

---

## 👥 2. User Management APIs (Admin Only)

> **⚠️ Important:** All endpoints require Admin role and valid JWT token

### **2.1 Get All Users**

```http
GET {{base_url}}/users
Authorization: Bearer {{jwt_token}}
```

**Expected Response:**

```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "createdAt": "2025-07-20T14:30:00.000Z",
    "updatedAt": "2025-07-20T14:30:00.000Z"
  },
  {
    "id": 2,
    "email": "editor@example.com",
    "name": "Editor User",
    "role": "editor",
    "createdAt": "2025-07-20T14:31:00.000Z",
    "updatedAt": "2025-07-20T14:31:00.000Z"
  }
]
```

### **2.2 Get User by ID**

```http
GET {{base_url}}/users/{{user_id}}
Authorization: Bearer {{jwt_token}}
```

### **2.3 Update User Role**

```http
PUT {{base_url}}/users/2/role
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "role": "viewer"
}
```

**Expected Response:**

```json
{
  "id": 2,
  "email": "editor@example.com",
  "name": "Editor User",
  "role": "viewer",
  "updatedAt": "2025-07-20T14:35:00.000Z"
}
```

### **2.4 Delete User**

```http
DELETE {{base_url}}/users/3
Authorization: Bearer {{jwt_token}}
```

**Expected Response:**

```json
{
  "message": "User deleted successfully"
}
```

**Error Scenarios:**

- **404 Not Found:** User doesn't exist
- **403 Forbidden:** Insufficient permissions
- **409 Conflict:** User has associated records

---

## 📄 3. Document Management APIs

> **📝 Note:** GET operations allow all roles, CUD operations require Admin/Editor roles

### **3.1 Get All Documents**

```http
GET {{base_url}}/documents
Authorization: Bearer {{jwt_token}}
```

**Expected Response:**

```json
[
  {
    "id": 1,
    "title": "Sample Document",
    "content": "This is sample content",
    "type": "text/plain",
    "filePath": null,
    "size": 19,
    "owner": null,
    "createdAt": "2025-07-20T14:30:00.000Z",
    "updatedAt": "2025-07-20T14:30:00.000Z"
  }
]
```

### **3.2 Get Document by ID**

```http
GET {{base_url}}/documents/{{document_id}}
Authorization: Bearer {{jwt_token}}
```

### **3.3 Create Text Document**

```http
POST {{base_url}}/documents
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "title": "Sample Document",
  "content": "This is a sample document content for testing purposes.",
  "type": "text/plain"
}
```

**Expected Response:**

```json
{
  "id": 1,
  "title": "Sample Document",
  "content": "This is a sample document content for testing purposes.",
  "type": "text/plain",
  "filePath": null,
  "size": 55,
  "owner": null,
  "createdAt": "2025-07-20T14:30:00.000Z",
  "updatedAt": "2025-07-20T14:30:00.000Z"
}
```

**Post-Response Script:**

```javascript
// Save document_id for later use
if (pm.response.code === 201) {
  const responseJson = pm.response.json();
  pm.environment.set("document_id", responseJson.id);
}
```

### **3.4 Create PDF Document**

```http
POST {{base_url}}/documents
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "title": "Company Policy PDF",
  "type": "application/pdf",
  "filePath": "/uploads/policy.pdf"
}
```

### **3.5 Upload Document File**

```http
POST {{base_url}}/documents/upload
Authorization: Bearer {{jwt_token}}
Content-Type: multipart/form-data

[Body]
form-data:
- key: file
- value: [Select File] (e.g., sample.pdf, document.txt, etc.)
```

**Expected Response:**

```json
{
  "id": 2,
  "title": "sample.pdf",
  "content": null,
  "type": "application/pdf",
  "filePath": "./uploads/1721486400000-sample.pdf",
  "size": 12543,
  "owner": null,
  "createdAt": "2025-07-20T14:30:00.000Z",
  "updatedAt": "2025-07-20T14:30:00.000Z"
}
```

### **3.6 Update Document**

```http
PUT {{base_url}}/documents/{{document_id}}
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "title": "Updated Document Title",
  "content": "Updated content for the document with more information."
}
```

**Expected Response:**

```json
{
  "id": 1,
  "title": "Updated Document Title",
  "content": "Updated content for the document with more information.",
  "type": "text/plain",
  "size": 63,
  "updatedAt": "2025-07-20T14:35:00.000Z"
}
```

### **3.7 Delete Document**

```http
DELETE {{base_url}}/documents/{{document_id}}
Authorization: Bearer {{jwt_token}}
```

**Expected Response:**

```json
{
  "message": "Document deleted successfully"
}
```

---

## ⚙️ 4. Ingestion Management APIs

> **🔄 Purpose:** Orchestrate document processing workflows

### **4.1 Trigger Full System Ingestion**

```http
POST {{base_url}}/ingestion/trigger
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "type": "full_ingestion",
  "description": "Full system ingestion - reprocess all documents",
  "parameters": {
    "batchSize": 100,
    "priority": "high",
    "includeMetadata": true
  }
}
```

**Expected Response:**

```json
{
  "id": 1,
  "type": "full_ingestion",
  "status": "pending",
  "documentIds": [],
  "description": "Full system ingestion - reprocess all documents",
  "parameters": {
    "batchSize": 100,
    "priority": "high",
    "includeMetadata": true
  },
  "error": null,
  "document": null,
  "startedAt": "2025-07-20T14:30:00.000Z",
  "completedAt": null,
  "createdAt": "2025-07-20T14:30:00.000Z",
  "updatedAt": "2025-07-20T14:30:00.000Z"
}
```

**Post-Response Script:**

```javascript
// Save process_id for later use
if (pm.response.code === 201) {
  const responseJson = pm.response.json();
  pm.environment.set("process_id", responseJson.id);
}
```

### **4.2 Trigger Document-Specific Ingestion**

```http
POST {{base_url}}/ingestion/trigger
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "type": "document_specific",
  "documentIds": [1, 2, 3],
  "description": "Process specific documents after upload",
  "parameters": {
    "extractText": true,
    "generateThumbnails": true,
    "createSearchIndex": true
  }
}
```

### **4.3 Trigger Incremental Ingestion**

```http
POST {{base_url}}/ingestion/trigger
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "type": "incremental_ingestion",
  "description": "Process only new/updated documents",
  "parameters": {
    "sinceDate": "2025-07-20T00:00:00.000Z",
    "includeDeleted": false
  }
}
```

### **4.4 Get All Ingestion Processes**

```http
GET {{base_url}}/ingestion/processes
Authorization: Bearer {{jwt_token}}
```

**Expected Response:**

```json
[
  {
    "id": 1,
    "type": "full_ingestion",
    "status": "completed",
    "documentIds": [],
    "description": "Full system ingestion - reprocess all documents",
    "parameters": {
      "batchSize": 100,
      "priority": "high"
    },
    "error": null,
    "startedAt": "2025-07-20T14:30:00.000Z",
    "completedAt": "2025-07-20T14:30:05.000Z",
    "createdAt": "2025-07-20T14:30:00.000Z",
    "updatedAt": "2025-07-20T14:30:05.000Z"
  },
  {
    "id": 2,
    "type": "document_specific",
    "status": "running",
    "documentIds": [1, 2, 3],
    "description": "Process specific documents",
    "startedAt": "2025-07-20T14:31:00.000Z",
    "completedAt": null
  }
]
```

### **4.5 Get Ingestion Process by ID**

```http
GET {{base_url}}/ingestion/processes/{{process_id}}
Authorization: Bearer {{jwt_token}}
```

### **4.6 Webhook Endpoint (No Auth Required)**

```http
POST {{base_url}}/ingestion/webhook
Content-Type: application/json

{
  "type": "ingestion_complete",
  "processId": 1,
  "status": "success",
  "timestamp": "2025-07-20T14:30:05.000Z",
  "metadata": {
    "documentsProcessed": 150,
    "duration": "5.2s",
    "source": "external_processor"
  }
}
```

**Expected Response:**

```json
{
  "message": "Webhook processed successfully"
}
```

### **4.7 Webhook - Ingestion Failed**

```http
POST {{base_url}}/ingestion/webhook
Content-Type: application/json

{
  "type": "ingestion_failed",
  "processId": 2,
  "error": "File processing timeout after 30 seconds",
  "timestamp": "2025-07-20T14:35:00.000Z"
}
```

---

## 🧪 5. Complete Testing Workflow

### **Step-by-Step Test Sequence:**

1. **Health Check** → Verify API is running
2. **Register Users** → Create admin, editor, viewer accounts
3. **Login as Admin** → Get JWT token
4. **User Management** → Test CRUD operations on users
5. **Document Management** → Create, upload, update documents
6. **Ingestion Workflow** → Trigger processing, monitor status
7. **Webhook Testing** → Simulate external system integration

### **Expected Processing Flow:**

```
Document Upload → Store in DB → Trigger Ingestion → Process Document → Update Status → Searchable Content
```

---

## 🔧 6. Postman Collection Setup

### **Create Collection Structure:**

1. **Create New Collection:** "NestJS User & Document Management API"
2. **Add Environment Variables** as mentioned above
3. **Create Folders** for each API category
4. **Add Pre-Request Scripts** for token management
5. **Add Tests** for response validation

### **Useful Pre-Request Script:**

```javascript
// Auto-refresh expired tokens
if (!pm.environment.get("jwt_token")) {
  console.log("No JWT token found. Please login first.");
}
```

### **Useful Test Script:**

```javascript
// Validate response structure
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("id");
  pm.expect(jsonData).to.have.property("createdAt");
});
```

---

## 🚨 7. Error Handling Test Cases

### **Authentication Errors:**

```http
# Test without token
GET {{base_url}}/users
# Expected: 401 Unauthorized

# Test with invalid token
GET {{base_url}}/users
Authorization: Bearer invalid_token
# Expected: 401 Unauthorized

# Test insufficient permissions
GET {{base_url}}/users
Authorization: Bearer {{editor_jwt_token}}
# Expected: 403 Forbidden
```

### **Validation Errors:**

```http
# Test invalid email format
POST {{base_url}}/auth/register
{
  "email": "invalid-email",
  "password": "123"
}
# Expected: 400 Bad Request

# Test missing required fields
POST {{base_url}}/documents
{
  "content": "Missing title field"
}
# Expected: 400 Bad Request
```

### **Resource Not Found:**

```http
# Test non-existent resource
GET {{base_url}}/users/999
Authorization: Bearer {{jwt_token}}
# Expected: 404 Not Found

DELETE {{base_url}}/documents/999
Authorization: Bearer {{jwt_token}}
# Expected: 404 Not Found
```

---

## 📊 8. Performance Testing Considerations

### **Load Testing Scenarios:**

- **Concurrent Logins:** Multiple users logging in simultaneously
- **Bulk Document Upload:** Testing file upload limits
- **Batch Ingestion:** Processing large document sets
- **API Rate Limiting:** Testing request throttling

### **Stress Testing:**

- **Memory Usage:** Large file uploads
- **Database Connections:** High concurrent requests
- **Processing Queue:** Multiple ingestion processes

---

## 🎯 9. Success Criteria

✅ **All endpoints respond correctly**  
✅ **Authentication & authorization work**  
✅ **File upload functionality works**  
✅ **Role-based access control enforced**  
✅ **Ingestion processes track correctly**  
✅ **Error handling provides meaningful messages**  
✅ **Webhook integration functions properly**

---

## 📝 10. Notes & Tips

- **Always login first** before testing protected endpoints
- **Use environment variables** to avoid hardcoding values
- **Test with different user roles** to verify permissions
- **Monitor application logs** for debugging
- **Test file uploads** with various file types and sizes
- **Verify ingestion status changes** over time (pending → running → completed)

---

**Happy Testing! 🚀**
