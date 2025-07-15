import { useState, useEffect } from "react"
import { useParams } from "wouter"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, User, Award, Briefcase, GraduationCap, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Resume {
  id: number
  originalName: string
  analysisResult: any
  extractedText: string
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(`/api/resumes/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch resume')
        }
        const data = await response.json()
        setResume(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load resume analysis.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchResume()
    }
  }, [id, toast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading resume analysis...</p>
        </div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Resume not found</h1>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  const analysis = resume.analysisResult || {}

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resume Analysis
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered analysis of {resume.originalName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.personalInfo ? (
                <div className="space-y-2">
                  <p><strong>Name:</strong> {analysis.personalInfo.name || 'Not specified'}</p>
                  <p><strong>Email:</strong> {analysis.personalInfo.email || 'Not specified'}</p>
                  <p><strong>Phone:</strong> {analysis.personalInfo.phone || 'Not specified'}</p>
                  <p><strong>Location:</strong> {analysis.personalInfo.location || 'Not specified'}</p>
                </div>
              ) : (
                <p className="text-gray-500">Personal information not extracted</p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.skills && analysis.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills extracted</p>
              )}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.experience ? (
                <div className="space-y-4">
                  <p><strong>Years of Experience:</strong> {analysis.experience.yearsOfExperience || 'Not specified'}</p>
                  {analysis.experience.positions && analysis.experience.positions.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.experience.positions.map((position: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold">{position.title}</h4>
                          <p className="text-sm text-gray-600">{position.company} • {position.duration}</p>
                          <p className="text-sm mt-1">{position.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No positions extracted</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Experience information not extracted</p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.education && analysis.education.length > 0 ? (
                <div className="space-y-3">
                  {analysis.education.map((edu: any, index: number) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-sm text-gray-600">{edu.institution} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No education information extracted</p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {analysis.summary && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{analysis.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Strengths and Improvement Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.strengths && analysis.strengths.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-green-700">{strength}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No strengths identified</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.improvementAreas && analysis.improvementAreas.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {analysis.improvementAreas.map((area: string, index: number) => (
                    <li key={index} className="text-orange-700">{area}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No improvement areas identified</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => window.location.href = '/upload'}>
            Analyze Another Resume
          </Button>
        </div>
      </div>
    </div>
  )
}
