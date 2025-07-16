export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | undefined;
  inputClassName?: string;
}

export interface FieldProps extends InputProps {
  errorMessage?: string;
  label?: string;
  inputClassName?: string;
}
