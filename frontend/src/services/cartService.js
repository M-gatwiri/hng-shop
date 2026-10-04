import { supabase } from "../lib/supabase";

export async function getCart(userId) {
  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      user_id,
      product_id,
      quantity,
      created_at,
      product:products (
        id,
        name,
        description,
        price,
        stock,
        image_url
      )
    `)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item) => ({
    ...item.product,
    quantity: item.quantity,
    cartItemId: item.id,
  }));
}

export async function addToCart(userId, productId) {
  const { data: existingItem, error: findError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (existingItem) {
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + 1,
      })
      .eq("id", existingItem.id);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await supabase
    .from("cart_items")
    .insert({
      user_id: userId,
      product_id: productId,
      quantity: 1,
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function decreaseCartItem(userId, productId) {
  const { data: existingItem, error: findError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (!existingItem) {
    return;
  }

  if (existingItem.quantity > 1) {
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity - 1,
      })
      .eq("id", existingItem.id);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  await removeFromCart(userId, productId);
}

export async function removeFromCart(userId, productId) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function clearCart(userId) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}