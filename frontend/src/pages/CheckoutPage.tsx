import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CheckoutPage() {
  const [form, setForm] = useState({ name: 'Demo User', street: '12 MG Road', city: 'Bengaluru', zip: '560001', card: '4242 4242 4242 4242' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const items = JSON.parse(localStorage.getItem('cart') || '[]')
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
  const total = subtotal + 49 + subtotal * 0.05

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const order = {
      id: 'ORD-' + Date.now(),
      items, total, status: 'confirmed',
      date: new Date().toISOString().slice(0, 10),
      address: form.street + ', ' + form.city,
    }
    orders.unshift(order)
    localStorage.setItem('orders', JSON.stringify(orders))
    localStorage.setItem('cart', '[]')
    window.dispatchEvent(new Event('cart-updated'))
    setLoading(false)
    navigate('/orders')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="font-bold text-lg">Delivery Address</h2>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder="Street"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City"
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} placeholder="PIN code"
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <h2 className="font-bold text-lg pt-2">Payment</h2>
          <input value={form.card} onChange={e => setForm({ ...form, card: e.target.value })} placeholder="Card number / UPI"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5 h-fit">
          <h2 className="font-bold text-lg mb-3">Summary</h2>
          <p className="text-sm text-gray-600 mb-1">{items.length} items</p>
          <p className="text-2xl font-bold text-green-700 mb-4">₹{total.toFixed(2)}</p>
          <button type="submit" disabled={loading || items.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60">
            {loading ? 'Placing…' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  )
}