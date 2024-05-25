export interface Tag {
  tag_name: string;
  tag_color: string;
  category: string | null;
}
export interface TagResponse extends Tag {
  id: number;
}
