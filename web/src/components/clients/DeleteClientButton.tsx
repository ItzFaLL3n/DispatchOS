"use client";

import { useState } from "react";
import { deleteClientAction } from "@/lib/data/clientActions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function DeleteClientButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Delete
      </Button>

      {open ? (
        <Modal title="Delete client" onClose={() => setOpen(false)}>
          <p>
            Delete <strong>{name}</strong>? This removes the client and its
            entire history. This cannot be undone.
          </p>
          <form action={deleteClientAction} className="btn-row modal-actions">
            <input type="hidden" name="id" value={id} />
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Delete client
            </Button>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
