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

type Role = {
  id: string;
  name: string;
  description: string | null;
};

interface AccessFormModalData {
  roles: Role[];
  onSuccess: () => void;
}

const accessSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  roleId: z.string().min(1, "Selecione um tipo de acesso"),
});

type AccessFormValues = z.infer<typeof accessSchema>;

export function AccessFormModal({ onClose, data }: ModalProps<AccessFormModalData>) {
  const form = useZodForm(accessSchema, {
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleId: data?.roles[0]?.id || "",
    },
  });

  const createUserMutation = api.user.register.useMutation({
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const assignRoleMutation = api.access.assignRole.useMutation({
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  if (!data) return null;

  const handleSubmit = async (values: AccessFormValues) => {
    try {
      const user = await createUserMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (values.roleId) {
        await assignRoleMutation.mutateAsync({
          userId: user.id,
          roleId: values.roleId,
        });
      }

      data.onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    }
  };

  return (
    <div className="p-6" id="form-access">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Novo acesso</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cadastre um novo usuário e defina o tipo de acesso.
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
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input
                    type="email"
                    placeholder="usuario@example.com"
                    {...field}
                  />
                </FormControl>
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
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de acesso</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de acesso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {data.roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting || assignRoleMutation.isPending}
            >
              {(form.formState.isSubmitting || assignRoleMutation.isPending) 
                ? "Salvando..." 
                : "Salvar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}










