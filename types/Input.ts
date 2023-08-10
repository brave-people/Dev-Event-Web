export type InputProps = {
  updateInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  submitInput: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  label: string;
  size?: string;
  icon?: string;
  iconStyle?: string;
  initInput: () => void;
  input: string | undefined;
}