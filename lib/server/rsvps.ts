import "server-only";
import type { Rsvp } from "@/lib/types";
import { sql } from "./db";

export const PER_PAGE = 20;

type Row = {
  id: string;
  name: string;
  phone: string;
  email: string;
  guests: number;
  created_at: Date;
};

const toRsvp = (r: Row): Rsvp => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  email: r.email,
  guests: r.guests,
  createdAt: new Date(r.created_at).toISOString(),
});

export async function getRsvpSummary() {
  const [row] = (await sql`
    select count(*)::int as replies, coalesce(sum(guests), 0)::int as guests
    from rsvps`) as { replies: number; guests: number }[];
  return row ?? { replies: 0, guests: 0 };
}

export async function getRsvpPage(page: number) {
  const rows = (await sql`
    select id, name, phone, email, guests, created_at
    from rsvps
    order by created_at desc
    limit ${PER_PAGE} offset ${(page - 1) * PER_PAGE}`) as Row[];
  return rows.map(toRsvp);
}

export async function getAllRsvps() {
  const rows = (await sql`
    select id, name, phone, email, guests, created_at
    from rsvps
    order by created_at desc`) as Row[];
  return rows.map(toRsvp);
}

export async function createRsvp(input: {
  name: string;
  phone: string;
  email: string;
  guests: number;
}) {
  await sql`
    insert into rsvps (name, phone, email, guests)
    values (${input.name}, ${input.phone}, ${input.email}, ${input.guests})`;
}

export async function deleteRsvp(id: string) {
  await sql`delete from rsvps where id = ${id}`;
}
