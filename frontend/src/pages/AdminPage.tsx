import { useState } from 'react'

const INITIAL = [
  { id: 1, name: 'Organic Tomatoes', category: 'vegetables', price: 60, stock: 50, organic: true },
  { id: 2, name: 'Fresh Spinach', category: 'vegetables', price: 40, stock: 30, organic: true },
  { id: 3, name: 'Red Apples', category: 'fruits', price: 180, stock: 80, organic: false },
  { id: 4, name: 'Bananas', category: 'fruits', price: 50, stock: 100, organic: false },
  { id: 5, name: 'Carrots', category: 'vegetables', price: 45, stock: 8, organic: true },
]

export default function AdminPage() {
  const [products, setProducts] = useState(INITIAL)
  const [form, setForm] = useState({ name: '', category: 'vegetables', price: '', stock: '' })

  const addProduct = (e) => {
    e.preventDefault()
    if (!form.name || !form.price) return
    setProducts([...products, { id: Date.now(), name: form.name, category: form.category, price: parseFloat(form.price), stock: parseInt(form.stock) || 0, organic: false }])
    setForm({ name: '', category: 'vegetables', price: '', stock: '' })
  }

  const removeProduct = (id) => setProducts(products.filter(p => p.id !== id))

  const totalStock = products.reduce((s, p) => s + p.stock, 0)
  const lowStock = products.filter(p => p.stock < 10).length
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Stock</p>
          <p className="text-2xl font-bold text-green-700">{totalStock}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-red-600">{lowStock}</p>
        </div>
      </div>

      <form onSubmit={addProduct} className="bg-white rounded-xl border p-5 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name"
          className="md:col-span-2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
          className="border rounded-lg px-3 py-2">
          <option value="vegetables">Vegetables</option>
          <option value="fruits">Fruits</option>
        </select>
        <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price (₹)" type="number" step="0.01"
          className="border rounded-lg px-3 py-2" />
        <input value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number"
          className="border rounded-lg px-3 py-2" />
        <button type="submit" className="md:col-span-5 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Add Product</button>
      </form>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name} {p.organic ? <span className="text-xs bg-green-100 text-green-700 ml-1 px-1.5 rounded">Organic</span> : null}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{p.category}</td>
                <td className="px-4 py-3">₹{p.price.toFixed(2)}</td>
                <td className={'px-4 py-3 font-semibold ' + (p.stock < 10 ? 'text-red-600' : 'text-gray-700')}>{p.stock}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => removeProduct(p.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t bg-gray-50 px-4 py-3 text-sm text-gray-600 flex justify-between">
          <span>Inventory value</span>
          <span className="font-bold text-gray-900">₹{totalValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}