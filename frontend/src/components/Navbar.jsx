import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaShoppingBag,
  FaHeart,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaSignOutAlt,
} from 'react-icons/fa';
import { isLoggedIn, logout } from '../utils/auth';
import '../style.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="logo">SmartBasket</div>

        <button className="menu-toggle absolute top-4 right-4 md:static md:ml-auto" onClick={toggleMenu}>
          <FaBars />
        </button>
        
        <div className={`nav-links ${isOpen ? 'show' : ''}`}>
          <NavLink to="/" className="nav-link" onClick={closeMenu}>
            <FaHome className="inline-icon" /> Home
          </NavLink>

          <NavLink to="/shop" className="nav-link" onClick={closeMenu}>
            <FaShoppingBag className="inline-icon" /> Shop
          </NavLink>

          <NavLink to="/wishlist" className="nav-link" onClick={closeMenu}>
            <FaHeart className="inline-icon" /> Wishlist
          </NavLink>

          <NavLink to="/cart" className="nav-link" onClick={closeMenu}>
            <FaShoppingCart className="inline-icon" /> Cart
          </NavLink>

          <NavLink to="/account" className="nav-link" onClick={closeMenu}>
            <FaUser className="inline-icon" /> Account
          </NavLink>

          {isLoggedIn() && (
            <button
              onClick={() => {
                closeMenu();
                logout();
              }}
              className="nav-link text-red-500 flex items-center gap-1"
            >
              <FaSignOutAlt className="inline-icon" /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
