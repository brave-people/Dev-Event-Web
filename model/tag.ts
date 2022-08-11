export interface Tag {
  tag_name: string;
  tag_color: string;
}
export interface TagResponse extends Tag {
  id: number;
}
