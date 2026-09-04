"use client";

import { useActionState, useState } from "react";
import {
  createGroupAction,
  deleteGroupAction,
  updateGroupAction,
} from "@/lib/data/groupActions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Stamp, type StampTone } from "@/components/ui/Stamp";
import { GROUP_STATUSES } from "@/lib/data/types";
import type { Group, GroupStatus } from "@/lib/data/types";
import type { FormState } from "@/lib/data/errors";

const STATUS_TONE: Record<GroupStatus, StampTone> = {
  active: "good",
  pending: "info",
  flagged: "bad",
  "needs-review": "warn",
};

function DeleteGroupButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" className="btn-danger" onClick={() => setOpen(true)}>
        Delete
      </Button>

      {open ? (
        <Modal title="Delete group" onClose={() => setOpen(false)}>
          <p>
            Delete <strong>{name}</strong>? This cannot be undone.
          </p>
          <form action={deleteGroupAction} className="btn-row modal-actions">
            <input type="hidden" name="id" value={id} />
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Delete group
            </Button>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

function GroupRow({ group }: { group: Group }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateGroupAction,
    {},
  );

  return (
    <li className="group-item">
      <div className="group-row">
        <Stamp tone={STATUS_TONE[group.status]}>{group.status}</Stamp>
        <form action={action} className="group-form">
          <input type="hidden" name="id" value={group.id} />
          <div className="field group-name-field">
            <label>Name</label>
            <input type="text" name="name" defaultValue={group.name} required />
          </div>
          <div className="field">
            <label>Status</label>
            <select name="status" defaultValue={group.status}>
              {GROUP_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Rules URL</label>
            <input type="text" name="rulesUrl" defaultValue={group.rulesUrl ?? ""} />
          </div>
          <div className="field">
            <label>Last post</label>
            <input type="date" name="lastPostDate" defaultValue={group.lastPostDate ?? ""} />
          </div>
          <div className="field group-notes-field">
            <label>Rules notes</label>
            <textarea name="rulesNotes" defaultValue={group.rulesNotes ?? ""} rows={2} />
          </div>
          <div className="group-row-actions">
            <Button type="submit" size="sm" variant="primary" disabled={pending}>
              Save
            </Button>
            <DeleteGroupButton id={group.id} name={group.name} />
          </div>
        </form>
        {state.error ? <div className="form-error">{state.error}</div> : null}
      </div>
    </li>
  );
}

export function GroupList({ groups }: { groups: Group[] }) {
  const [createState, createAction, creating] = useActionState<FormState, FormData>(
    createGroupAction,
    {},
  );

  return (
    <>
      <form action={createAction} className="group-form group-create">
        <div className="field group-name-field">
          <label htmlFor="new-group-name">New group</label>
          <input id="new-group-name" type="text" name="name" required autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="new-group-status">Status</label>
          <select id="new-group-status" name="status" defaultValue="active">
            {GROUP_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="new-group-url">Rules URL</label>
          <input id="new-group-url" type="text" name="rulesUrl" />
        </div>
        <div className="field">
          <label htmlFor="new-group-last-post">Last post</label>
          <input id="new-group-last-post" type="date" name="lastPostDate" />
        </div>
        <div className="field group-notes-field">
          <label htmlFor="new-group-notes">Rules notes</label>
          <textarea id="new-group-notes" name="rulesNotes" rows={2} />
        </div>
        <div className="group-row-actions">
          <Button type="submit" size="sm" variant="primary" disabled={creating}>
            Add
          </Button>
        </div>
        {createState.error ? <div className="form-error">{createState.error}</div> : null}
      </form>

      {groups.length === 0 ? (
        <div className="empty-state">No groups yet.</div>
      ) : (
        <ul className="group-listing">
          {groups.map((g) => (
            <GroupRow key={g.id} group={g} />
          ))}
        </ul>
      )}
    </>
  );
}
