
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reportAbsence } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

const absenceSchema = z.object({
  status: z.enum(['sick', 'permit'], { required_error: "Anda harus memilih status." }),
  reason: z.string().min(1, "Alasan tidak boleh kosong.").max(500, "Alasan maksimal 500 karakter."),
});

type ReportAbsenceDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  studentId: string;
  onSubmitted: () => void;
};

export function ReportAbsenceDialog({ isOpen, onOpenChange, studentId, onSubmitted }: ReportAbsenceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof absenceSchema>>({
    resolver: zodResolver(absenceSchema),
    defaultValues: {
      reason: "",
    },
  });

  async function onSubmit(values: z.infer<typeof absenceSchema>) {
    setIsSubmitting(true);
    try {
      await reportAbsence(studentId, values.status, values.reason);
      toast({ title: "Sukses", description: "Laporan Anda telah terkirim." });
      onSubmitted();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengirim laporan.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lapor Izin / Sakit</DialogTitle>
          <DialogDescription>
            Isi formulir ini untuk memberitahu guru jika Anda tidak dapat hadir hari ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Pilih Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="sick" />
                        </FormControl>
                        <FormLabel className="font-normal">Sakit</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="permit" />
                        </FormControl>
                        <FormLabel className="font-normal">Izin</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tuliskan alasan singkat kenapa Anda tidak bisa hadir..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
