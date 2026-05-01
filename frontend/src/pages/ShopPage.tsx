import { useState } from 'react'
import { Link } from 'react-router-dom'

const PRODUCTS = [
  { id: 1, name: 'Organic Tomatoes', category: 'vegetables', price: 60, unit: 'kg', emoji: '🍅', organic: true, stock: 50 },
  { id: 2, name: 'Fresh Spinach', category: 'vegetables', price: 40, unit: 'bunch', emoji: '🥬', organic: true, stock: 30 },
  { id: 3, name: 'Red Apples', category: 'fruits', price: 180, unit: 'kg', emoji: '🍎', organic: false, stock: 80 },
  { id: 4, name: 'Bananas', category: 'fruits', price: 50, unit: 'dozen', emoji: '🍌', organic: false, stock: 100 },
  { id: 5, name: 'Carrots', category: 'vegetables', price: 45, unit: 'kg', emoji: '🥕', organic: true, stock: 60 },
  { id: 6, name: 'Strawberries', category: 'fruits', price: 250, unit: 'kg', emoji: '🍓', organic: true, stock: 25 },
  { id: 7, name: 'Broccoli', category: 'vegetables', price: 80, unit: 'piece', emoji: '🥦', organic: false, stock: 40 },
  { id: 8, name: 'Oranges', category: 'fruits', price: 90, unit: 'kg', emoji: '🍊', organic: false, stock: 70 },
  { id: 9, name: 'Bell Peppers', category: 'vegetables', price: 120, unit: 'kg', emoji: '🫑', organic: true, stock: 45 },
  { id: 10, name: 'Grapes', category: 'fruits', price: 140, unit: 'kg', emoji: '🍇', organic: false, stock: 35 },
  { id: 11, name: 'Cucumbers', category: 'vegetables', price: 35, unit: 'piece', emoji: '🥒', organic: true, stock: 55 },
  { id: 12, name: 'Watermelon', category: 'fruits', price: 80, unit: 'piece', emoji: '🍉', organic: false, stock: 20 },
]

export default function ShopPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [organicOnly, setOrganicOnly] = useState(false)

  const filtered = PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || p.category === category
    const matchOrg = !organicOnly || p.organic
    return matchSearch && matchCat && matchOrg
  })

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(c => c.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Fresh Produce</h1>
        <p className="text-gray-500">Hand-picked fruits & veggies, delivered daily</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="flex-1 min-w-[200px] border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="all">All Categories</option>
          <option value="vegetables">Vegetables</option>
          <option value="fruits">Fruits</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input type="checkbox" checked={organicOnly} onChange={e => setOrganicOnly(e.target.checked)} className="h-4 w-4" />
          Organic only
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
            <Link to={'/product/' + product.id} className="block">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 h-32 flex items-center justify-center text-6xl">
                {product.emoji}
              </div>
            </Link>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                {product.organic ? <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Organic</span> : null}
              </div>
              <p className="text-xs text-gray-500 mb-2 capitalize">{product.category}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-700">₹{product.price.toFixed(2)}<span className="text-xs text-gray-500">/{product.unit}</span></span>
                <button onClick={() => addToCart(product)} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700">
                  + Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 ? <p className="text-center text-gray-500 py-8">No products found.</p> : null}
    </div>
  )
}