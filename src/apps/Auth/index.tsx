"use client";

import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/form/fields/PasswordField";
import { TextField } from "@/components/ui/form/fields/TextField";
import { Separator } from "@/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAppTranslations } from "@/hooks/useTranslations";
import { useAuthStore } from "@/stores/useAuthStore";
import { Github, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLogin, useRegister } from "./hooks/useApi";
import { useLoginForm, useRegisterForm } from "./hooks/useForm";

export const Auth = () => {
  const { login } = useAuthStore();
  const t = useAppTranslations("auth");

  const [activeTab, setActiveTab] = useState("login");

  const loginApi = useLogin();
  const registerApi = useRegister();

  const loginForm = useLoginForm({
    onSubmit: () => {
      loginApi
        .makeRequest(loginForm.getValues())
        .then((response) => {
          login(response.data.token);
          toast.success(t("messages.loginSuccess"), {
            description: t("messages.loginSuccessDesc"),
          });
          loginForm.reset();
        })
        .catch(() => {
          toast.error(t("messages.loginError"));
        });
    },
    t,
  });

  const registerForm = useRegisterForm({
    onSubmit: () => {
      registerApi
        .makeRequest(registerForm.getValues())
        .then(() => {
          setActiveTab("login");
          toast.success(t("messages.registerSuccess"));
          registerForm.reset();
        })
        .catch(() => {
          toast.error(t("messages.registerError"));
        });
    },
    t,
  });

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="@container bg-background grid w-full gap-4 p-6 h-full relative overflow-auto stable-scrollbar-container">
      <div className="text-center py-2 @sm:py-4 @lg:py-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-foreground mb-1 @sm:mb-2">
          {t("title")}
        </h1>
        <p className="text-xs @sm:text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col gap-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">{t("tabs.login")}</TabsTrigger>
          <TabsTrigger value="register">{t("tabs.register")}</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-4 max-w-5xl">
          <form onSubmit={loginForm.handleSubmit} className="space-y-4">
            <TextField
              label={t("form.email")}
              placeholder={t("form.emailPlaceholder")}
              {...loginForm.register("email")}
              errorMessage={loginForm.formState.errors?.email?.message}
            />
            <PasswordField
              label={t("form.password")}
              {...loginForm.register("password")}
              errorMessage={loginForm.formState.errors?.password?.message}
            />
            <Button loading={loginApi.loading} type="submit" className="w-full">
              {t("buttons.login")}
            </Button>
          </form>

          <div className="text-center">
            <Button variant="link" className="text-sm">
              {t("form.forgotPassword")}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="register" className="space-y-4 max-w-5xl">
          <form onSubmit={registerForm.handleSubmit} className="space-y-4">
            <TextField
              label={t("form.name")}
              placeholder={t("form.namePlaceholder")}
              {...registerForm.register("name")}
              errorMessage={registerForm.formState.errors?.name?.message}
            />

            <TextField
              label={t("form.email")}
              placeholder={t("form.emailPlaceholder")}
              {...registerForm.register("email")}
              errorMessage={registerForm.formState.errors?.email?.message}
            />

            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
              <PasswordField
                label={t("form.password")}
                {...registerForm.register("password")}
                errorMessage={registerForm.formState.errors?.password?.message}
              />
              <PasswordField
                label={t("form.confirmPassword")}
                {...registerForm.register("confirmPassword")}
                errorMessage={
                  registerForm.formState.errors?.confirmPassword?.message
                }
              />
            </div>
            <Button
              loading={registerApi.loading}
              type="submit"
              className="w-full"
            >
              {t("buttons.createAccount")}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="h-fit relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("social.continueWith")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("Google")}
          className="w-full"
        >
          <Mail className="mr-2 h-4 w-4" />
          {t("social.google")}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("GitHub")}
          className="w-full"
        >
          <Github className="mr-2 h-4 w-4" />
          {t("social.github")}
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {t("terms.agreement")}{" "}
        <Button variant="link" className="p-0 h-auto text-sm">
          {t("terms.termsOfService")}
        </Button>{" "}
        {t("terms.and")}{" "}
        <Button variant="link" className="p-0 h-auto text-sm">
          {t("terms.privacyPolicy")}
        </Button>
      </div>
    </div>
  );
};
