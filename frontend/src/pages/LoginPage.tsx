import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo123')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    localStorage.setItem('token', 'demo-preview-token')
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Demo User', email, role: 'customer' }))
    setLoading(false)
    navigate('/shop')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🥬</div>
          <h1 className="text-2xl font-bold text-gray-900">FreshCart</h1>
          <p className="text-sm text-gray-500">Veggies & Fruits delivered fresh</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm">
          <p className="font-semibold text-green-700 mb-1">Demo Credentials</p>
          <p className="text-green-600">Email: <span className="font-mono">demo@example.com</span></p>
          <p className="text-green-600">Password: <span className="font-mono">demo123</span></p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email"
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password"
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}