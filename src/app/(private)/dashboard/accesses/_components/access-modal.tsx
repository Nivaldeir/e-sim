"use client";

import * as React from "react";
import { z } from "zod";
import { Button, Badge } from "@/src/shared/components/global/ui";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/src/shared/components/global/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/shared/components/global/ui/form";
import { useZodForm } from "@/src/shared/hook/use-zod-form";
import { ModalProps } from "@/src/shared/types/modal";
import { api } from "@/src/shared/context/trpc-context";
import { Input } from "@/src/shared/components/global/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/global/ui/select";
import { Separator } from "@/src/shared/components/global/ui/separator";

const DESCRICAO_POR_TIPO: Record<string, string> = {
  ADMINISTRADOR: "Acesso total ao sistema",
  EDITOR: "Pode criar e editar documentos",
  LEITOR: "Apenas visualização de documentos e Download",
};

function getDescricaoTipoAcesso(role: { name: string; description?: string | null }): string {
  return DESCRICAO_POR_TIPO[role.name] ?? role.description ?? role.name;
}

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{
    id: string;
    name: string;
    resource: string;
    action: string;
  }>;
};

type UserWithRoles = {
  id: string;
  name: string | null;
  email: string | null;
  roles: Role[];
  companies?: Array<{
    id: string;
    name: string;
    cnpj: string;
    code: string | null;
  }>;
};

interface AccessModalData {
  user: UserWithRoles;
  roles: Role[];
  onSuccess: () => void;
}

const accessFormSchema = z.object({
  roleIds: z.array(z.string()).min(0, "Selecione pelo menos um nível de acesso"),
  companies: z.array(z.object({
    companyId: z.string().min(1, "Selecione uma empresa"),
    code: z.string().optional(),
  })).optional().default([]),
});

type AccessFormValues = z.infer<typeof accessFormSchema>;

export function AccessModal({ onClose, data }: ModalProps<AccessModalData>) {
  const assignRoleMutation = api.access.assignRole.useMutation();
  const removeRoleMutation = api.access.removeRole.useMutation();
  const assignCompanyMutation = api.access.assignCompany.useMutation();
  const removeCompanyMutation = api.access.removeCompany.useMutation();

  const { data: companiesData } = api.company.list.useQuery({
    page: 1,
    pageSize: 100,
  });

  const companies = companiesData?.companies || [];

  const form = useZodForm(accessFormSchema, {
    defaultValues: {
      roleIds: data?.user.roles.map((r) => r.id) || [],
      companies: (data?.user.companies && data.user.companies.length > 0)
        ? data.user.companies.map((c) => ({
            companyId: c.id,
            code: c.code || undefined,
          }))
        : [],
    },
  });

  const selectedRoleIds = form.watch("roleIds");
  const currentRoleIds = React.useMemo(() => data?.user.roles.map((r) => r.id) || [], [data?.user.roles]);

  if (!data) return null;

  const { user, roles, onSuccess } = data;

  const handleSubmit = async (values: AccessFormValues) => {
    try {
      const rolesToAdd = values.roleIds.filter((id) => !currentRoleIds.includes(id));
      const rolesToRemove = currentRoleIds.filter((id) => !values.roleIds.includes(id));

      const validCompanies = (values.companies || []).filter((c) => c.companyId && c.companyId.trim() !== "");
      
      const currentCompanyIds = user.companies?.map((c) => c.id) || [];
      const newCompanyIds = validCompanies.map((c) => c.companyId);
      const companiesToAdd = validCompanies.filter((c) => !currentCompanyIds.includes(c.companyId));
      const companiesToRemove = currentCompanyIds.filter((id) => !newCompanyIds.includes(id));
      const companiesToUpdate = validCompanies.filter((c) => {
        const existing = user.companies?.find((uc) => uc.id === c.companyId);
        return existing && existing.code !== (c.code || null);
      });

      await Promise.all([
        ...rolesToAdd.map((roleId) =>
          assignRoleMutation.mutateAsync({
            userId: user.id,
            roleId,
          })
        ),
        ...rolesToRemove.map((roleId) =>
          removeRoleMutation.mutateAsync({
            userId: user.id,
            roleId,
          })
        ),
        ...companiesToAdd.map((company) =>
          assignCompanyMutation.mutateAsync({
            userId: user.id,
            companyId: company.companyId,
            code: company.code,
          })
        ),
        ...companiesToRemove.map((companyId) =>
          removeCompanyMutation.mutateAsync({
            userId: user.id,
            companyId,
          })
        ),
        ...companiesToUpdate.map((company) =>
          assignCompanyMutation.mutateAsync({
            userId: user.id,
            companyId: company.companyId,
            code: company.code,
          })
        ),
      ]);

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar acessos:", error);
      form.setError("root", { message: "Erro ao atualizar acessos. Tente novamente." });
    }
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Gerenciar Acessos - {user.name || user.email}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione os níveis de acesso para este usuário. As permissões serão
          aplicadas automaticamente conforme os roles selecionados.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="roleIds"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base font-semibold">Níveis de Acesso</FormLabel>
                  <FormDescription>
                    Selecione um ou mais níveis de acesso para o usuário
                  </FormDescription>
                </div>
                <div className="space-y-3">
                  {roles.map((role) => {
                    const isSelected = selectedRoleIds.includes(role.id);
                    return (
                      <FormField
                        key={role.id}
                        control={form.control}
                        name="roleIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={role.id}
                              className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(role.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, role.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== role.id
                                          )
                                        );
                                  }}
                                  className="mt-1"
                                />
                              </FormControl>
                              <div className="flex-1 flex items-center gap-2 flex-wrap">
                                <FormLabel className="font-medium cursor-pointer text-sm">
                                  {getDescricaoTipoAcesso(role)}
                                </FormLabel>
                                {isSelected && (
                                  <Badge variant="secondary" className="text-xs">
                                    Ativo
                                  </Badge>
                                )}
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <FormField
            control={form.control}
            name="companies"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base font-semibold">Empresas</FormLabel>
                  <FormDescription>
                    Associe o usuário a uma ou mais empresas. Opcionalmente, informe um código de funcionário.
                  </FormDescription>
                </div>
                <div className="space-y-3">
                  {(form.watch("companies") || []).map((company, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <FormField
                        control={form.control}
                        name={`companies.${index}.companyId`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-sm">Empresa</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma empresa" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {companies.map((comp: any) => (
                                  <SelectItem key={comp.id} value={comp.id}>
                                    {comp.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`companies.${index}.code`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel className="text-sm">Código</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: ADM001"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const current = form.getValues("companies") || [];
                          form.setValue(
                            "companies",
                            current.filter((_, i) => i !== index)
                          );
                        }}
                        className="mb-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = form.getValues("companies") || [];
                      form.setValue("companies", [
                        ...current,
                        { companyId: "", code: "" },
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Empresa
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={
                form.formState.isSubmitting || 
                assignRoleMutation.isPending || 
                removeRoleMutation.isPending ||
                assignCompanyMutation.isPending ||
                removeCompanyMutation.isPending
              }
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={
                form.formState.isSubmitting || 
                assignRoleMutation.isPending || 
                removeRoleMutation.isPending ||
                assignCompanyMutation.isPending ||
                removeCompanyMutation.isPending
              }
            >
              {(form.formState.isSubmitting || 
                assignRoleMutation.isPending || 
                removeRoleMutation.isPending ||
                assignCompanyMutation.isPending ||
                removeCompanyMutation.isPending) 
                ? "Salvando..." 
                : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

