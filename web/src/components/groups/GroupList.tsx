"use client";

import { useActionState } from "react";
import {
  createGroupAction,
  deleteGroupAction,
  updateGroupAction,
} from "@/lib/data/groupActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

function GroupStatusSelect({ defaultValue, id }: { defaultValue: GroupStatus; id?: string }) {
  return (
    <Select defaultValue={defaultValue} name="status">
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {GROUP_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DeleteGroupButton({ id, name }: { id: string; name: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete group</AlertDialogTitle>
          <AlertDialogDescription>
            Delete <strong>{name}</strong>? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteGroupAction}>
            <input type="hidden" name="id" value={id} />
            <AlertDialogAction asChild variant="destructive">
              <button type="submit">Delete group</button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
            <Label>Name</Label>
            <Input type="text" name="name" defaultValue={group.name} required />
          </div>
          <div className="field">
            <Label>Status</Label>
            <GroupStatusSelect defaultValue={group.status} />
          </div>
          <div className="field">
            <Label>Rules URL</Label>
            <Input type="text" name="rulesUrl" defaultValue={group.rulesUrl ?? ""} />
          </div>
          <div className="field">
            <Label>Last post</Label>
            <Input type="date" name="lastPostDate" defaultValue={group.lastPostDate ?? ""} />
          </div>
          <div className="field group-notes-field">
            <Label>Rules notes</Label>
            <Textarea name="rulesNotes" defaultValue={group.rulesNotes ?? ""} rows={2} />
          </div>
          <div className="group-row-actions">
            <Button type="submit" size="sm" variant="default" disabled={pending}>
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
          <Label htmlFor="new-group-name">New group</Label>
          <Input id="new-group-name" type="text" name="name" required autoComplete="off" />
        </div>
        <div className="field">
          <Label htmlFor="new-group-status">Status</Label>
          <GroupStatusSelect defaultValue="active" id="new-group-status" />
        </div>
        <div className="field">
          <Label htmlFor="new-group-url">Rules URL</Label>
          <Input id="new-group-url" type="text" name="rulesUrl" />
        </div>
        <div className="field">
          <Label htmlFor="new-group-last-post">Last post</Label>
          <Input id="new-group-last-post" type="date" name="lastPostDate" />
        </div>
        <div className="field group-notes-field">
          <Label htmlFor="new-group-notes">Rules notes</Label>
          <Textarea id="new-group-notes" name="rulesNotes" rows={2} />
        </div>
        <div className="group-row-actions">
          <Button type="submit" size="sm" variant="default" disabled={creating}>
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
