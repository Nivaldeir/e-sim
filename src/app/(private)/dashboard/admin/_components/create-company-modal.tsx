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

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

type FormValues = z.infer<typeof schema>;

interface Data {
  onSuccess: () => void;
}

export function CreateCompanyModal({ onClose, data }: ModalProps<Data>) {
  const form = useZodForm(schema, {
    defaultValues: { name: "", cnpj: "", stateRegistration: "", municipalRegistration: "", status: "ACTIVE" },
  });

  const createCompany = api.admin.createCompany.useMutation({
    onError: (e) => form.setError("root", { message: e.message }),
  });

  if (!data) return null;

  const handleSubmit = async (values: FormValues) => {
    try {
      await createCompany.mutateAsync(values);
      data.onSuccess();
      onClose();
    } catch {}
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Nova empresa</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cadastre uma nova empresa no sistema.
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
                <FormControl><Input placeholder="Nome da empresa" {...field} /></FormControl>
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
                <FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="stateRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inscrição estadual</FormLabel>
                  <FormControl><Input placeholder="Opcional" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="municipalRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inscrição municipal</FormLabel>
                  <FormControl><Input placeholder="Opcional" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativa</SelectItem>
                    <SelectItem value="INACTIVE">Inativa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={form.formState.isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Criar empresa"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
