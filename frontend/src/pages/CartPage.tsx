import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function CartPage() {
  const [items, setItems] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setItems(cart)
  }, [])

  const updateQty = (id, delta) => {
    const updated = items.map(it => it.id === id ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it)
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const removeItem = (id) => {
    const updated = items.filter(it => it.id !== id)
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
  const delivery = subtotal > 0 ? 49 : 0
  const tax = subtotal * 0.05
  const total = subtotal + delivery + tax

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <div className="text-6xl mb-3">🛒</div>
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link to="/shop" className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center text-3xl shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} / {item.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded border hover:bg-gray-50">−</button>
                  <span className="font-semibold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded border hover:bg-gray-50">+</button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeItem(item.id)} className="text-xs text-red-600 hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5 h-fit">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>₹{delivery.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span className="text-green-700">₹{total.toFixed(2)}</span></div>
            </div>
            <button onClick={() => navigate('/checkout')} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}