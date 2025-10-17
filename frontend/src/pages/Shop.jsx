import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import ProductCard from '../components/ProductCard';
import '../style.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get('/product'); 
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, [navigate]);

  const filteredProducts = products
    .filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) => category === 'all' || product.category === category)
    .sort((a, b) => {
      if (sort === 'price') return a.price - b.price;
      if (sort === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="shop-page">
      <div className="shop-hero">
        <h1 className="shop-title">Explore Our Stunning Products</h1>
        <p className="shop-subtitle">
          Find your favorites with vibrant colors & smooth style
        </p>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select onChange={(e) => setCategory(e.target.value)} value={category}>
          <option value="all">All</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="jewellery">Jewellery</option>
          <option value="electronics">Electronics</option>
          <option value="footwear">Footwear</option>
          <option value="appliances">Appliances</option>
          <option value="bags">Bags</option>
          <option value="accessories">Accessories</option>
          <option value="homedecor">Home Decor</option>
          <option value="kitchenware">Kitchen Ware</option>
          <option value="beauty">Beauty</option>
          <option value="stationery">Stationery</option>
        </select>

        <select onChange={(e) => setSort(e.target.value)} value={sort}>
          <option value="">Sort</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={{
            ...product,
            price: new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(product.price)
          }} />
        ))}
      </div>
    </div>
  );
};

export default Shop;
