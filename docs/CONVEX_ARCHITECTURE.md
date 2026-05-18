# Convex Architecture - BreathArt

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BREATHART SYSTEM                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌────────────────────────────┐
│   FRONTEND (React)   │         │   BACKEND (Node.js)        │
│   ───────────────    │         │   ───────────────────      │
│  • App.jsx           │         │  • Express routes          │
│  • Components        │◄────────►  • Old MongoDB models     │
│  • Hooks             │ HTTP/WS │  • Services               │
│  • Pages             │         │  • Controllers            │
└──────────────────────┘         └────────────────────────────┘
         │
         │ ConvexClientProvider
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                   CONVEX (Backend as a Service)                   │
│  ────────────────────────────────────────────────────────────────│
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │  Auth Functions  │  │ Exam Functions   │  │ Video Funcs  │   │
│  │  ────────────────│  │ ────────────────│  │ ────────────│   │
│  │ • signup         │  │ • createExam     │  │ • upload    │   │
│  │ • login          │  │ • publishExam    │  │ • getVideos │   │
│  │ • getUserById    │  │ • addQuestion    │  │ • comment   │   │
│  │ • updateProfile  │  │ • getQuestions   │  │ • like      │   │
│  └──────────────────┘  └──────────────────┘  └──────────────┘   │
│                                                                    │
│  ┌────────────────────────┐  ┌──────────────────────────────┐   │
│  │ Participation Functions │  │  Utility Functions           │   │
│  │ ──────────────────────│  │ ──────────────────────────   │   │
│  │ • startExam           │  │ • createNotification         │   │
│  │ • submitAnswer        │  │ • getUserProgress            │   │
│  │ • submitExam          │  │ • logAction                  │   │
│  │ • getResults          │  │ • getAuditLogs              │   │
│  └────────────────────────┘  └──────────────────────────────┘   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              CONVEX DATABASE (Cloud)                       │  │
│  │  ──────────────────────────────────────────────────────  │  │
│  │                                                            │  │
│  │  Users  │ Exams  │ Questions │ ExamParticipants │ Videos  │  │
│  │  Notifs │ Files  │ Comments  │ Progress         │ Logs   │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  API URL: https://upbeat-giraffe-343.convex.cloud               │
│  Region: Auto                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### User Sign Up Flow
```
React Component
      │
      ├─► useMutation(api.auth.signup)
      │
      ▼
ConvexClientProvider
      │
      ▼
Convex Server Function (auth.ts)
      │
      ├─► Validate input (v.string, v.literal)
      │
      ├─► Check email uniqueness
      │
      ├─► Hash password
      │
      ├─► Insert into "users" table
      │
      ▼
Return { userId, success: true }
      │
      ▼
React Component (mutation.isPending/isDone)
      │
      ▼
Update UI
```

### Exam Submission Flow
```
React Component (ExamPage)
      │
      ├─► useMutation(api.examParticipation.submitAnswer)
      │
      ▼
Loop through all answers
      │
      ├─► For each answer:
      │   ├─► Compare with correctAnswer
      │   ├─► Calculate marks
      │   └─► Update answers array
      │
      ▼
useMutation(api.examParticipation.submitExam)
      │
      ├─► Calculate total score
      │
      ├─► Calculate percentage
      │
      ├─► Determine pass/fail
      │
      ├─► Create notification
      │
      ▼
Return { score, totalMarks, percentage, passed }
      │
      ▼
Display Results Page
      │
      ├─► Show score breakdown
      │
      ├─► Show question analysis
      │
      └─► Option to retake
```

### Real-time Query Flow
```
React Component
      │
      ├─► useQuery(api.exams.getExamsByInstructor)
      │
      ▼
ConvexClientProvider (subscribes)
      │
      ▼
Convex Server Function
      │
      ├─► Query "exams" table
      │
      ├─► Apply index (by_instructor)
      │
      ▼
Return exams[] array
      │
      ▼
React State Updates Automatically
      │
      ├─► Component re-renders
      │
      └─► Real-time sync if data changes
```

---

## 🗄️ Database Schema Relationships

