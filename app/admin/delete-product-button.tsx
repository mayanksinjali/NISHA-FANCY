"use client";

import { deleteProductAction } from "./actions";

/**
 * Delete button with a confirm step. Uses the native confirm dialog on purpose:
 * zero JS weight, and it's a familiar full-screen sheet on mobile.
 */
export default function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(event) => {
        if (!confirm(`Delete "${name}"? This can't be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="eyebrow px-3 py-2.5 text-terracotta transition-colors hover:text-terracotta-deep"
      >
        Delete
      </button>
    </form>
  );
}
