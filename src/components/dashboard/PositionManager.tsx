
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Edit } from 'lucide-react';

import type { Position } from '@/lib/types';
import { addPosition, deletePosition, updatePosition } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';

const positionSchema = z.object({
  name: z.string().min(3, "Nama jabatan minimal 3 karakter."),
});

type PositionManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  positions: Position[];
  onUpdate: () => void;
};

export function PositionManager({ isOpen, onOpenChange, positions, onUpdate }: PositionManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof positionSchema>>({
    resolver: zodResolver(positionSchema),
    defaultValues: { name: "" },
  });

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    form.reset({ name: position.name });
  };

  const handleCancelEdit = () => {
    setEditingPosition(null);
    form.reset({ name: "" });
  };

  async function onSubmit(values: z.infer<typeof positionSchema>) {
    setIsSubmitting(true);
    try {
      if (editingPosition) {
        await updatePosition(editingPosition.id, values.name);
        toast({ title: "Sukses", description: "Jabatan telah diperbarui." });
      } else {
        await addPosition(values.name);
        toast({ title: "Sukses", description: "Jabatan baru telah ditambahkan." });
      }
      handleCancelEdit();
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan jabatan.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Apakah Anda yakin ingin menghapus jabatan ini? Jabatan ini akan dihapus dari semua siswa.")) {
      try {
        await deletePosition(id);
        toast({ title: "Sukses", description: "Jabatan telah dihapus." });
        onUpdate();
      } catch (error) {
        toast({ title: "Error", description: "Gagal menghapus jabatan.", variant: 'destructive' });
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); handleCancelEdit(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingPosition ? 'Edit Jabatan' : 'Tambah Jabatan'}</DialogTitle>
          <DialogDescription>Kelola jabatan yang dapat diberikan kepada siswa.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Jabatan</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Ketua Kelas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              {editingPosition && (
                <Button type="button" variant="ghost" onClick={handleCancelEdit}>Batal</Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                <Plus className="h-4 w-4 mr-2" />
                {isSubmitting ? "Menyimpan..." : (editingPosition ? "Simpan Perubahan" : "Tambah")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Daftar Jabatan</h3>
          <ScrollArea className="h-64 border rounded-md">
            <div className="p-4 space-y-2">
              {positions.length > 0 ? positions.map(pos => (
                <div key={pos.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <span>{pos.name}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(pos)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(pos.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">Belum ada jabatan.</p>}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
