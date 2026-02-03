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
import type { Establishment } from "./mock-data";

interface EstablishmentModalData {
  onSuccess: (establishment: Establishment) => void;
}

const establishmentSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(120, "Máximo de 120 caracteres"),
  code: z
    .string()
    .min(1, "Código é obrigatório")
    .max(20, "Máximo de 20 caracteres"),
  address: z
    .string()
    .min(1, "Endereço é obrigatório")
    .max(180, "Máximo de 180 caracteres"),
  status: z.enum(["active", "inactive"]),
});

type EstablishmentFormValues = z.infer<typeof establishmentSchema>;

export function EstablishmentModal({
  onClose,
  data,
}: ModalProps<EstablishmentModalData>) {
  const form = useZodForm(establishmentSchema, {
    defaultValues: {
      name: "",
      code: "",
      address: "",
      status: "active",
    },
  });

  if (!data) return null;

  const handleSubmit = (values: EstablishmentFormValues) => {
    const newEstablishment: Establishment = {
      id: `est-${Date.now()}`,
      name: values.name,
      code: values.code,
      address: values.address,
      status: values.status,
      filesCount: 0,
    };

    data.onSuccess(newEstablishment);
    onClose();
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto p-6" id="form-estabelecimento">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Novo Estabelecimento</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os dados do estabelecimento para adicioná-lo à lista.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do estabelecimento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Matriz São Paulo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: MTZ-SP" {...field} />
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
                  <Input placeholder="Endereço completo" {...field} />
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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger size="default">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}























