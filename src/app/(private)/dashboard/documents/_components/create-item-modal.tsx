"use client";

import * as React from "react";
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
import { useZodForm } from "@/src/shared/hook/use-zod-form";
import { ModalProps } from "@/src/shared/types/modal";

interface CreateItemModalData {
  type: "folder" | "file";
  parentId?: string;
  onSuccess: (name: string, type: "folder" | "file") => void;
}

const createItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").refine(
    (val) => {
      if (val.includes("/") || val.includes("\\")) {
        return false;
      }
      return true;
    },
    { message: "Nome não pode conter / ou \\" }
  ),
});

type CreateItemFormValues = z.infer<typeof createItemSchema>;

export function CreateItemModal({ onClose, data }: ModalProps<CreateItemModalData>) {
  if (!data) return null;

  const { type, onSuccess } = data;

  const form = useZodForm(createItemSchema, {
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = async (values: CreateItemFormValues) => {
    onSuccess(values.name, type);
    onClose();
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">
          Criar {type === "folder" ? "Pasta" : "Arquivo"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Digite o nome do {type === "folder" ? "pasta" : "arquivo"} que deseja criar.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    placeholder={type === "folder" ? "Nome da pasta" : "Nome do arquivo"}
                    {...field}
                    autoFocus
                  />
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
              {form.formState.isSubmitting ? "Criando..." : "Criar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

