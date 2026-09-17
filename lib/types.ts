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

/** Result shape returned by form server actions */
export type ActionState = { ok: boolean; message: string } | null;
