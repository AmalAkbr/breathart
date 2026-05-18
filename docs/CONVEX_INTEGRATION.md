# Convex Integration Guide for BreathArt

## Overview
BreathArt now uses **Convex** as its backend database and server. This replaces MongoDB completely.

## Project Details
- **Project ID**: breathart-7d654
- **Deployment**: upbeat-giraffe-343 (dev)
- **Dashboard**: https://dashboard.convex.dev/t/muhammed-habeeb-rahman-k-t/breathart-7d654
- **API URL**: https://upbeat-giraffe-343.convex.cloud

## Environment Setup

### Frontend (.env.local)
```
VITE_CONVEX_URL=https://upbeat-giraffe-343.convex.cloud
VITE_CONVEX_SITE_URL=https://upbeat-giraffe-343.convex.site
```

## Database Schema

### Users Table
Stores all user accounts (students, instructors, admins)
```typescript
{
  email: string
  username?: string
  password: string (hashed)
  fullName?: string
  role: "student" | "instructor" | "admin"
  phone?: string
  profilePicture?: string
  bio?: string
  isVerified: boolean
  lastLogin?: number
  createdAt: number
  updatedAt: number
  isActive: boolean
}
```

### Exams Table
Stores exam metadata and configuration
```typescript
{
  title: string
  description?: string
  instructor_id: id("users")
  duration: number (minutes)
  totalQuestions: number
  passingScore: number
  status: "draft" | "published" | "archived"
  startDate?: number
  endDate?: number
  shuffleQuestions: boolean
  showResults: boolean
  difficulty: "easy" | "medium" | "hard"
  totalParticipants: number
  createdAt: number
  updatedAt: number
}
```

### Questions Table
Stores individual exam questions
```typescript
{
  exam_id: id("exams")
  questionText: string
  questionType: "mcq" | "shortAnswer" | "essay"
  options?: string[]
  correctAnswer?: string
  marks: number
  explanation?: string
  imageUrl?: string
  videoUrl?: string
  order: number
  createdAt: number
  updatedAt: number
}
```

### ExamParticipants Table
Tracks user exam attempts and results
```typescript
{
  exam_id: id("exams")
  user_id: id("users")
  status: "pending" | "in_progress" | "completed" | "abandoned"
  score?: number
  totalMarks?: number
  percentage?: number
  startedAt?: number
  completedAt?: number
  answers?: Array<{
    question_id: id("questions")
    answer: string
    isCorrect: boolean
    marksObtained: number
  }>
  createdAt: number
  updatedAt: number
}
```

### Videos Table
Stores video metadata and information
```typescript
{
  title: string
  description?: string
  uploader_id: id("users")
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
  views: number
  likes: number
  category?: string
  tags?: string[]
  status: "processing" | "ready" | "failed" | "archived"
  visibility: "public" | "private" | "restricted"
  createdAt: number
  updatedAt: number
}
```

### Additional Tables
- **VideoComments**: Comments on videos with nested replies
- **UserProgress**: Tracks progress in exams and videos
- **Notifications**: User notifications for various events
- **Files**: File storage metadata
- **AuditLog**: Action logging for compliance

## Using Convex in Frontend Components

### 1. Setup Provider
Wrap your App with ConvexClientProvider in main.jsx:

```jsx
import { ConvexClientProvider } from './components/ConvexClientProvider';
import App from './App';

ReactDOM.render(
  <ConvexClientProvider>
    <App />
  </ConvexClientProvider>,
  document.getElementById('root')
);
```

### 2. Use Query and Mutation Hooks

```jsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

function MyComponent() {
  // Queries (read data)
  const user = useQuery(api.auth.getUserById, { userId: 'user123' });
  
  // Mutations (write data)
  const createExamMutation = useMutation(api.exams.createExam);
  
  const handleCreateExam = async () => {
    const result = await createExamMutation({
      title: "Math 101",
      duration: 60,
      totalQuestions: 10,
      passingScore: 50,
      instructor_id: "instructor123",
      difficulty: "medium",
      category: "Mathematics",
      shuffleQuestions: true,
      showResults: true
    });
    console.log('Exam created:', result);
  };

  return (
    <div>
      {user && <h1>Welcome, {user.fullName}</h1>}
      <button onClick={handleCreateExam}>Create Exam</button>
    </div>
  );
}
```

### 3. Use Custom Hooks
Convenience hooks are provided in `src/hooks/useConvexFunctions.js`:

```jsx
import { useExamFunctions } from '../hooks/useConvexFunctions';

function ExamList() {
  const { getExamsByInstructor } = useExamFunctions();
  const exams = useQuery(api.exams.getExamsByInstructor, { instructor_id: 'inst123' });

  return (
    <ul>
      {exams?.map(exam => (
        <li key={exam._id}>{exam.title}</li>
      ))}
    </ul>
  );
}
```

