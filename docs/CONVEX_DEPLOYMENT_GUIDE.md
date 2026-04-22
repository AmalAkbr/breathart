# Convex Deployment Quick Start

## What's Been Set Up

✅ **Convex Project Created**
- Project ID: `breathart-7d654`
- Deployment: `upbeat-giraffe-343` (dev environment)
- Region: Automatic

✅ **Database Schema Defined**
- All tables created in `frontend/convex/schema.ts`
- Includes Users, Exams, Questions, ExamParticipants, Videos, etc.
- All indexes defined for optimal query performance

✅ **Server Functions Implemented**
- Authentication functions (signup, login, user management)
- Exam management (create, update, publish)
- Question management
- Exam participation tracking
- Video management
- User progress tracking
- Notifications and audit logging

✅ **Frontend Integration Complete**
- ConvexClientProvider added to App.jsx
- Custom React hooks for all functions
- Type-safe API access via Convex

## Next Steps: Deploy Schema to Convex

### 1. Install Dependencies (if not already done)
```bash
cd frontend
npm install
```

### 2. Deploy the Database Schema
```bash
npx convex deploy
```

This command will:
- Push your schema to the Convex cloud
- Create all tables
- Set up all indexes
- Make functions available to your app

### 3. Verify Deployment
```bash
npx convex status
```

You should see:
- ✓ Project connected
- ✓ Schema deployed
- ✓ Functions ready

### 4. Access Convex Dashboard
Visit: https://dashboard.convex.dev/t/muhammed-habeeb-rahman-k-t/breathart-7d654

You can now:
- View all tables and data
- Monitor functions
- Check logs
- Manage environment variables

## Testing Convex Functions

### In Browser Console
```javascript
// Create a new user
fetch('https://upbeat-giraffe-343.convex.cloud/api/auth.signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'hashedPassword',
    fullName: 'Test User',
    role: 'student'
  })
})
```

### In React Component
```jsx
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

function TestComponent() {
  const signupMutation = useMutation(api.auth.signup);
  
  const handleSignup = async () => {
    const result = await signupMutation({
      email: 'user@example.com',
      password: 'hashedPassword',
      fullName: 'User Name',
      role: 'student'
    });
    console.log('Signup result:', result);
  };

  return <button onClick={handleSignup}>Sign Up</button>;
}
```

## Common Commands

```bash
# Deploy schema and functions
npx convex deploy

# Check deployment status
npx convex status

# View recent logs
npx convex logs

# Start local development server (optional)
npx convex dev

# Generate TypeScript types
npx convex codegen

# Push functions without deploying schema
npx convex push
```

## Troubleshooting

### "Schema not found" error
- Run `npx convex deploy` first
- Check that `schema.ts` has no syntax errors

### Functions not showing in dashboard
- Verify function files are in `convex/` directory
- Check function exports are correct
- Run `npx convex deploy` again

### Connection timeout
- Check internet connection
- Verify Convex deployment URL in `.env.local`
- Check Convex dashboard status

## Environment Variables Explained

**Frontend (.env.local)**:
- `VITE_CONVEX_URL` - API endpoint for server functions
- `VITE_CONVEX_SITE_URL` - Frontend hosting URL (for file uploads)

These are already configured in your `.env.local` file.

## Next: Migrate MongoDB Data (Optional)

If you have existing MongoDB data, create a migration script:

```javascript
// scripts/migrate-to-convex.js
import { ConvexClient } from "convex/browser";
import { api } from "../frontend/convex/_generated/api";

const client = new ConvexClient(process.env.VITE_CONVEX_URL);

async function migrateUsers() {
  // Fetch from MongoDB
  const mongoUsers = await fetchFromMongoDB('users');
  
  // Insert into Convex
  for (const user of mongoUsers) {
    await client.mutation(api.auth.signup, {
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      role: user.role
    });
  }
}
```

## Production Deployment

When ready for production:

1. **Create production deployment**:
   ```bash
   npx convex deployment create
   ```

2. **Update environment variables** in production `.env`

3. **Test thoroughly** in staging environment first

4. **Monitor logs** in Convex dashboard

## Support Resources

- **Convex Docs**: https://docs.convex.dev
- **API Reference**: https://docs.convex.dev/api/modules
- **Dashboard**: https://dashboard.convex.dev
- **Discord Community**: https://convex.dev/community

---

**Status**: ✅ Ready to deploy!
**Run**: `npx convex deploy` to begin
