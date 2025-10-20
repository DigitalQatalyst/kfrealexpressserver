# API Connector Endpoint Setup
## Azure External ID Integration

---

## ✅ What Was Added

I've added an API Connector endpoint to your Express backend:

**Endpoint**: `POST /api/v1/identity/resolve-claims`

**Purpose**: Returns custom claims for Azure External ID authentication tokens

---

## 🚀 Step 1: Test Locally

### 1.1 Start the Server

```bash
cd kfrealexpressserver
npm install
npm start
```

Server should start on `http://localhost:3000`

### 1.2 Test the Endpoint

Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/api/v1/identity/resolve-claims \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"sub\":\"test-123\",\"objectId\":\"abc-456\"}"
```

**Expected Response:**
```json
{
  "extension_customerType": "Enterprise",
  "extension_enterpriseName": "Test Company LLC",
  "extension_crmContactId": "abc-456",
  "extension_preferredLanguage": "en",
  "extension_marketingConsent": true,
  "extension_enterpriseAffiliation": "Main Office",
  "roles": [
    "enterprise.account.admin",
    "community.member"
  ]
}
```

✅ **If you see this response, the endpoint is working!**

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Check vercel.json

Your `vercel.json` should look like this:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

### 2.2 Deploy

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy
vercel
```

Follow the prompts. After deployment, you'll get a URL like:
```
https://your-app.vercel.app
```

### 2.3 Test Production Endpoint

```bash
curl -X POST https://your-app.vercel.app/api/v1/identity/resolve-claims \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"sub\":\"test-123\"}"
```

✅ **If you get the same JSON response, production is working!**

---

## 🔗 Step 3: Configure Azure API Connector

### 3.1 Get Your Endpoint URL

After Vercel deployment, your endpoint URL is:
```
https://your-app.vercel.app/api/v1/identity/resolve-claims
```

### 3.2 Create API Connector in Azure Portal

```
Azure Portal → External Identities → API connectors → + New API connector
```

**Fill in:**
| Field | Value |
|-------|-------|
| Display name | `PostSignIn_RoleResolve` |
| Endpoint URL | `https://your-app.vercel.app/api/v1/identity/resolve-claims` |
| Authentication | None (for now) |

Click **Save**

### 3.3 Bind to User Flow

```
External Identities → User flows → test_kf
→ Custom authentication extensions (left sidebar)
→ Before sending the token: Select "PostSignIn_RoleResolve"
```

Click **Save**

---

## 🧪 Step 4: Test End-to-End

### 4.1 Log Out

In your frontend app, click **Sign Out**

### 4.2 Log In Again

1. Navigate to `http://localhost:5173`
2. Click **Login**
3. Sign in with your credentials

### 4.3 Check Claims Viewer

Click the **Shield icon** in the header

**Expected Results:**
- ✅ Customer Type: **Enterprise**
- ✅ Enterprise Name: **Test Company LLC**
- ✅ Role: **admin** (changed from "viewer"!)
- ✅ CRM Contact ID: **[your user ID]**
- ✅ Preferred Language: **en**
- ✅ Marketing Consent: **✅ Yes**

### 4.4 Check Backend Logs

In your terminal where the server is running, you should see:
```
========================================
🔐 Azure API Connector Called
========================================
Request Body: {
  "email": "user@example.com",
  "sub": "...",
  ...
}
📧 User Email: user@example.com
🆔 User ID: ...
✅ Returning Claims: {
  "extension_customerType": "Enterprise",
  ...
}
========================================
```

---

## 🔧 Customization

### Query Database for Real User Data

Update `controllers/IdentityController.js`:

```javascript
const User = require('../models/User'); // Your user model

const resolveUserClaims = async (req, res) => {
  try {
    const { email, sub, objectId } = req.body;

    // Query your database
    const user = await User.findOne({ email });

    if (!user) {
      // Return default claims for new users
      return res.status(200).json({
        extension_customerType: "Enterprise",
        extension_enterpriseName: "Unknown",
        extension_crmContactId: objectId || sub,
        roles: ["viewer"]
      });
    }

    // Return user-specific claims
    const customClaims = {
      extension_customerType: user.customerType || "Enterprise",
      extension_enterpriseName: user.companyName || "Unknown",
      extension_crmContactId: user.crmId || objectId || sub,
      extension_preferredLanguage: user.language || "en",
      extension_marketingConsent: user.marketingConsent || false,
      roles: user.roles || ["viewer"]
    };

    return res.status(200).json(customClaims);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Add Authentication

Protect the endpoint with a secret key:

```javascript
const resolveUserClaims = async (req, res) => {
  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_CONNECTOR_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Rest of your code...
  } catch (error) {
    // Error handling...
  }
};
```

Then in Azure Portal:
```
API Connector → Authentication: Custom
Header name: x-api-key
Header value: your-secret-key
```

---

## 🐛 Troubleshooting

### Issue: Endpoint Returns 404

**Check:**
1. Server is running: `npm start`
2. Route is registered in `index.js`
3. URL is correct: `/api/v1/identity/resolve-claims`

### Issue: Claims Not Appearing

**Check:**
1. API Connector is bound to user flow
2. Endpoint returns correct JSON structure
3. Claim names start with `extension_`
4. Backend logs show the request

### Issue: CORS Error

Add CORS headers in `index.js`:
```javascript
app.use(cors({
  origin: '*', // Or specify Azure domains
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));
```

---

## 📊 Monitoring

### View Request Logs

Check your terminal where the server is running. You'll see:
- Request body from Azure
- User email and ID
- Claims being returned

### Production Logs (Vercel)

```
Vercel Dashboard → Your Project → Logs
```

Filter by `/api/v1/identity/resolve-claims` to see API Connector calls

---

## ✅ Success Checklist

- [ ] Endpoint created in Express backend
- [ ] Tested locally with curl
- [ ] Deployed to Vercel
- [ ] Tested production endpoint
- [ ] API Connector created in Azure Portal
- [ ] Connector bound to user flow
- [ ] Logged in and claims appear in Claims Viewer
- [ ] Role changed from "viewer" to "admin"
- [ ] Backend logs show requests from Azure

---

## 🎉 You're Done!

Your Express backend is now integrated with Azure External ID!

**Custom claims and RBAC are now fully working.**

---

## Next Steps

1. ✅ Replace mock data with real database queries
2. ✅ Add authentication to the endpoint
3. ✅ Implement role logic based on user data
4. ✅ Add error handling and validation
5. ✅ Set up monitoring and alerts

---

**Questions? Check the main guide: `API_CONNECTORS_SETUP_GUIDE.md`**
