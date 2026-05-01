import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const PRODUCTS = {
  '1': { id: 1, name: 'Organic Tomatoes', category: 'vegetables', price: 60, unit: 'kg', emoji: '🍅', organic: true, stock: 50, origin: 'Maharashtra', description: 'Vine-ripened organic tomatoes, bursting with flavor. Perfect for salads, sauces, and sandwiches.' },
  '2': { id: 2, name: 'Fresh Spinach', category: 'vegetables', price: 40, unit: 'bunch', emoji: '🥬', organic: true, stock: 30, origin: 'Local Farm', description: 'Tender baby spinach leaves, packed with iron and vitamins.' },
  '3': { id: 3, name: 'Red Apples', category: 'fruits', price: 180, unit: 'kg', emoji: '🍎', organic: false, stock: 80, origin: 'Himachal Pradesh', description: 'Crisp and sweet red apples — a classic healthy snack.' },
  '4': { id: 4, name: 'Bananas', category: 'fruits', price: 50, unit: 'dozen', emoji: '🍌', organic: false, stock: 100, origin: 'Kerala', description: 'Naturally ripened bananas, rich in potassium.' },
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = PRODUCTS[id || '1'] || PRODUCTS['1']
  const [qty, setQty] = useState(1)

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(c => c.id === product.id)
    if (existing) {
      existing.quantity += qty
    } else {
      cart.push({ ...product, quantity: qty })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    alert('Added to cart!')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/shop" className="text-green-600 hover:underline text-sm mb-4 inline-block">← Back to Shop</Link>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden grid md:grid-cols-2 gap-0">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 h-72 md:h-full flex items-center justify-center text-9xl">
          {product.emoji}
        </div>
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-500">{product.category}</span>
            {product.organic ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Organic</span> : null}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-2xl font-bold text-green-700 mb-4">₹{product.price.toFixed(2)}<span className="text-sm text-gray-500">/{product.unit}</span></p>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="text-sm text-gray-500 mb-6 space-y-1">
            <p><span className="font-medium text-gray-700">Origin:</span> {product.origin}</p>
            <p><span className="font-medium text-gray-700">In stock:</span> {product.stock} {product.unit}s</p>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg border hover:bg-gray-50">−</button>
            <span className="font-semibold w-8 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-lg border hover:bg-gray-50">+</button>
          </div>
          <button onClick={addToCart} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
            Add {qty} to Cart
          </button>
        </div>
      </div>
    </div>
  )
}