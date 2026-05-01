import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const SEED_ORDERS = [
  { id: 'ORD-1001', date: '2024-05-12', total: 245.00, status: 'delivered', items: [{ name: 'Tomatoes', quantity: 2, emoji: '🍅' }, { name: 'Apples', quantity: 1, emoji: '🍎' }] },
  { id: 'ORD-1002', date: '2024-05-18', total: 189.50, status: 'shipped', items: [{ name: 'Bananas', quantity: 3, emoji: '🍌' }] },
  { id: 'ORD-1003', date: '2024-05-20', total: 327.75, status: 'pending', items: [{ name: 'Spinach', quantity: 2, emoji: '🥬' }, { name: 'Carrots', quantity: 1, emoji: '🥕' }] },
]

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('orders') || '[]')
    setOrders(stored.length > 0 ? stored : SEED_ORDERS)
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <Link to="/shop" className="text-green-600 hover:underline text-sm">Continue Shopping →</Link>
      </div>
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="font-bold text-gray-900">{order.id}</p>
                <p className="text-xs text-gray-500">{order.date}</p>
              </div>
              <span className={'px-3 py-1 rounded-full text-xs font-semibold capitalize ' + (STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700')}>
                {order.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {order.items.map((it, idx) => (
                <span key={idx} className="text-sm bg-gray-50 border rounded-full px-3 py-1">
                  {it.emoji} {it.name} ×{it.quantity}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-bold text-green-700">₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        ))}
        {orders.length === 0 ? <p className="text-center text-gray-500 py-12">No orders yet.</p> : null}
      </div>
    </div>
  )
}