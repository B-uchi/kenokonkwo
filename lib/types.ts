export type TributeStatus = "pending" | "approved" | "hidden";

export type Tribute = {
  id: string;
  name: string;
  relation: string;
  message: string;
  status: TributeStatus;
  createdAt: string;
};

export type Photo = {
  id: string;
  url: string;
  width: number;
  height: number;
  caption: string;
};

export type Rsvp = {
  id: string;
  name: string;
  phone: string;
  email: string;
  guests: number;
  createdAt: string;
};

/** Result shape returned by form server actions */
export type ActionState = { ok: boolean; message: string } | null;
