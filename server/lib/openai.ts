import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeResume(resumeText: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert HR analyst. Analyze the following resume and extract structured information. Return a JSON object with the following structure:
          {
            "personalInfo": {
              "name": string,
              "email": string,
              "phone": string,
              "location": string
            },
            "skills": string[],
            "experience": {
              "yearsOfExperience": number,
              "positions": [{
                "title": string,
                "company": string,
                "duration": string,
                "description": string
              }]
            },
            "education": [{
              "degree": string,
              "institution": string,
              "year": string
            }],
            "summary": string,
            "strengths": string[],
            "improvementAreas": string[]
          }`
        },
        {
          role: "user",
          content: resumeText
        }
      ],
      temperature: 0.3,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}

export async function analyzeJobDescription(jobDescription: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert HR analyst. Analyze the following job description and extract structured information. Return a JSON object with the following structure:
          {
            "requiredSkills": string[],
            "preferredSkills": string[],
            "experienceLevel": string,
            "responsibilities": string[],
            "qualifications": string[],
            "companyInfo": string,
            "roleLevel": string,
            "workType": string,
            "summary": string
          }`
        },
        {
          role: "user",
          content: jobDescription
        }
      ],
      temperature: 0.3,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Error analyzing job description:', error);
    throw error;
  }
}

export async function calculateMatch(resumeAnalysis: any, jobAnalysis: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert HR analyst. Compare the resume analysis with the job description analysis and calculate a match score. Return a JSON object with the following structure:
          {
            "matchScore": number (0-100),
            "strengths": string[],
            "gaps": string[],
            "recommendations": string[],
            "skillsMatch": {
              "matched": string[],
              "missing": string[]
            },
            "experienceMatch": {
              "score": number (0-100),
              "analysis": string
            },
            "overallFit": string,
            "interviewFocus": string[]
          }`
        },
        {
          role: "user",
          content: `Resume Analysis: ${JSON.stringify(resumeAnalysis)}\n\nJob Description Analysis: ${JSON.stringify(jobAnalysis)}`
        }
      ],
      temperature: 0.3,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Error calculating match:', error);
    throw error;
  }
}

export async function generateInterviewQuestions(matchAnalysis: any, jobDescription: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert interviewer. Based on the match analysis and job description, generate relevant interview questions. Return a JSON object with the following structure:
          {
            "technical": string[],
            "behavioral": string[],
            "situational": string[],
            "roleSpecific": string[],
            "gapAddressing": string[]
          }`
        },
        {
          role: "user",
          content: `Match Analysis: ${JSON.stringify(matchAnalysis)}\n\nJob Description: ${jobDescription}`
        }
      ],
      temperature: 0.5,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw error;
  }
}
