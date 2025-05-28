"use client";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function RestoreSessionModal({ open, onConfirm, onCancel }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent className="z-[9999999]" noCloseIcon>
        <DialogHeader>
          <DialogTitle>Continuar Sessão?</DialogTitle>
        </DialogHeader>
        <p>Detectamos uma sessão anterior. Deseja continuar de onde parou?</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Não
          </Button>
          <Button onClick={onConfirm}>Sim</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
