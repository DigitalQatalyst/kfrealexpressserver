# API Connector Setup Checklist

## ✅ What's Been Created

1. ✅ **services/dynamicsService.js** - Dataverse integration
   - getAccessToken() - Authenticates with Dataverse
   - createContact() - Creates Contact record
   - getContactById() - Fetches Contact by ID
   - getContactByAzureId() - Fetches Contact by Azure Object ID

2. ✅ **controllers/ApiConnectorController.js** - 3 API endpoints
   - validateSignUp - Validates enterprise customers have enterprise name
   - enrichSignUp - Creates Contact in Dataverse, returns crmContactId
   - resolveRoles - Fetches Contact, returns roles + custom attributes

3. ✅ **routes/apiConnectorRoutes.js** - Routes
   - POST /api/signup/validate
   - POST /api/signup/enrich
   - POST /api/signin/roles

4. ✅ **index.js** - Updated to include API Connector routes

5. ✅ **.env.example** - Environment variables template

---

## 🔴 What You Need to Do

### Step 1: Get Dataverse Credentials from CRM Team

Ask them for:
```
✅ Instance URL: https://yourorg.crm.dynamics.com
✅ Service Principal Client ID
✅ Service Principal Client Secret
✅ Tenant ID
✅ Confirm these custom fields exist on Contact entity:
   - new_azureobjectid
   - new_customertype
   - new_enterprisename
   - new_preferredlanguage
   - new_marketingconsent
   - new_enterpriseaffiliation
```

### Step 2: Add Credentials to .env

Add these to your `.env` file:
```env
DYNAMICS_INSTANCE_URL=https://yourorg.crm.dynamics.com
DYNAMICS_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DYNAMICS_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx
DYNAMICS_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 3: Test Locally

```bash
# Start server
npm start

# Test validate endpoint
curl -X POST http://localhost:3000/api/signup/validate \
  -H "Content-Type: application/json" \
  -d '{
    "extension_customerType": "enterprise",
    "extension_enterpriseName": "Test Corp"
  }'

# Expected response:
# {
#   "version": "1.0.0",
#   "action": "Continue",
#   "userMessage": "Validation successful"
# }
```

### Step 4: Deploy to Production

Deploy your server to your hosting platform (Render, Vercel, etc.)

Make sure to add environment variables in your hosting dashboard.

### Step 5: Configure Azure External ID

#### A. Create Custom Authentication Extension

1. Go to Azure Portal → External ID → Custom authentication extensions
2. Click "Create custom extension"
3. Fill in:
   - Name: `EJP-Role-Resolver`
   - Target URL: `https://your-server.com/api/signin/roles`
   - Timeout: 2000ms
4. Save

#### B. Configure API Connectors in User Flow

1. Go to Azure Portal → External ID → User flows → `test_kf`
2. Click "API connectors"
3. Configure:
   - **Before creating the user**: 
     - Name: `Validate Sign-Up`
     - Endpoint: `https://your-server.com/api/signup/validate`
   - **After creating the user**: 
     - Name: `Enrich Profile`
     - Endpoint: `https://your-server.com/api/signup/enrich`
   - **Before sending the token**: 
     - Name: `Resolve Roles`
     - Endpoint: `https://your-server.com/api/signin/roles`

#### C. Update App Manifest for Optional Claims

1. Go to App Registration → Manifest
2. Add this to the manifest:

```json
"optionalClaims": {
  "idToken": [
    { "name": "extension_customerType", "essential": false },
    { "name": "extension_crmContactId", "essential": false },
    { "name": "extension_enterpriseName", "essential": false },
    { "name": "extension_preferredLanguage", "essential": false },
    { "name": "extension_marketingConsent", "essential": false },
    { "name": "extension_enterpriseAffiliation", "essential": false },
    { "name": "roles", "essential": false }
  ],
  "accessToken": [
    { "name": "extension_customerType", "essential": false },
    { "name": "roles", "essential": false }
  ]
}
```

---

## 🧪 Testing the Complete Flow

### Test Sign-Up Flow

1. Open your React app: http://localhost:5173
2. Click "Sign Up"
3. Fill form:
   - Email: test@example.com
   - Password: Test@1234
   - Customer Type: enterprise
   - Enterprise Name: Test Corp
   - Preferred Language: en
   - Marketing Consent: Yes
4. Submit

**Expected**:
- ✅ Azure calls `/api/signup/validate` → validates
- ✅ Azure creates user account
- ✅ Azure calls `/api/signup/enrich` → creates Contact in Dataverse
- ✅ Dataverse returns contactid
- ✅ Azure stores contactid as extension_crmContactId
- ✅ User account created successfully

### Test Sign-In Flow

1. Sign in with test@example.com
2. Open Claims Viewer (Shield icon)

**Expected Token Claims**:
```json
{
  "email": "test@example.com",
  "name": "Test User",
  "extension_customerType": "enterprise",
  "extension_crmContactId": "550e8400-...",
  "extension_enterpriseName": "Test Corp",
  "extension_preferredLanguage": "en",
  "extension_marketingConsent": true,
  "roles": ["contributor", "creator"]
}
```

**Expected Flow**:
- ✅ Azure validates credentials
- ✅ Azure calls `/api/signin/roles` with crmContactId
- ✅ API fetches Contact from Dataverse
- ✅ API returns roles + custom attributes
- ✅ Azure injects claims into token
- ✅ Frontend receives token with all claims
- ✅ RBAC works based on roles

---

## 📊 API Endpoints Summary

| Endpoint | Method | Called By Azure | Purpose |
|----------|--------|-----------------|---------|
| `/api/signup/validate` | POST | Before creating user | Validate custom attributes |
| `/api/signup/enrich` | POST | After creating user | Create Contact in Dataverse |
| `/api/signin/roles` | POST | Before sending token | Fetch Contact, return roles |

---

## 🔍 Debugging

### Check Server Logs

All endpoints log detailed information:
```
=== VALIDATE SIGN-UP REQUEST ===
Request body: { ... }
Validation successful

=== ENRICH SIGN-UP REQUEST ===
Request body: { ... }
Creating Contact in Dataverse for: test@example.com
Contact created with ID: 550e8400-...

=== RESOLVE ROLES REQUEST ===
Request body: { ... }
Fetching Contact from Dataverse: 550e8400-...
Contact found: test@example.com
Roles assigned: contributor, creator
```

### Common Issues

1. **API not called by Azure**
   - Check API Connector is configured in user flow
   - Verify endpoint URL is correct and HTTPS
   - Check Azure Event Logs for errors

2. **Dataverse connection failed**
   - Verify credentials are correct
   - Check Service Principal has permissions
   - Test token endpoint manually

3. **Claims not in token**
   - Verify API returns correct format
   - Check app manifest has optionalClaims
   - Ensure Custom Authentication Extension is linked

---

## 🎯 Success Criteria

✅ User signs up → Contact created in Dataverse  
✅ User signs in → Token contains custom claims  
✅ Claims Viewer shows all attributes  
✅ RBAC works based on roles  

**You're ready to go! Just need Dataverse credentials from CRM team.**
