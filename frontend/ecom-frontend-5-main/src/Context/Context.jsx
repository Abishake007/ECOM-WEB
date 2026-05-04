import API from "../axios";
import { useState, useEffect, createContext } from "react";

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  refreshData:() =>{},
  updateStockQuantity: (productId, newQuantity) =>{}
  
});

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);


  const addToCart = (product) => {
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    if (existingProductIndex !== -1) {
      const updatedCart = cart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...cart, { ...product, quantity: 1 }];
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

const refreshData = async () => {
  try {
    const response = await API.get("/products");
    setData(response.data);
    setIsError(false);
  } catch (error) {
    console.error("Fetch error:", error);
    setIsError(true);
    setData([]); 
  }
};

// Context/Context.jsx

const deleteProduct = async (id) => {
  try {
    // Use the custom 'API' instance to send the token automatically
    await API.delete(`/product/${id}`);
    
    // Update the state so the product disappears from the Admin screen
    setData(prevData => prevData.filter(product => product.id !== id));
    
    alert("Product deleted successfully");
  } catch (error) {
    console.error("Delete error:", error);
    if (error.response?.status === 403) {
        alert("Access Denied: Your account does not have Admin privileges.");
    }
  }
};
  const clearCart =() =>{
    setCart([]);
  }
  
  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  // ... existing code ...

  return (
    <AppContext.Provider 
      value={{ 
        data, 
        isError, 
        cart, 
        addToCart, 
        removeFromCart, 
        refreshData, 
        clearCart,
        deleteProduct 
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
