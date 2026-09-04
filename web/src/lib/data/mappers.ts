import { camelizeKeys } from "@/lib/data/camelize";
import type {
  AgentRun,
  AssistantMessage,
  Client,
  ClientEvent,
  Group,
  Todo,
} from "@/lib/data/types";

/**
 * Row → domain object. Mostly a key rename (see camelize), plus the few
 * coercions PostgREST forces on us: `numeric` columns come back as strings.
 */
export function mapClientRow(row: Record<string, unknown>): Client {
  const c = camelizeKeys<Record<string, unknown>>(row);
  return {
    ...(c as unknown as Client),
    mrr: c.mrr == null ? 0 : Number(c.mrr),
  };
}

/** client_events row → domain object. Pure key rename, no coercions. */
export function mapClientEventRow(row: Record<string, unknown>): ClientEvent {
  return camelizeKeys<ClientEvent>(row);
}

export function mapTodoRow(row: Record<string, unknown>): Todo {
  return camelizeKeys<Todo>(row);
}

export function mapGroupRow(row: Record<string, unknown>): Group {
  return camelizeKeys<Group>(row);
}

export function mapAgentRunRow(row: Record<string, unknown>): AgentRun {
  return camelizeKeys<AgentRun>(row);
}

export function mapAssistantMessageRow(row: Record<string, unknown>): AssistantMessage {
  return camelizeKeys<AssistantMessage>(row);
}
