import express from 'express';
import { db } from './db';
import { resumes, jobDescriptions, matches } from '../shared/schema';
import { upload } from './storage';
import { parseDocument, cleanupTempFile } from './lib/document-parser';
import { analyzeResume, analyzeJobDescription, calculateMatch, generateInterviewQuestions } from './lib/openai';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload and analyze resume
router.post('/resumes', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    
    // Parse the document
    const extractedText = await parseDocument(filePath, mimetype);
    
    // Analyze with AI
    const analysisResult = await analyzeResume(extractedText);
    
    // Save to database
    const [resume] = await db.insert(resumes).values({
      userId: 1, // TODO: Get from session
      fileName: filename,
      originalName: originalname,
      mimeType: mimetype,
      fileSize: size,
      extractedText,
      parsedData: analysisResult,
      analysisResult
    }).returning();
    
    // Clean up temp file
    await cleanupTempFile(filePath);
    
    res.json({ 
      success: true, 
      resume,
      analysis: analysisResult 
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ 
      error: 'Failed to process resume',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all resumes
router.get('/resumes', async (req, res) => {
  try {
    const allResumes = await db.select().from(resumes);
    res.json(allResumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Get specific resume
router.get('/resumes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// Create job description
router.post('/job-descriptions', async (req, res) => {
  try {
    const { title, company, description, requirements, location, salaryRange } = req.body;
    
    if (!title || !company || !description) {
      return res.status(400).json({ error: 'Title, company, and description are required' });
    }
    
    // Analyze job description with AI
    const analysisResult = await analyzeJobDescription(description + '\n' + (requirements || ''));
    
    const [jobDescription] = await db.insert(jobDescriptions).values({
      userId: 1, // TODO: Get from session
      title,
      company,
      description,
      requirements,
      location,
      salaryRange,
      analysisResult
    }).returning();
    
    res.json({ 
      success: true, 
      jobDescription,
      analysis: analysisResult 
    });
  } catch (error) {
    console.error('Error creating job description:', error);
    res.status(500).json({ 
      error: 'Failed to create job description',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all job descriptions
router.get('/job-descriptions', async (req, res) => {
  try {
    const allJobDescriptions = await db.select().from(jobDescriptions);
    res.json(allJobDescriptions);
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    res.status(500).json({ error: 'Failed to fetch job descriptions' });
  }
});

// Analyze match between resume and job description
router.post('/analyze-match', async (req, res) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;
    
    if (!resumeId || !jobDescriptionId) {
      return res.status(400).json({ error: 'Resume ID and Job Description ID are required' });
    }
    
    // Get resume and job description
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, resumeId));
    const [jobDescription] = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, jobDescriptionId));
    
    if (!resume || !jobDescription) {
      return res.status(404).json({ error: 'Resume or job description not found' });
    }
    
    // Calculate match
    const matchResult = await calculateMatch(resume.analysisResult, jobDescription.analysisResult);
    
    // Generate interview questions
    const interviewQuestions = await generateInterviewQuestions(matchResult, jobDescription.description);
    
    // Save match to database
    const [match] = await db.insert(matches).values({
      resumeId,
      jobDescriptionId,
      matchScore: matchResult.matchScore,
      analysisResult: matchResult,
      interviewQuestions
    }).returning();
    
    res.json({ 
      success: true, 
      match,
      analysis: matchResult,
      interviewQuestions
    });
  } catch (error) {
    console.error('Error analyzing match:', error);
    res.status(500).json({ 
      error: 'Failed to analyze match',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate interview questions
router.post('/generate-questions', async (req, res) => {
  try {
    const { matchId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }
    
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Get job description for context
    const [jobDescription] = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, match.jobDescriptionId));
    
    if (!jobDescription) {
      return res.status(404).json({ error: 'Job description not found' });
    }
    
    const questions = await generateInterviewQuestions(match.analysisResult, jobDescription.description);
    
    res.json({ 
      success: true, 
      questions 
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
