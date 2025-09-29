"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useCommonTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import React from "react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  confirmText,
  cancelText,
  confirmButtonVariant = "destructive",
}: DeleteConfirmDialogProps) {
  const t = useCommonTranslations();

  const finalTitle = title || t("deleteDialog.title");
  const finalConfirmText = confirmText || t("deleteDialog.confirm");
  const finalCancelText = cancelText || t("cancel");

  const finalDescription = description || (
    <>
      {t("deleteDialog.description")}
      {itemName ? (
        <span className="font-semibold"> {`"${itemName}"`}</span>
      ) : (
        ` ${t("deleteDialog.selectedItem")}`
      )}
      .
    </>
  );

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="z-[9999999999]">
        <AlertDialogHeader>
          <AlertDialogTitle>{finalTitle}</AlertDialogTitle>
          {finalDescription && (
            <AlertDialogDescription>{finalDescription}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {finalCancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className={cn(buttonVariants({ variant: confirmButtonVariant }))}
              onClick={handleConfirm}
            >
              {finalConfirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