```
┌─────────────┐
│   USERS     │
├─────────────┤
│ _id         │ ◄──────────┐
│ email       │            │
│ password    │            │
│ role        │            │
│ fullName    │            │
│ isVerified  │            │
└─────────────┘            │
                           │
      ┌────────────────────┴────────────────────────┐
      │                                             │
      ▼                                             ▼
┌──────────────┐                           ┌──────────────────┐
│   EXAMS      │                           │ EXAM_PARTICIPANTS│
├──────────────┤                           ├──────────────────┤
│ _id          │                           │ _id              │
│ instructor_id├─┐                         │ exam_id          │
│ title        │ │                         │ user_id          │
│ duration     │ │                         │ status           │
│ totalQuestions                           │ score            │
│ status       │                           │ percentage       │
└──────────────┘                           │ answers[]        │
      │                                    │ completedAt      │
      ▼                                    └──────────────────┘
┌──────────────┐
│ QUESTIONS    │
├──────────────┤
│ _id          │
│ exam_id      │◄─┐
│ questionText │  │
│ options[]    │  │
│ correctAnswer│  │
│ marks        │  │
│ explanation  │  │
└──────────────┘  │
                  └─ FK Relationship

┌──────────────┐                    ┌──────────────────┐
│  VIDEOS      │                    │  VIDEO_COMMENTS  │
├──────────────┤                    ├──────────────────┤
│ _id          │                    │ _id              │
│ uploader_id  │◄──┐                │ video_id         │◄──┐
│ title        │   │                │ user_id          │   │
│ videoUrl     │   │                │ comment          │   │
│ views        │   │                │ likes            │   │
│ likes        │   │                │ replies[]        │   │
│ category     │   │                └──────────────────┘   │
└──────────────┘   │                                       │
                   │                                       │
                   └───────────── Many Videos have ────────┘
                                  Many Comments

┌──────────────────┐
│ USER_PROGRESS    │
├──────────────────┤
│ _id              │
│ user_id          │◄──── Tracks progress
│ exam_id/video_id │      for each user
│ progressPercentage
│ status           │
│ lastAccessedAt   │
└──────────────────┘

┌──────────────────┐
│ NOTIFICATIONS    │
├──────────────────┤
│ _id              │
│ user_id          │
│ type             │ (exam_result, new_exam, new_video)
│ title            │
│ message          │
│ isRead           │
│ createdAt        │
└──────────────────┘

┌──────────────────┐
│ AUDIT_LOG        │
├──────────────────┤
│ _id              │
│ action           │ (create, update, delete)
│ actor_id         │ (which user did this)
│ target           │ (what was affected)
│ targetId         │
│ changes          │ (what changed)
│ createdAt        │
└──────────────────┘
```

---

## 🔄 Function Organization

```
convex/
├── schema.ts                    (1 file)
│   └─ Defines all 12 tables
│
├── auth.ts                      (1 file, 8 functions)
│   ├─ signup(email, password, fullName, role)
│   ├─ login(email, password)
│   ├─ getUserById(userId)
│   ├─ getUserByEmail(email)
│   ├─ updateUserProfile(userId, ...)
│   ├─ getAllUsers(role?)
│   └─ Helper: hashPassword, verifyPassword
│
├── exams.ts                     (1 file, 10 functions)
│   ├─ createExam(examData)
│   ├─ getExamById(examId)
│   ├─ getExamsByInstructor(instructor_id)
│   ├─ publishExam(examId)
│   ├─ updateExam(examId, updates)
│   ├─ addQuestion(exam_id, questionData)
│   ├─ getExamQuestions(exam_id)
│   ├─ getQuestionById(questionId)
│   ├─ updateQuestion(questionId, updates)
│   └─ deleteQuestion(questionId)
│
├── examParticipation.ts         (1 file, 7 functions)
│   ├─ startExam(exam_id, user_id)
│   ├─ submitAnswer(participant_id, question_id, answer)
│   ├─ submitExam(participant_id)
│   ├─ getParticipantResult(participant_id)
│   ├─ getExamResults(exam_id)
│   ├─ getUserExamAttempts(user_id)
│   └─ getUserExamStatus(user_id, exam_id)
│
├── videos.ts                    (1 file, 10 functions)
│   ├─ uploadVideo(videoData)
│   ├─ getVideoById(videoId)
│   ├─ getVideos(category?, limit?)
│   ├─ getVideosByUploader(uploader_id)
│   ├─ incrementVideoViews(videoId)
│   ├─ likeVideo(videoId, userId, isLike)
│   ├─ addVideoComment(video_id, user_id, comment)
│   ├─ getVideoComments(video_id)
│   ├─ updateVideoMetadata(videoId, updates)
│   └─ deleteVideo(videoId)
│
└── utilities.ts                 (1 file, 9 functions)
    ├─ createNotification(user_id, type, title, message)
    ├─ getUserNotifications(user_id, unreadOnly?)
    ├─ markNotificationAsRead(notificationId)
    ├─ markAllNotificationsAsRead(user_id)
    ├─ updateUserProgress(user_id, exam_id?, video_id?, ...)
    ├─ getUserProgress(user_id)
    ├─ getProgressByExam(exam_id)
    ├─ logAction(action, actor_id, target, targetId, changes)
    └─ getAuditLogs(actor_id?, target?, limit?)
```

