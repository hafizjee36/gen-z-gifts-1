import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Package, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Bundle {
  id: string;
  name: string;
  image_url: string;
  min_items: number;
  is_active: boolean;
  display_order: number;
}

const AdminBundles = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', image_url: '', min_items: 3, is_active: true, display_order: 0 });

  const load = async () => {
    setLoading(true);
    const res = await api.getAdminBundles();
    if (!res.error && res.data) setBundles(res.data as Bundle[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', image_url: '', min_items: 3, is_active: true, display_order: bundles.length });
    setDialogOpen(true);
  };

  const openEdit = (b: Bundle) => {
    setEditing(b);
    setForm({ name: b.name, image_url: b.image_url, min_items: b.min_items, is_active: b.is_active, display_order: b.display_order });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await api.uploadBundleImage(file);
    if (res.url) {
      setForm(f => ({ ...f, image_url: res.url! }));
    } else {
      toast({ title: 'Upload failed', description: res.error, variant: 'destructive' });
    }
    setUploading(false);
  };


  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    if (!form.image_url) {
      toast({ title: 'Image required', variant: 'destructive' });
      return;
    }
    if (form.min_items < 1) {
      toast({ title: 'Minimum items must be at least 1', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const res = editing
      ? await api.updateBundle(editing.id, form)
      : await api.createBundle(form);
    setSaving(false);

    if (res.error) {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    } else {
      toast({ title: editing ? 'Bundle updated' : 'Bundle created' });
      setDialogOpen(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bundle?')) return;
    const res = await api.deleteBundle(id);
    if (!res.error) {
      toast({ title: 'Bundle deleted' });
      load();
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  const moveOrder = async (index: number, dir: -1 | 1) => {
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= bundles.length) return;
    const a = bundles[index];
    const b = bundles[swapIdx];
    await api.updateBundle(a.id, { display_order: b.display_order });
    await api.updateBundle(b.id, { display_order: a.display_order });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bundles</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Bundle</Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No bundles yet. Add your first gift bundle.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Order</TableHead>
                <TableHead className="w-24">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-28">Min. Items</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundles.map((b, idx) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveOrder(idx, -1)} disabled={idx === 0}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveOrder(idx, 1)} disabled={idx === bundles.length - 1}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.name} className="h-12 w-20 object-cover rounded" />
                    ) : (
                      <div className="h-12 w-20 bg-muted rounded flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{b.min_items}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {b.is_active ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(b.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Bundle' : 'Add Bundle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Bundle Image *</Label>
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="h-32 w-full object-cover rounded-lg mt-1 mb-2" />
              )}
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
            </div>
            <div>
              <Label>Bundle Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Birthday Surprise Bundle" />
            </div>
            <div>
              <Label>Minimum Number of Items *</Label>
              <Input
                type="number"
                min={1}
                value={form.min_items}
                onChange={e => setForm(f => ({ ...f, min_items: Math.max(1, parseInt(e.target.value) || 1) }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={uploading || saving}>
              {saving ? 'Saving...' : editing ? 'Update Bundle' : 'Create Bundle'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBundles;
