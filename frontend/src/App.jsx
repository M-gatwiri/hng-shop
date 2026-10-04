import { supabase } from "./lib/supabase";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { getProducts } from "./services/productService";
import {
  getCart,
  addToCart as addCartItem,
  decreaseCartItem,
  removeFromCart as removeCartItem,
} from "./services/cartService";
import "./App.css";
import Checkout from "./Checkout";


function Shop({ cart, setCart}) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        setError(error.message);
      }
    }

    loadProducts();
  }, []);

 useEffect(() => {
  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      try {
        const savedCart = await getCart(user.id);
        setCart(savedCart);
      } catch (error) {
        setError(error.message);
      }
    }
  }

  getCurrentUser();
}, [setCart]);

useEffect(() => {
  if (!user) {
    return;
  }

  const channel = supabase
    .channel(`cart-${user.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "cart_items",
        filter: `user_id=eq.${user.id}`,
      },
      async () => {
        try {
          const updatedCart = await getCart(user.id);
          setCart(updatedCart);
        } catch (error) {
          setError(error.message);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user, setCart]);

async function addToCart(product) {
  if (!user) {
    setError("Please sign in before adding items to your cart.");
    return;
  }

  try {
    await addCartItem(user.id, product.id);

    const updatedCart = await getCart(user.id);
    setCart(updatedCart);

    setCartMessage(`${product.name} added to cart!`);

    setTimeout(() => {
      setCartMessage("");
    }, 2000);
  } catch (error) {
    setError(error.message);
  }
}

 async function decreaseQuantity(productId) {
  if (!user) {
    return;
  }

  try {
    await decreaseCartItem(user.id, productId);

    const updatedCart = await getCart(user.id);
    setCart(updatedCart);
  } catch (error) {
    setError(error.message);
  }
}

async function removeFromCart(productId) {
  if (!user) {
    return;
  }

  try {
    await removeCartItem(user.id, productId);

    const updatedCart = await getCart(user.id);
    setCart(updatedCart);
  } catch (error) {
    setError(error.message);
  }
}

  const cartItemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
  (total, item) => total + item.price * item.quantity,
  0
);

async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    setError(error.message);
  }
}
async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    setError(error.message);
  } else {
    setUser(null);
    setCart([]);
  }
}

  return (
    <div className="shop">
      <header className="shop-header">
        <div>
          <p className="shop-label">HNG15 SHOP</p>
          <h1>Shop your favourites.</h1>
          <p className="shop-subtitle">
            Quality tech essentials at affordable prices.
          </p>
        </div>

   <div className="header-actions">
  {user ? (
    <div className="user-actions">
      <p className="logged-in-user">
        Signed in as {user.email}
      </p>

      <button className="login-button" onClick={signOut}>
        Sign Out
      </button>
    </div>
  ) : (
    <button className="login-button" onClick={signInWithGoogle}>
      Continue with Google
    </button>
  )}

  <button className="cart-button">
    🛒 Cart ({cartItemCount})
  </button>
</div>
      </header>

      <main className="products-section">
        {cartMessage && (
  <div className="cart-notification">
    🛒 {cartMessage}
  </div>
)}
        <div className="section-heading">
          <h2>Featured Products</h2>
          <span>{products.length} products</span>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="products-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <img
                  src={product.image_url}
                  alt={product.name}
                />
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>

                <p className="product-description">
                  {product.description}
                </p>

                <div className="product-bottom">
                  <div>
                    <p className="price">KSh {product.price}</p>
                    <p className="stock">
                      {product.stock} in stock
                    </p>
                  </div>

                  <button
                    className="add-button"
                    onClick={() => addToCart(product)}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
{cart.length > 0 && (
  <section className="cart-section">
    <div className="section-heading">
      <h2>Your Cart</h2>
      <span>{cartItemCount} items</span>
    </div>

    <div className="cart-items">
      {cart.map((item) => (
        <div className="cart-item" key={item.id}>
          <img src={item.image_url} alt={item.name} />

          <div className="cart-item-info">
            <h3>{item.name}</h3>
            <p>KSh {item.price}</p>
          </div>

          <div className="quantity-controls">
            <button onClick={() => decreaseQuantity(item.id)}>
              −
            </button>

            <span>{item.quantity}</span>

            <button onClick={() => addToCart(item)}>
              +
            </button>
          </div>

          <button
            className="remove-button"
            onClick={() => removeFromCart(item.id)}
          >
            Remove
          </button>

          <strong>
            KSh {item.price * item.quantity}
          </strong>
        </div>
      ))}
    </div>

    <div className="cart-summary">
      <div>
        <span>Cart Total</span>
        <strong>KSh {cartTotal}</strong>
      </div>

      <Link to="/checkout" className="checkout-button">
  Proceed to Checkout
</Link>
    </div>
  </section>
)}
      </main>
    </div>
  );
}

function App() {
  const [cart, setCart] = useState([]);
  return (
    <BrowserRouter>
      <Routes>
  <Route
    path="/"
    element={<Shop cart={cart} setCart={setCart} />}
  />

 <Route
  path="/checkout"
  element={<Checkout cart={cart} setCart={setCart} />}
/>
</Routes>
    </BrowserRouter>
  );
}

export default App;