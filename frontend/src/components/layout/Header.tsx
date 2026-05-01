import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/shop', label: 'Shop' },
  { to: '/orders', label: 'Orders' },
  { to: '/admin', label: 'Admin' },
]

export default function Header() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((s, it) => s + (it.quantity || 0), 0))
    }
    updateCart()
    window.addEventListener('cart-updated', updateCart)
    window.addEventListener('storage', () => setToken(localStorage.getItem('token')))
    return () => window.removeEventListener('cart-updated', updateCart)
  }, [location.pathname])

  const onLogin = location.pathname === '/' || location.pathname === '/login'
  if (onLogin) return null

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    navigate('/login')
  }

  return (
    <header className="w-full shrink-0 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 md:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/shop" className="text-lg font-bold text-green-700 hover:text-green-800">
            🥬 FreshCart
          </Link>
        </div>
        <nav className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3" aria-label="Main">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                'rounded-md px-3 py-2 text-sm font-bold transition-colors ' +
                (isActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-green-700')
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/cart" className="relative rounded-md px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-green-700">
            🛒 Cart
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            ) : null}
          </Link>
          {token ? (
            <button onClick={logout} className="rounded-md px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50">
              Logout
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  )
}