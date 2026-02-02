export type SearchHit = {
  id: string;
  title: string;
  snippet?: string;
};

export interface SearchPort {
  query(text: string): Promise<SearchHit[]>;
}
