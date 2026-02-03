"use client";

import { useState } from "react";
import { useZodForm } from "@/src/shared/hook/use-zod-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/shared/components/global/ui/form";
import { Input } from "@/src/shared/components/global/ui/input";
import { Textarea } from "@/src/shared/components/global/ui/textarea";
import { Button } from "@/src/shared/components/global/ui/button";
import { Checkbox } from "@/src/shared/components/global/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/global/ui/select";
import { api } from "@/src/shared/context/trpc-context";
import { Plus, X, Trash2 } from "lucide-react";
import type { ModalProps } from "@/src/shared/context/modal-context";

const fieldTypeOptions = [
  { value: "TEXT", label: "Texto" },
  { value: "NUMBER", label: "Número" },
  { value: "DATE", label: "Data" },
  { value: "EMAIL", label: "Email" },
  { value: "CPF", label: "CPF" },
  { value: "CNPJ", label: "CNPJ" },
  { value: "PHONE", label: "Telefone" },
  { value: "TEXTAREA", label: "Área de Texto" },
  { value: "SELECT", label: "Seleção" },
  { value: "FILE", label: "Arquivo" },
];

type Field = {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  options?: string[];
};

const templateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type TemplateFormModalData = {
  template?: {
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean;
    fields: Array<{
      id: string;
      name: string;
      label: string;
      type: string;
      required: boolean;
      order: number;
      options: string[];
    }>;
  };
  onSuccess?: () => void;
};

export function TemplateFormModal({
  onClose,
  data,
}: ModalProps<TemplateFormModalData>) {
  const [fields, setFields] = useState<Field[]>(
    data?.template?.fields.map((f, index) => ({
      id: f.id || `field-${index}`,
      name: f.name,
      label: f.label,
      type: f.type,
      required: f.required,
      order: f.order,
      options: f.options || [],
    })) || []
  );

  const form = useZodForm(templateSchema, {
    defaultValues: {
      name: data?.template?.name || "",
      description: data?.template?.description || "",
      isDefault: data?.template?.isDefault || false,
    },
  });

  const createMutation = api.documentTemplate.create.useMutation({
    onSuccess: () => {
      data?.onSuccess?.();
      onClose();
    },
  });

  const updateMutation = api.documentTemplate.update.useMutation({
    onSuccess: () => {
      data?.onSuccess?.();
      onClose();
    },
  });

  const addField = () => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      name: "",
      label: "",
      type: "TEXT",
      required: false,
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    setFields(
      fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  };

  const handleSubmit = async (values: z.infer<typeof templateSchema>) => {
    if (fields.length === 0) {
      form.setError("root", { message: "Adicione pelo menos um campo" });
      return;
    }

    // Validar campos
    for (const field of fields) {
      if (!field.name || !field.label) {
        form.setError("root", {
          message: "Todos os campos devem ter nome e label",
        });
        return;
      }
      if (field.type === "SELECT" && (!field.options || field.options.length === 0)) {
        form.setError("root", {
          message: "Campos do tipo SELECT devem ter pelo menos uma opção",
        });
        return;
      }
    }

    const fieldsData = fields.map((field, index) => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      order: index,
      options: field.type === "SELECT" ? field.options || [] : undefined,
    }));

    if (data?.template) {
      updateMutation.mutate({
        id: data.template.id,
        ...values,
        fields: fieldsData,
      });
    } else {
      createMutation.mutate({
        ...values,
        fields: fieldsData,
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-h-[90vh] overflow-y-auto p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">
          {data?.template ? "Editar Template" : "Novo Template"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {data?.template
            ? "Edite as informações do template"
            : "Crie um novo template de documento"}
        </p>
      </div>

      {form.formState.errors.root && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Template</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Alvará de Funcionamento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o template..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Template Padrão</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Marque se este template deve ser usado como padrão
                  </p>
                </div>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Campos do Template</h3>
                <p className="text-sm text-muted-foreground">
                  Defina os campos que compõem este template
                </p>
              </div>
              <Button type="button" onClick={addField} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Campo
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Nenhum campo adicionado. Clique em "Adicionar Campo" para começar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Campo {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Nome (identificador)
                        </label>
                        <Input
                          placeholder="nome_campo"
                          value={field.name}
                          onChange={(e) =>
                            updateField(field.id, { name: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Label (exibição)
                        </label>
                        <Input
                          placeholder="Nome do Campo"
                          value={field.label}
                          onChange={(e) =>
                            updateField(field.id, { label: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Tipo
                        </label>
                        <Select
                          value={field.type}
                          onValueChange={(value) =>
                            updateField(field.id, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateField(field.id, {
                                required: e.target.checked,
                              })
                            }
                            className="rounded"
                          />
                          <span className="text-sm font-medium">
                            Obrigatório
                          </span>
                        </label>
                      </div>
                    </div>

                    {field.type === "SELECT" && (
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Opções (uma por linha)
                        </label>
                        <Textarea
                          placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                          value={field.options?.join("\n") || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              options: e.target.value
                                .split("\n")
                                .filter((o) => o.trim()),
                            })
                          }
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Digite uma opção por linha
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : data?.template
                ? "Atualizar"
                : "Criar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

