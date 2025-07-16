import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .email({ message: "E-mail inválido." })
    .min(1, { message: "Campo obrigatório." }),
  password: z.string().min(1, { message: "Campo obrigatório." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface UseLoginFormProps {
  onSubmit: SubmitHandler<LoginFormValues>;
}

export const useLoginForm = ({ onSubmit }: UseLoginFormProps) => {
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

const registerSchema = z.object({
  name: z.string().min(1, { message: "Campo obrigatório." }),
  email: z
    .email({ message: "E-mail inválido." })
    .min(1, { message: "Campo obrigatório." }),
  password: z.string().min(1, { message: "Campo obrigatório." }),
  confirmPassword: z.string().min(1, { message: "Campo obrigatório." }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

interface UseRegisterFormProps {
  onSubmit: SubmitHandler<RegisterFormValues>;
}

export const useRegisterForm = ({ onSubmit }: UseRegisterFormProps) => {
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
