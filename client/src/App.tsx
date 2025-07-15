import { Router, Route, Switch } from 'wouter'
import { Toaster } from '@/components/ui/toaster'
import HomePage from '@/pages/HomePage'
import UploadPage from '@/pages/UploadPage'
import AnalysisPage from '@/pages/AnalysisPage'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/upload" component={UploadPage} />
          <Route path="/analysis/:id" component={AnalysisPage} />
          <Route>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
                <a href="/" className="text-primary hover:underline">
                  Return to Home
                </a>
              </div>
            </div>
          </Route>
        </Switch>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
