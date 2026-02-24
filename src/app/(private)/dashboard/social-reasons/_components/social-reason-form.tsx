"use client";

import { z } from "zod";
import { Button } from "@/src/shared/components/global/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/shared/components/global/ui/form";
import { Input } from "@/src/shared/components/global/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/global/ui/select";
import { useZodForm } from "@/src/shared/hook/use-zod-form";
import { ModalProps } from "@/src/shared/types/modal";
import { api } from "@/src/shared/context/trpc-context";

interface SocialReasonData {
  id: string;
  name: string;
  shortName: string;
  status: "ACTIVE" | "INACTIVE";
}

interface SocialReasonModalData {
  socialReason?: SocialReasonData;
  onSuccess: () => void;
}

const socialReasonSchema = z.object({
  name: z.string().min(1, "Razão social é obrigatória").max(200, "Máximo de 200 caracteres"),
  shortName: z.string().min(1, "Razão social curta é obrigatória").max(60, "Máximo de 60 caracteres"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type SocialReasonFormValues = z.infer<typeof socialReasonSchema>;

export function SocialReasonModal({
  onClose,
  data,
}: ModalProps<SocialReasonModalData>) {
  const form = useZodForm(socialReasonSchema, {
    defaultValues: {
      name: data?.socialReason?.name || "",
      shortName: data?.socialReason?.shortName || "",
      status: data?.socialReason?.status || "ACTIVE",
    },
  });

  if (!data) return null;

  const isEditing = !!data.socialReason;

  const createMutation = api.socialReason.create.useMutation({
    onSuccess: () => {
      data.onSuccess();
      onClose();
    },
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const updateMutation = api.socialReason.update.useMutation({
    onSuccess: () => {
      data.onSuccess();
      onClose();
    },
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const deleteMutation = api.socialReason.delete.useMutation({
    onSuccess: () => {
      data.onSuccess();
      onClose();
    },
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const handleSubmit = (values: SocialReasonFormValues) => {
    if (isEditing && data.socialReason) {
      updateMutation.mutate({
        id: data.socialReason.id,
        ...values,
      });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = () => {
    if (data.socialReason && confirm("Tem certeza que deseja excluir esta razão social?")) {
      deleteMutation.mutate({ id: data.socialReason.id });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="max-h-[90vh] overflow-y-auto p-6" id="form-razao-social">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">
          {isEditing ? "Editar Razão Social" : "Nova Razão Social"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cadastre o nome completo e a razão social curta da empresa.
        </p>
      </div>

      {form.formState.errors.root && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razão social</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Tradição"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shortName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razão social curta</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: TRAD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger size="default">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Ativo</SelectItem>
                      <SelectItem value="INACTIVE">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between gap-3 pt-4 border-t">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting || isDeleting}
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}