## Common Operations

### Authentication
```javascript
// Sign up
const { signupMutation } = useAuthFunctions();
await signupMutation({
  email: 'user@example.com',
  password: 'hashedPassword',
  fullName: 'John Doe',
  role: 'student'
});

// Get user
const user = useQuery(api.auth.getUserByEmail, { email: 'user@example.com' });
```

### Exam Management
```javascript
// Create exam
const { createExam } = useExamFunctions();
const examId = await createExam({
  title: 'Quiz 1',
  instructor_id: 'inst123',
  duration: 30,
  totalQuestions: 5,
  passingScore: 60,
  difficulty: 'easy',
  shuffleQuestions: false,
  showResults: true
});

// Add question
const { addQuestion } = useExamFunctions();
await addQuestion({
  exam_id: examId,
  questionText: 'What is 2+2?',
  questionType: 'mcq',
  options: ['3', '4', '5'],
  correctAnswer: '4',
  marks: 1,
  order: 1
});

// Publish exam
const { publishExam } = useExamFunctions();
await publishExam({
  examId,
  startDate: Date.now(),
  endDate: Date.now() + 7 * 24 * 60 * 60 * 1000
});
```

### Exam Participation
```javascript
// Start exam
const { startExam } = useExamParticipationFunctions();
const participantId = await startExam({
  exam_id: 'exam123',
  user_id: 'user123'
});

// Submit answer
const { submitAnswer } = useExamParticipationFunctions();
const result = await submitAnswer({
  participant_id: participantId,
  question_id: 'q123',
  answer: '4'
});

// Submit exam
const { submitExam } = useExamParticipationFunctions();
const finalResult = await submitExam({ participant_id: participantId });
console.log(`Score: ${finalResult.score}/${finalResult.totalMarks}`);
```

### Video Management
```javascript
// Upload video
const { uploadVideo } = useVideoFunctions();
const videoId = await uploadVideo({
  title: 'React Tutorial',
  uploader_id: 'user123',
  videoUrl: 'https://cdn.example.com/video.mp4',
  category: 'Programming',
  tags: ['react', 'javascript'],
  visibility: 'public'
});

// Get videos
const videos = useQuery(api.videos.getVideos, { 
  category: 'Programming',
  limit: 10 
});

// Add comment
const { addVideoComment } = useVideoFunctions();
await addVideoComment({
  video_id: videoId,
  user_id: 'user123',
  comment: 'Great explanation!'
});
```

## Backend Migration (Node.js)

### Removing MongoDB
1. Delete MongoDB models from `backend/src/models/`
2. Remove MongoDB connection from `backend/src/config/database.js`
3. Remove MongoDB packages from `backend/package.json`:
   ```bash
   npm uninstall mongoose mongodb
   ```

### Using Convex API from Backend
Instead of direct database access, backend can call Convex functions:

```javascript
// backend/src/services/examService.js
import axios from 'axios';

const CONVEX_URL = process.env.CONVEX_URL || 'https://upbeat-giraffe-343.convex.cloud';

export async function getExam(examId) {
  const response = await axios.post(`${CONVEX_URL}/api/exams/getExamById`, {
    examId
  });
  return response.data;
}

export async function createExam(examData) {
  const response = await axios.post(`${CONVEX_URL}/api/exams/createExam`, examData);
  return response.data;
}
```

## Deployment

### Deploy to Convex
```bash
cd frontend
npx convex deploy
```

### Environment Variables
Set in Convex dashboard or local .env:
```
CONVEX_DEPLOYMENT=dev:upbeat-giraffe-343
```

## Best Practices

1. **Always hash passwords** - Use bcrypt before storing
2. **Use indexes** - Already defined in schema for common queries
3. **Validate input** - Use Convex's `v.` validators
4. **Error handling** - Wrap mutations in try-catch
5. **Real-time updates** - Queries automatically update when data changes
6. **Pagination** - For large result sets, implement cursor-based pagination

## Troubleshooting

### Connection Issues
```bash
# Check deployment status
npx convex status

# View logs
npx convex logs
```

### Query Not Updating
- Ensure you're using `useQuery` hook (not regular fetch)
- Check that arguments match the function signature
- Verify indexes are properly defined

### Mutation Failures
- Check error message in console
- Verify all required arguments are provided
- Ensure user has proper permissions

## Resources
- [Convex Documentation](https://docs.convex.dev)
- [Convex Dashboard](https://dashboard.convex.dev)
- [API Explorer](https://upbeat-giraffe-343.convex.cloud/api)

## Next Steps
1. ✅ Initialize Convex project
2. ✅ Create database schema
3. ✅ Write Convex functions
4. ✅ Setup frontend integration
5. ⏳ Migrate existing data from MongoDB
6. ⏳ Update backend routes to use Convex API
7. ⏳ Test all features
8. ⏳ Deploy to production
