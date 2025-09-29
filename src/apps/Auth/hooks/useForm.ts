import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

interface UseFormProps {
  onSubmit: SubmitHandler<unknown>;
  t: (key: string) => string;
}

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .email({ message: t("validation.invalidEmail") })
      .min(1, { message: t("validation.required") }),
    password: z.string().min(1, { message: t("validation.required") }),
  });

const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(1, { message: t("validation.required") }),
      email: z
        .email({ message: t("validation.invalidEmail") })
        .min(1, { message: t("validation.required") }),
      password: z.string().min(1, { message: t("validation.required") }),
      confirmPassword: z.string().min(1, { message: t("validation.required") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormValues = z.infer<
  ReturnType<typeof createRegisterSchema>
>;

export const useLoginForm = ({ onSubmit, t }: UseFormProps) => {
  const loginSchema = createLoginSchema(t);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  return {
    ...form,
    handleSubmit: form.handleSubmit(onSubmit),
  };
};

export const useRegisterForm = ({ onSubmit, t }: UseFormProps) => {
  const registerSchema = createRegisterSchema(t);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  return {
    ...form,
    handleSubmit: form.handleSubmit(onSubmit),
  };
};
