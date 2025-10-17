import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosConfig';

export default function AdminDashboard() {
  const [product, setProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    rating: '',
    image: ''
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState('products');

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/product', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch products:', err.response?.data || err.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch orders:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setProduct({
      title: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      rating: '',
      image: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        setMessage("❌ Unauthorized access. Please login as admin.");
        return;
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      if (editingId) {
        await axios.put(`/product/${editingId}`, product, { headers });
        setMessage('✅ Product updated successfully!');
      } else {
        await axios.post('/product', product, { headers });
        setMessage('✅ Product added successfully!');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error("❌ Add/Update product error:", err.response?.data || err.message);
      setMessage(`❌ Failed: ${err.response?.data?.message || 'Add/update product failed.'}`);
    }
  };

  const handleEdit = (prod) => {
    setProduct({
      title: prod.title,
      description: prod.description,
      price: prod.price,
      category: prod.category,
      stock: prod.stock,
      rating: prod.rating,
      image: prod.image
    });
    setEditingId(prod._id);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('🗑️ Product deleted');
      fetchProducts();
    } catch (err) {
      console.error("❌ Delete error:", err.response?.data || err.message);
      setMessage('❌ Failed to delete product.');
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.put(`/orders/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      console.error("❌ Failed to update order status:", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-200 rounded-full p-1">
          <button
            className={`px-6 py-2 rounded-full transition-colors duration-200 ${view === 'products'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-700 hover:bg-white'
              }`}
            onClick={() => setView('products')}
          >
            Products
          </button>
          <button
            className={`px-6 py-2 rounded-full transition-colors duration-200 ${view === 'orders'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-700 hover:bg-white'
              }`}
            onClick={() => setView('orders')}
          >
            Orders
          </button>
        </div>
      </div>

      {view === 'products' && (
        <>
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-3xl mx-auto mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-center text-indigo-700">
              {editingId ? 'Update Product' : 'Add New Product'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input name="title" value={product.title} onChange={handleChange} placeholder="Title" required className="px-4 py-2 border rounded" />
              <input name="price" value={product.price} onChange={handleChange} placeholder="Price" type="number" required className="px-4 py-2 border rounded" />
              <input name="category" value={product.category} onChange={handleChange} placeholder="Category" required className="px-4 py-2 border rounded" />
              <input name="stock" value={product.stock} onChange={handleChange} placeholder="Stock" type="number" required className="px-4 py-2 border rounded" />
              <input name="rating" value={product.rating} onChange={handleChange} placeholder="Rating" type="number" required className="px-4 py-2 border rounded" />
              <input name="image" value={product.image} onChange={handleChange} placeholder="Image URL" required className="px-4 py-2 border rounded" />
            </div>
            <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description" required className="w-full px-4 py-2 border rounded" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
            {message && <p className="text-center mt-2 text-sm">{message}</p>}
          </form>

          <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p._id} className="bg-white rounded shadow p-4 flex flex-col">
                <img src={p.image} alt={p.title} className="w-full h-40 object-cover rounded mb-2" />
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="text-sm text-gray-600 mb-1">₹{p.price}</p>
                <p className="text-sm">{p.category}</p>
                <p className="text-sm text-gray-500">Stock: {p.stock} | Rating: {p.rating}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(p)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'orders' && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-indigo-700 text-center">Orders</h2>
          <div className="overflow-x-auto bg-white rounded shadow p-4">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Order ID</th>
                  <th className="p-2 border">Customer</th>
                  <th className="p-2 border">Products</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td className="p-2 border">{order._id}</td>
                    <td className="p-2 border">{order.user?.name} ({order.user?.email})</td>
                    <td className="p-2 border">
                      {order.items.map(p => (
                        <div key={p.product._id}>
                          {p.product.title} x {p.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="p-2 border">{order.status}</td>
                    <td className="p-2 border">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
