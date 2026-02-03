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

interface OrganizationData {
  id: string;
  name: string;
  shortName: string;
  cnpj: string;
  type: "FEDERAL" | "ESTADUAL" | "MUNICIPAL" | "OUTROS";
  address: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  status: "ACTIVE" | "INACTIVE";
}

interface OrgaoModalData {
  organization?: OrganizationData;
  onSuccess: () => void;
}

const orgaoSchema = z.object({
  name: z.string().min(1, "Nome do órgão é obrigatório").max(200, "Máximo de 200 caracteres"),
  shortName: z.string().min(1, "Nome curto é obrigatório").max(60, "Máximo de 60 caracteres"),
  cnpj: z.string().optional(),
  type: z.enum(["FEDERAL", "ESTADUAL", "MUNICIPAL", "OUTROS"]),
  address: z.string().max(180).optional(),
  district: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().max(10).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type OrgaoFormValues = z.infer<typeof orgaoSchema>;

export function OrgaoModal({ onClose, data }: ModalProps<OrgaoModalData>) {
  if (!data) return null;

  const isEditing = !!data.organization;

  const form = useZodForm(orgaoSchema, {
    defaultValues: {
      name: data.organization?.name || "",
      shortName: data.organization?.shortName || "",
      cnpj: data.organization?.cnpj || "",
      type: data.organization?.type || "OUTROS",
      address: data.organization?.address || "",
      district: data.organization?.district || "",
      city: data.organization?.city || "",
      state: data.organization?.state || "",
      zipCode: data.organization?.zipCode || "",
      status: data.organization?.status || "ACTIVE",
    },
  });

  const createMutation = api.organization.create.useMutation({
    onSuccess: () => {
      data.onSuccess();
      onClose();
    },
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const updateMutation = api.organization.update.useMutation({
    onSuccess: () => {
      data.onSuccess();
      onClose();
    },
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const deleteMutation = api.organization.delete.useMutation({
    onSuccess: () => {
      data.onSuccess();
      onClose();
    },
    onError: (error) => {
      form.setError("root", { message: error.message });
    },
  });

  const handleSubmit = (values: OrgaoFormValues) => {
    if (isEditing && data.organization) {
      updateMutation.mutate({
        id: data.organization.id,
        ...values,
      });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = () => {
    if (data.organization && confirm("Tem certeza que deseja excluir este órgão?")) {
      deleteMutation.mutate({ id: data.organization.id });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="max-h-[90vh] overflow-y-auto p-6" id="form-orgao">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">
          {isEditing ? "Editar Órgão" : "Novo Órgão"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cadastre o nome do órgão e seus dados cadastrais.
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
                <FormLabel>Órgão</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do órgão" {...field} />
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
                <FormLabel>Nome curto</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: CAIXA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger size="default">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FEDERAL">Federal</SelectItem>
                      <SelectItem value="ESTADUAL">Estadual</SelectItem>
                      <SelectItem value="MUNICIPAL">Municipal</SelectItem>
                      <SelectItem value="OUTROS">Outros</SelectItem>
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
                <FormLabel>CNPJ (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input placeholder="Bairro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Município</FormLabel>
                  <FormControl>
                    <Input placeholder="Município" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UF</FormLabel>
                  <FormControl>
                    <Input placeholder="SP" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input placeholder="00000-000" {...field} />
                  </FormControl>
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











