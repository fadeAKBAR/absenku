
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Building, Map, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AppSettings } from '@/lib/types';
import { saveSettings } from '@/lib/data';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const settingsSchema = z.object({
  schoolName: z.string().min(3, "Nama sekolah minimal 3 karakter."),
  schoolLogoUrl: z.string().url("URL logo tidak valid.").or(z.literal("")),
  location: z.object({
      latitude: z.coerce.number().min(-90, "Latitude tidak valid.").max(90, "Latitude tidak valid."),
      longitude: z.coerce.number().min(-180, "Longitude tidak valid.").max(180, "Longitude tidak valid."),
  }),
  checkInRadius: z.coerce.number().min(10, "Radius minimal 10 meter.").max(1000, "Radius maksimal 1000 meter."),
  lateTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu harus HH:MM"),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu harus HH:MM"),
});


type SettingsManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  settings: AppSettings;
  onUpdate: () => void;
};

export function SettingsManager({ isOpen, onOpenChange, settings, onUpdate }: SettingsManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings
  });

  useEffect(() => {
    if (settings) {
        form.reset(settings);
    }
  }, [settings, form, isOpen])

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setIsSubmitting(true);
    try {
        await saveSettings(values);
        toast({ title: "Sukses", description: "Pengaturan telah berhasil disimpan." });
        onUpdate();
        onOpenChange(false);
    } catch (error) {
        toast({ title: "Error", description: "Gagal menyimpan pengaturan.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Pengaturan Aplikasi</DialogTitle>
          <DialogDescription>Kelola pengaturan umum, presensi, dan data penting lainnya untuk aplikasi ini.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs defaultValue="general" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">Umum</TabsTrigger>
                        <TabsTrigger value="location">Lokasi</TabsTrigger>
                        <TabsTrigger value="attendance">Presensi</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4 pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg"><Building className="h-5 w-5"/>Info Sekolah</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="schoolName"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Nama Sekolah</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="schoolLogoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>URL Logo Sekolah</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/logo.png" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="location" className="space-y-4 pt-4">
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg"><Map className="h-5 w-5"/>Lokasi & Radius</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="location.latitude"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Latitude</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="any" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="location.longitude"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Longitude</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="any" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                 <FormField
                                    control={form.control}
                                    name="checkInRadius"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Radius Check-in (meter)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attendance" className="space-y-4 pt-4">
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg"><Clock className="h-5 w-5"/>Waktu Presensi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <FormField
                                    control={form.control}
                                    name="lateTime"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Batas Waktu Terlambat (HH:MM)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="07:00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="checkOutTime"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Waktu Check-out Paling Awal (HH:MM)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="15:30" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <DialogFooter className="pt-6">
                    <Button type="submit" disabled={isSubmitting}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </Button>
                </DialogFooter>
             </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
