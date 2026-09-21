import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_PRODUCT_IMAGES,
  buildSearchFilter,
  isLegacySchemaError,
  parseSubmittedImageUrls,
  productImages,
  sanitizeSearchTerm,
  stripUnsupportedColumns,
} from "../lib/product-rules.ts";

describe("sanitizeSearchTerm", () => {
  it("keeps ordinary terms", () => {
    assert.equal(sanitizeSearchTerm("  kurtha  "), "kurtha");
    assert.equal(sanitizeSearchTerm("cotton t-shirt"), "cotton t-shirt");
  });

  it("blanks characters that would rewrite a PostgREST or() filter", () => {
    // A comma used to split the filter into extra conditions.
    assert.equal(sanitizeSearchTerm("shirt,red"), "shirt red");
    assert.equal(sanitizeSearchTerm("(sale)"), "sale");
    // % and _ are ilike wildcards, * is PostgREST's wildcard.
    assert.equal(sanitizeSearchTerm("100%_off"), "100 off");
    assert.equal(sanitizeSearchTerm('say "hi"'), "say hi");
  });

  it("returns null when nothing usable is left", () => {
    assert.equal(sanitizeSearchTerm("   "), null);
    assert.equal(sanitizeSearchTerm(",,,()"), null);
  });

  it("caps the term length", () => {
    assert.equal(sanitizeSearchTerm("a".repeat(200))?.length, 80);
  });
});

describe("buildSearchFilter", () => {
  it("matches name, type and description for the current schema", () => {
    assert.equal(
      buildSearchFilter("kurtha", true),
      "name.ilike.%kurtha%,type.ilike.%kurtha%,description.ilike.%kurtha%",
    );
  });

  it("drops the type column for the legacy fallback", () => {
    assert.equal(
      buildSearchFilter("kurtha", false),
      "name.ilike.%kurtha%,description.ilike.%kurtha%",
    );
  });

  it("never emits a filter containing a bare comma from user input", () => {
    const filter = buildSearchFilter("a,b", false);
    assert.equal(
      filter?.split(",").length,
      2, // exactly the two conditions we wrote, nothing injected
    );
  });

  it("returns null for an empty term", () => {
    assert.equal(buildSearchFilter("   ", true), null);
  });
});

describe("productImages", () => {
  it("puts the cover first and de-duplicates", () => {
    assert.deepEqual(
      productImages({ image_url: "a.jpg", image_urls: ["a.jpg", "b.jpg"] }),
      ["a.jpg", "b.jpg"],
    );
  });

  it("falls back to the gallery when there is no cover", () => {
    assert.deepEqual(productImages({ image_url: null, image_urls: ["b.jpg"] }), [
      "b.jpg",
    ]);
  });

  it("caps the gallery at the upload limit", () => {
    const urls = ["1", "2", "3", "4", "5", "6"];
    assert.equal(productImages({ image_url: null, image_urls: urls }).length, MAX_PRODUCT_IMAGES);
  });

  it("handles a product with no photos", () => {
    assert.deepEqual(productImages({ image_url: null, image_urls: null }), []);
  });
});

describe("parseSubmittedImageUrls", () => {
  it("parses an ordered list", () => {
    assert.deepEqual(parseSubmittedImageUrls('["b.jpg","a.jpg"]'), [
      "b.jpg",
      "a.jpg",
    ]);
  });

  it("degrades instead of throwing on malformed input", () => {
    assert.deepEqual(parseSubmittedImageUrls("not json"), []);
    assert.deepEqual(parseSubmittedImageUrls('{"a":1}'), []);
    assert.deepEqual(parseSubmittedImageUrls(null), []);
    assert.deepEqual(parseSubmittedImageUrls(undefined), []);
  });

  it("drops empty and non-string entries", () => {
    assert.deepEqual(parseSubmittedImageUrls('["a.jpg","",3,null]'), ["a.jpg"]);
  });
});

describe("isLegacySchemaError", () => {
  it("recognises a missing optional column", () => {
    assert.equal(
      isLegacySchemaError('column products.sale_price does not exist'),
      true,
    );
    assert.equal(
      isLegacySchemaError("Could not find the 'type' column in the schema cache"),
      true,
    );
  });

  it("ignores unrelated failures", () => {
    assert.equal(isLegacySchemaError("fetch failed"), false);
    assert.equal(isLegacySchemaError("permission denied for table products"), false);
    assert.equal(isLegacySchemaError(null), false);
  });
});

describe("stripUnsupportedColumns", () => {
  it("removes only the columns the database reported", () => {
    const payload = {
      name: "Kurtha",
      sale_price: 999,
      image_urls: ["a.jpg"],
      type: "kurtha",
    };
    assert.deepEqual(
      stripUnsupportedColumns(payload, "column products.type does not exist"),
      { name: "Kurtha", sale_price: 999, image_urls: ["a.jpg"] },
    );
  });

  it("removes every reported column when several are missing", () => {
    const payload = { name: "Kurtha", sale_price: 999, image_urls: ["a.jpg"] };
    assert.deepEqual(
      stripUnsupportedColumns(
        payload,
        "column products.sale_price does not exist; column products.image_urls does not exist",
      ),
      { name: "Kurtha" },
    );
  });
});
