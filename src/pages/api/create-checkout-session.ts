export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";
import products from "../../../public/data/products.json";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), { status: 400 });
    }

    const lineItems: any[] = [];

    for (const cartItem of items) {
      const product = products.find((p) => p.id === cartItem.id);
      if (!product) {
        return new Response(JSON.stringify({ error: `Invalid product ID: ${cartItem.id}` }), { status: 400 });
      }

      const quantity = cartItem.quantity ?? 1;

      // ONE-TIME PRODUCTS ONLY
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: product.price
        },
        quantity
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      // Collect billing address
      billing_address_collection: "required",

      // Collect shipping address (US only)
      shipping_address_collection: {
        allowed_countries: ["US"]
      },

      customer_creation: "always",
      line_items: lineItems,

      allow_promotion_codes: true,
      automatic_tax: { enabled: true },

      success_url: "https://stephanystreasures.com/success",
      cancel_url: "https://stephanystreasures.com/cancel"
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("STRIPE ERROR:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
