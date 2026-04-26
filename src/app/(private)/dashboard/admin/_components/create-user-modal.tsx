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
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  roleId: z.string().min(1, "Selecione um perfil"),
  companyId: z.string().optional(),
  employeeCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Data {
  roles: { id: string; name: string; description: string | null }[];
  companies: { id: string; name: string }[];
  onSuccess: () => void;
}

export function CreateUserModal({ onClose, data }: ModalProps<Data>) {
  const form = useZodForm(schema, {
    defaultValues: { name: "", email: "", password: "", roleId: "", companyId: "", employeeCode: "" },
  });

  const createUser = api.admin.createUser.useMutation({
    onError: (e) => form.setError("root", { message: e.message }),
  });

  if (!data) return null;

  const handleSubmit = async (values: FormValues) => {
    try {
      await createUser.mutateAsync({
        ...values,
        companyId: values.companyId || undefined,
        employeeCode: values.employeeCode || undefined,
      });
      data.onSuccess();
      onClose();
    } catch {}
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Novo usuário</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Crie um usuário e associe-o a uma empresa.
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
                <FormLabel>Nome</FormLabel>
                <FormControl><Input placeholder="Nome completo" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl><Input type="email" placeholder="usuario@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl><Input type="password" placeholder="Mínimo 6 caracteres" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perfil de acesso</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione um perfil" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {data.roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa (opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione uma empresa" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {data.companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employeeCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código do funcionário (opcional)</FormLabel>
                <FormControl><Input placeholder="Ex: ADM001" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={form.formState.isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Criar usuário"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
