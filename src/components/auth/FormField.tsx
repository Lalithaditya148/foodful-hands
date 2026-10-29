import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  error?: string;
};

export function FormField({ label, icon, error, id, className = "", ...rest }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          className={`w-full rounded-xl border bg-card py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/25 ${
            icon ? "pr-4 pl-11" : "px-4"
          } ${error ? "border-danger" : "border-border"} ${className}`}
          {...rest}
        />
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}
