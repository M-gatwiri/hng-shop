import { useState } from "react";
import { supabase } from "./lib/supabase";
import { Link } from "react-router-dom";
import { clearCart } from "./services/cartService";

function Checkout({ cart, setCart }) {
  const [formData, setFormData] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

if (cart.length === 0) {
  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <h1>Your cart is empty</h1>
        <p>Add some products before checking out.</p>

        <Link to="/" className="back-to-shop-button">
          ← Back to Shop
        </Link>
      </header>
    </div>
  );
}

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("Please sign in with Google before placing an order.");
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: formData.customer_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          total: cartTotal,
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(orderError.message);
      }

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
  throw new Error(itemsError.message);
}

alert("Order placed successfully!");
await clearCart(user.id);
setCart([]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
  <h1>Checkout</h1>
  <p>Complete your details to place your order.</p>

  <Link to="/" className="back-to-shop-button">
    ← Back to Shop
  </Link>
</header>

      <main className="checkout-content">
        <section className="checkout-form-section">
          <h2>Customer Details</h2>

          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="customer_name">Full Name</label>
              <input
                id="customer_name"
                name="customer_name"
                type="text"
                placeholder="Enter your full name"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. 0712345678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Delivery Address</label>
              <textarea
                id="address"
                name="address"
                placeholder="Enter your delivery address"
                rows="4"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="place-order-button"
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </section>

        <section className="order-summary">
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div className="summary-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <p>
                  {item.quantity} × KSh {item.price}
                </p>
              </div>

              <strong>
                KSh {item.price * item.quantity}
              </strong>
            </div>
          ))}

          <div className="summary-total">
            <span>Total</span>
            <strong>KSh {cartTotal}</strong>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Checkout;