import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], summary: { total: 0, discount: 0, subtotal: 0 } });
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }
      
      setCart(data);
      setCartCount(data.items.reduce((total, item) => total + item.quantity, 0));
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }
      
      await fetchCart();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/cart/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update quantity');
      }
      
      await fetchCart();
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove item');
      }
      
      await fetchCart();
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to clear cart');
      }
      
      setCart({ items: [], summary: { total: 0, discount: 0, subtotal: 0 } });
      setCartCount(0);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      loading,
      error,
      fetchCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};