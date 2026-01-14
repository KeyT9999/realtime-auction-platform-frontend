import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { apiService } from './services/api'

function App() {
  const [count, setCount] = useState(0)
  const [apiStatus, setApiStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiService.get('/test')
      setApiStatus(response)
    } catch (err) {
      setError(err.message)
      console.error('Connection test failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Tự động test kết nối khi component mount
    testConnection()
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Realtime Auction Platform</h1>
      
      {/* API Connection Test */}
      <div className="card">
        <h2>Backend Connection Test</h2>
        <button onClick={testConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        {apiStatus && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#4ade80', borderRadius: '8px', color: 'white' }}>
            <p><strong>✅ Connected!</strong></p>
            <p>{apiStatus.message}</p>
            <p style={{ fontSize: '0.875rem' }}>Timestamp: {new Date(apiStatus.timestamp).toLocaleString()}</p>
          </div>
        )}
        
        {error && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#ef4444', borderRadius: '8px', color: 'white' }}>
            <p><strong>❌ Connection Failed</strong></p>
            <p>{error}</p>
            <p style={{ fontSize: '0.875rem' }}>Make sure backend is running on http://localhost:5145</p>
          </div>
        )}
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
