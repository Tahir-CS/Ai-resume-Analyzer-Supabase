import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { AlertCircle, CheckCircle, Settings } from 'lucide-react'
import { testEmailConfiguration, getEmailConfigInstructions } from '../utils/supabaseEmailConfig'

export const EmailConfigDebug: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runEmailTest = async () => {
    setIsLoading(true)
    try {
      const result = await testEmailConfiguration()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        configured: false,
        error: 'Test failed',
        suggestion: 'Check console for more details'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const instructions = getEmailConfigInstructions()

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Email Configuration Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runEmailTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Email Configuration'}
        </Button>

        {testResult && (
          <div className={`flex items-start gap-2 p-4 rounded-lg ${
            testResult.configured 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {testResult.configured ? (
              <CheckCircle className="h-5 w-5 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5" />
            )}
            <div>
              <p className="font-medium">
                {testResult.configured ? 'Configuration OK' : 'Configuration Issue'}
              </p>
              <p className="text-sm mt-1">
                {testResult.message || testResult.error}
              </p>
              {testResult.suggestion && (
                <p className="text-sm mt-2 font-medium">
                  Suggestion: {testResult.suggestion}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">
              {instructions.development.title}
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {instructions.development.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-medium text-purple-900 mb-2">
              {instructions.production.title}
            </h3>
            <ul className="text-sm text-purple-800 space-y-1">
              {instructions.production.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Common Issues</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {instructions.commonIssues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
