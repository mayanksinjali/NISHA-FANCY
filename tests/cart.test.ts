import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cartItemFromProduct, cartMessage, countCartItems } from "../lib/cart.ts";
import { formatPrice, formatRs, indexLabel } from "../lib/format.ts";

const product = {
  id: "p1",
  name: "Linen shirt",
  price: 2450,
  sale_price: null as number | null,
  category: "Men",
  sizes: ["S", "M"],
  colors: ["Black"],
  description: null,
  image_url: "https://example.com/a.jpg",
  image_urls: null,
  in_stock: true,
  created_at: null,
};

describe("cartItemFromProduct", () => {
  it("starts at quantity 1 with the chosen variant", () => {
    const item = cartItemFromProduct(product, "M", "Black");
    assert.equal(item.quantity, 1);
    assert.equal(item.selectedSize, "M");
    assert.equal(item.selectedColor, "Black");
    assert.equal(item.price, 2450);
  });

  it("charges the sale price when there is one", () => {
    const item = cartItemFromProduct({ ...product, sale_price: 1990 });
    assert.equal(item.price, 1990);
  });

  it("leaves the variant unset when nothing was chosen", () => {
    const item = cartItemFromProduct(product);
    assert.equal(item.selectedSize, null);
    assert.equal(item.selectedColor, null);
  });
});

describe("countCartItems", () => {
  it("sums quantities, not lines", () => {
    const item = cartItemFromProduct(product);
    assert.equal(
      countCartItems([item, { ...item, quantity: 3 }]),
      4,
    );
  });

  it("is zero for an empty cart", () => {
    assert.equal(countCartItems([]), 0);
  });
});

describe("cartMessage", () => {
  it("lists each line with quantity and a total", () => {
    const item = { ...cartItemFromProduct(product, "M"), quantity: 2 };
    const message = cartMessage([item]);
    assert.match(message, /Linen shirt/);
    assert.match(message, /Quantity: 2/);
    assert.match(message, /Size: M/);
    assert.match(message, /Total: Rs\. 4900/);
  });
});

describe("format", () => {
  it("drops decimals for whole rupees and keeps them otherwise", () => {
    assert.equal(formatPrice(2450), "2,450");
    assert.equal(formatPrice(2450.5), "2,450.50");
    assert.equal(formatRs(2450), "Rs. 2,450");
  });

  it("pads lookbook indices", () => {
    assert.equal(indexLabel(0), "01");
    assert.equal(indexLabel(11), "12");
  });
});
