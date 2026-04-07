export type PublicUser = {
  id: string;
  email: string;
  nickname: string;
  photoURL: string;
};

export type TodoDoc = {
  _id: string;
  title: string;
  completed: boolean;
  dateKey?: string;
  createdAt?: string;
};

export type LedgerDoc = {
  _id?: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  dateKey: string;
  memo?: string;
  createdAt?: number;
};

export type NoteDoc = {
  _id: string;
  title: string;
  body: string;
  createdAt?: number;
  updatedAt?: number;
};
