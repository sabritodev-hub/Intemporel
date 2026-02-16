"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deletePlat, togglePlatAvailability } from "@/app/actions";

export function ToggleAvailabilitySwitch({
  platId,
  available,
}: {
  platId: string
  available: boolean
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    const result = await togglePlatAvailability(platId, checked);
    setIsLoading(false);

    if (result.error) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={available}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <span className="text-xs text-bordeaux/70">
        {available ? "En stock" : "Rupture"}
      </span>
    </div>
  );
}

export function DeletePlatButton({
  platId,
  platName,
}: {
  platId: string
  platName: string
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deletePlat(platId);
    setIsLoading(false);

    if (result.error) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Plat supprimé",
      });
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le plat</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer "{platName}" ? Cette action est
            irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
