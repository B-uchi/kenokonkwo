import "server-only";
import type { Tribute, TributeStatus } from "@/lib/types";
import { sql } from "./db";

type Row = {
  id: string;
  name: string;
  relation: string;
  message: string;
  status: TributeStatus;
  created_at: Date;
};

const toTribute = (r: Row): Tribute => ({
  id: r.id,
  name: r.name,
  relation: r.relation,
  message: r.message,
  status: r.status,
  createdAt: new Date(r.created_at).toISOString(),
});

export const TRIBUTES_PER_PAGE = 12;

export async function getTributesPage(status: TributeStatus, page: number) {
  const rows = (await sql`
    select id, name, relation, message, status, created_at
    from tributes
    where status = ${status}
    order by created_at desc
    limit ${TRIBUTES_PER_PAGE} offset ${(page - 1) * TRIBUTES_PER_PAGE}`) as Row[];
  return rows.map(toTribute);
}

export async function getTributes(status: TributeStatus) {
  const rows = (await sql`
    select id, name, relation, message, status, created_at
    from tributes
    where status = ${status}
    order by created_at desc`) as Row[];
  return rows.map(toTribute);
}

export async function getTributeCounts() {
  const rows = (await sql`
    select status, count(*)::int as count from tributes group by status`) as {
    status: TributeStatus;
    count: number;
  }[];
  const counts: Record<TributeStatus, number> = { pending: 0, approved: 0, hidden: 0 };
  for (const r of rows) counts[r.status] = r.count;
  return counts;
}

export async function createTribute(input: {
  name: string;
  relation: string;
  message: string;
}) {
  await sql`
    insert into tributes (name, relation, message)
    values (${input.name}, ${input.relation}, ${input.message})`;
}

export async function setTributeStatus(id: string, status: TributeStatus) {
  await sql`
    update tributes set status = ${status}, reviewed_at = now()
    where id = ${id}`;
}

export async function deleteTribute(id: string) {
  await sql`delete from tributes where id = ${id}`;
}
