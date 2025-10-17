import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Account from './pages/Account';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AddProduct from './pages/AddProduct';
import ProtectedRoute from './components/ProtectedRoute';
import CreateOrder from './components/CreateOrder';
import AdminRoute from './routes/AdminRoute';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import ReturnButton from './components/ReturnButton';
import './style.css';

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <Navbar />
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>}/>
            <Route path="/orders"element={<ProtectedRoute><CreateOrder /></ProtectedRoute>}/>
            <Route path="/admin/add-product" element={<AdminRoute><AddProduct /></AdminRoute>}/>
          </Routes>
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
