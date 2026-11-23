import API from "../axios";
import { useState, useEffect, createContext } from "react";
import AuthService from "../services/auth.service";

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
  const [notification, setNotification] = useState(null);

  const notify = (message, type = "success") => {
    const id = Date.now();
    setNotification({ message, type, id });
    window.setTimeout(() => setNotification(current => current?.id === id ? null : current), 4000);
  };


  const addToCart = (product) => {
    const user = AuthService.getCurrentUser();
    if (!user?.accessToken && !user?.token && !user?.jwt) {
      sessionStorage.setItem("klyro-pending-cart-product", String(product.id));
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const stock = Number(product.stockQuantity || 0);
    if (!product.productAvailable || stock < 1) {
      notify("This product is currently out of stock.", "error");
      return;
    }
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    if (existingProductIndex !== -1) {
      if (cart[existingProductIndex].quantity >= stock) {
        notify(`Only ${stock} item${stock === 1 ? "" : "s"} available.`, "error");
        return;
      }
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

  useEffect(() => {
    const pendingProductId = sessionStorage.getItem("klyro-pending-cart-product");
    const user = AuthService.getCurrentUser();
    if (!pendingProductId || !data.length || (!user?.accessToken && !user?.token && !user?.jwt)) return;
    const product = data.find(item => String(item.id) === pendingProductId);
    sessionStorage.removeItem("klyro-pending-cart-product");
    if (product) addToCart(product);
  }, [data]);

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

const refreshData = async () => {
  try {
    const response = await API.get("/products");
    setData(response.data);
    setCart(current => current.map(cartItem => {
      const latest = response.data.find(product => product.id === cartItem.id);
      return latest ? { ...cartItem, ...latest, quantity: cartItem.quantity } : cartItem;
    }));
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
    
    notify("Product deleted successfully");
  } catch (error) {
    console.error("Delete error:", error);
    if (error.response?.status === 403) {
        notify("Access denied. Your account does not have admin privileges.", "error");
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
        deleteProduct,
        notify
      }}
    >
      {children}
      {notification && (
        <div className={`app-notification app-notification-${notification.type}`} role="status" aria-live="polite">
          <span className="app-notification-icon" aria-hidden="true">
            <i className={`bi ${notification.type === "error" ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`} />
          </span>
          <span className="app-notification-message">{notification.message}</span>
          <button type="button" className="app-notification-close" aria-label="Dismiss notification" onClick={() => setNotification(null)}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
};

export default AppContext;
