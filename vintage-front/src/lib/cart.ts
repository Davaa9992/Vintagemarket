"use client";
import { createLocalStore } from "./local-store";
import type { Product } from "./types";

/** Сагсанд хадгалах барааны агшин зураг (үнэ худалдан авах үеийнхээр) */
export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  tone: number;
  seller: string;
  era: string;
  grade: Product["grade"];
}

const EMPTY_CART: CartItem[] = [];
const cartStore = createLocalStore<CartItem[]>("vm_cart", EMPTY_CART);

export const useCart = cartStore.useValue;

export function addToCart(p: Product) {
  cartStore.set((items) =>
    items.some((i) => i.id === p.id)
      ? items
      : [
          ...items,
          {
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            image: p.images[0],
            tone: p.tone,
            seller: p.seller,
            era: p.era,
            grade: p.grade,
          },
        ],
  );
}

export function removeFromCart(id: string) {
  cartStore.set((items) => items.filter((i) => i.id !== id));
}

export function clearCart() {
  cartStore.set(EMPTY_CART);
}

const EMPTY_FAVS: string[] = [];
const favStore = createLocalStore<string[]>("vm_favs", EMPTY_FAVS);

export const useFavorites = favStore.useValue;

export function toggleFavorite(id: string) {
  favStore.set((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
}
