# Create new project directory
mkdir evalmatchai
cd evalmatchai

# Initialize package.json
npm init -y
npm install @anthropic-ai/sdk @hookform/resolvers @neondatabase/serverless @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip @tanstack/react-query class-variance-authority clsx cmdk connect-pg-simple date-fns drizzle-orm drizzle-zod embla-carousel-react express express-pino-logger express-session framer-motion input-otp lucide-react mammoth memorystore multer next-themes node-fetch openai passport passport-local pdf-lib pdf-parse pdf2pic pdfjs-dist pg pino pino-http pino-pretty react react-day-picker react-dom react-hook-form react-icons react-resizable-panels recharts string-similarity supertest tailwind-merge tailwindcss-animate tesseract.js tw-animate-css uuid vaul wouter ws zod zod-validation-error
npm install -D @types/connect-pg-simple @types/express @types/express-session @types/node @types/passport @types/passport-local @types/react @types/react-dom @types/ws @vitejs/plugin-react autoprefixer drizzle-kit esbuild postcss tailwindcss tsx typescript vite
evalmatchai/
├── shared/
│   └── schema.ts
├── server/
│   ├── lib/
│   │   ├── openai.ts
│   │   └── document-parser.ts
│   ├── db.ts
│   ├── storage.ts
│   ├── routes.ts
│   └── index.ts
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── hooks/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── index.html
├── uploads/
│   └── temp/
├── .env
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
└── drizzle.config.ts
import { pgTable, text, timestamp, integer, jsonb, boolean, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  hashedPassword: text('hashed_password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Resumes table
export const resumes = pgTable('resumes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  extractedText: text('extracted_text'),
  parsedData: jsonb('parsed_data'),
  analysisResult: jsonb('analysis_result'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Job Descriptions table
export const jobDescriptions = pgTable('job_descriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements'),
  location: text('location'),
  salaryRange: text('salary_range'),
  analysisResult: jsonb('analysis_result'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Matches table
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  resumeId: integer('resume_id').references(() => resumes.id).notNull(),
  jobDescriptionId: integer('job_description_id').references(() => jobDescriptions.id).notNull(),
  matchScore: integer('match_score').notNull(),
  analysisResult: jsonb('analysis_result'),
  interviewQuestions: jsonb('interview_questions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertResumeSchema = createInsertSchema(resumes);
export const selectResumeSchema = createSelectSchema(resumes);
export const insertJobDescriptionSchema = createInsertSchema(jobDescriptions);
export const selectJobDescriptionSchema = createSelectSchema(jobDescriptions);
export const insertMatchSchema = createInsertSchema(matches);
export const selectMatchSchema = createSelectSchema(matches);

export type User = z.infer<typeof selectUserSchema>;
export type Resume = z.infer<typeof selectResumeSchema>;
export type JobDescription = z.infer<typeof selectJobDescriptionSchema>;
export type Match = z.infer<typeof selectMatchSchema>;
