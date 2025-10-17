import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </WishlistProvider>
  </React.StrictMode>
);
