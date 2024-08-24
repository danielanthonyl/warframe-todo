export interface Item {
  id: string;
  name: string;
  categoryId: string;
  image?: string; // DEBT! make all items have image on items.json
}
