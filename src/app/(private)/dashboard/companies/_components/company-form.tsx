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

interface CompanyData {
  id: string;
  name: string;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
  status: "ACTIVE" | "INACTIVE";
}

interface CompanyModalData {
  company?: CompanyData;
  onSuccess: () => void;
}

const companySchema = z.object({
  name: z
    .string()
    .min(1, "Nome da empresa é obrigatório")
    .max(120, "Máximo de 120 caracteres"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function CompanyModal({ onClose, data }: ModalProps<CompanyModalData>) {
  const form = useZodForm(companySchema, {
    defaultValues: {
      name: data?.company?.name || "",
      status: data?.company?.status || "ACTIVE",
      cnpj: data?.company?.cnpj || "",
      stateRegistration: data?.company?.stateRegistration || "",
      municipalRegistration: data?.company?.municipalRegistration || "",
    },
  });

  if (!data) return null;

  const isEditing = !!data.company;

  const createMutation = api.company.create.useMutation({
    onSuccess: () => {
      data.onSuccess();
      onClose();
    },
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const updateMutation = api.company.update.useMutation({
    onSuccess: () => {
      data.onSuccess();
      onClose();
    },
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const deleteMutation = api.company.delete.useMutation({
    onSuccess: () => {
      data.onSuccess();
      onClose();
    },
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const handleSubmit = (values: CompanyFormValues) => {
    if (isEditing && data.company) {
      updateMutation.mutate({
        id: data.company.id,
        ...values,
      });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = () => {
    if (data.company && confirm("Tem certeza que deseja excluir esta empresa?")) {
      deleteMutation.mutate({ id: data.company.id });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="max-h-[90vh] overflow-y-auto p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">
          {isEditing ? "Editar Empresa" : "Nova Empresa"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditing
            ? "Edite os dados da empresa."
            : "Preencha os dados da empresa para adicioná-la à lista."}
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
                <FormLabel>Nome da Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: SANDVIK MGS S.A." {...field} />
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

          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stateRegistration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inscrição Estadual</FormLabel>
                <FormControl>
                  <Input placeholder="Inscrição estadual (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="municipalRegistration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inscrição Municipal</FormLabel>
                <FormControl>
                  <Input placeholder="Inscrição municipal (opcional)" {...field} />
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











