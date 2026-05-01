import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import LoginPage from './pages/LoginPage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import AdminPage from './pages/AdminPage'

function Protected({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/shop" element={<Protected><ShopPage /></Protected>} />
            <Route path="/product/:id" element={<Protected><ProductDetailPage /></Protected>} />
            <Route path="/cart" element={<Protected><CartPage /></Protected>} />
            <Route path="/checkout" element={<Protected><CheckoutPage /></Protected>} />
            <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
            <Route path="/admin" element={<Protected><AdminPage /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
