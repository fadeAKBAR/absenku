"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2 } from 'lucide-react';

import type { Category } from '@/lib/types';
import { addCategory, deleteCategory } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';

const categorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter."),
});

type CategoryManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: Category[];
  onUpdate: () => void;
};

export function CategoryManager({ isOpen, onOpenChange, categories, onUpdate }: CategoryManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: z.infer<typeof categorySchema>) {
    setIsSubmitting(true);
    try {
      await addCategory(values.name);
      toast({ title: "Sukses", description: "Kategori baru telah ditambahkan." });
      form.reset();
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menambahkan kategori.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Apakah Anda yakin ingin menghapus kategori ini? Kategori ini akan dihapus dari semua rating yang ada.")) {
      try {
        await deleteCategory(id);
        toast({ title: "Sukses", description: "Kategori telah dihapus." });
        onUpdate();
      } catch (error) {
        toast({ title: "Error", description: "Gagal menghapus kategori.", variant: 'destructive' });
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kelola Kategori Rating</DialogTitle>
          <DialogDescription>Tambah, lihat, atau hapus kategori penilaian.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Nama Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Partisipasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? "Menambahkan..." : "Tambah"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Daftar Kategori</h3>
          <ScrollArea className="h-64 border rounded-md">
            <div className="p-4 space-y-2">
              {categories.length > 0 ? categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <span>{cat.name}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">Belum ada kategori.</p>}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
