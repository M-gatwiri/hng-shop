import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import formData from "form-data";
import Mailgun from "mailgun.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

app.get("/", (req, res) => {
  res.json({ message: "HNG Shop API is running!" });
});

app.post("/api/send-confirmation", async (req, res) => {
  try {
    const { email, customerName, orderId, total } = req.body;

    if (!email || !customerName || !orderId || total === undefined) {
      return res.status(400).json({
        message: "Missing required email information.",
      });
    }

    const message = {
      from: process.env.MAILGUN_FROM,
      to: email,
      subject: "HNG Shop Order Confirmation",
      text: `Hello ${customerName},

Your order has been placed successfully.

Order ID: ${orderId}
Total: KSh ${total}

Thank you for shopping with HNG Shop.`,
    };

    const result = await mg.messages.create(
      process.env.MAILGUN_DOMAIN,
      message
    );

    res.json({
      message: "Confirmation email sent successfully.",
      id: result.id,
    });
  } catch (error) {
    console.error("Mailgun error:", error);

    res.status(500).json({
      message: "Failed to send confirmation email.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});