---

## 🎯 Frontend Hook Structure

```
src/hooks/useConvexFunctions.js

useAuthFunctions()
  ├─ signupMutation
  ├─ loginQuery
  ├─ getUserById
  ├─ getUserByEmail
  ├─ updateUserProfile
  └─ getAllUsers

useExamFunctions()
  ├─ createExam
  ├─ getExamById
  ├─ getExamsByInstructor
  ├─ publishExam
  ├─ updateExam
  ├─ addQuestion
  ├─ getExamQuestions
  ├─ getQuestionById
  ├─ updateQuestion
  └─ deleteQuestion

useExamParticipationFunctions()
  ├─ startExam
  ├─ submitAnswer
  ├─ submitExam
  ├─ getParticipantResult
  ├─ getExamResults
  ├─ getUserExamAttempts
  └─ getUserExamStatus

useVideoFunctions()
  ├─ uploadVideo
  ├─ getVideoById
  ├─ getVideos
  ├─ getVideosByUploader
  ├─ incrementVideoViews
  ├─ likeVideo
  ├─ addVideoComment
  ├─ getVideoComments
  ├─ updateVideoMetadata
  └─ deleteVideo

useUtilityFunctions()
  ├─ createNotification
  ├─ getUserNotifications
  ├─ markNotificationAsRead
  ├─ markAllNotificationsAsRead
  ├─ updateUserProgress
  ├─ getUserProgress
  ├─ getProgressByExam
  ├─ logAction
  └─ getAuditLogs
```

---

## 📡 API Endpoints

All endpoints go through single Convex API gateway:

```
POST https://upbeat-giraffe-343.convex.cloud/api/auth.signup
POST https://upbeat-giraffe-343.convex.cloud/api/auth.login
GET  https://upbeat-giraffe-343.convex.cloud/api/auth.getUserById
GET  https://upbeat-giraffe-343.convex.cloud/api/exams.getExamById
POST https://upbeat-giraffe-343.convex.cloud/api/exams.createExam
POST https://upbeat-giraffe-343.convex.cloud/api/examParticipation.startExam
... (44 total endpoints)
```

---

## 🚀 Deployment Architecture

```
Local Development
├─ npm install
├─ Frontend: http://localhost:5173
├─ Convex: Local testing
└─ Database: Local schema

                ▼

Production Deployment
├─ Frontend: Vercel/Netlify
├─ Convex: Cloud (upbeat-giraffe-343)
└─ Database: Convex managed
```

---

## 📊 Performance Path

```
User Action (Click)
    │
    ├─► Optimistic update (local)
    │
    ▼
Send mutation to Convex
    │
    ├─► Network (50-100ms)
    │
    ▼
Convex Server Processing
    │
    ├─► Validate input (1-5ms)
    │
    ├─► Database operation (20-100ms)
    │
    ├─► Broadcast update (5-10ms)
    │
    ▼
Return response + real-time sync
    │
    ├─► Network (50-100ms)
    │
    ▼
React re-renders
    │
    ├─► Update component state (0-5ms)
    │
    ▼
UI Updated

Total Latency: 150-300ms typical
```

---

This architecture provides:
- ✅ Scalability
- ✅ Real-time sync
- ✅ Type safety
- ✅ Automatic persistence
- ✅ Built-in auth support
- ✅ File storage
- ✅ Logging and monitoring
