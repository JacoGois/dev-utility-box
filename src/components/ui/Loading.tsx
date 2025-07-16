import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const standard = "h-6 w-6";
const xxs = "h-3 w-3";
const xs = "h-4 w-4";
const sm = "h-5 w-5";
const md = "h-7 w-7";
const lg = "h-8 w-8";
const xl = "h-10 w-10";
const xxl = "h-12 w-12";

export const sizesValue = {
  standard,
  xxs,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
};

const loadingVariants = cva("animate-spin", {
  variants: {
    size: {
      default: standard,
      xxs: xxs,
      xs: xs,
      sm: sm,
      md: md,
      lg: lg,
      xl: xl,
      xxl: xxl,
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface LoadingProps extends VariantProps<typeof loadingVariants> {
  className?: string | undefined;
}

export const Loading = ({ size, className, ...props }: LoadingProps) => {
  return (
    <Loader2
      className={cn(
        "text-primary animate-spin",
        loadingVariants({ size, className })
      )}
      {...props}
    />
  );
};
