import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { DropDownList, DropDownListOption } from "@/components/ui/dropdown-list";
import { APP_PATHS } from "@/constants/app-paths";
import { useToast } from "@/hooks/use-toast";
import { BANGLADESH_DISTRICTS, upazilasForDistrictName } from "@/lib/bangladesh-locations";
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
  type AddressInput,
  type UserAddress,
} from "@/services/user/use-address";
import { Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const LOCATION_OPTIONS = ["Home", "Office", "Pick Up"] as const;

const EMPTY_FORM: AddressInput = {
  label: "",
  name: "",
  phone: "",
  address: "",
  district: "",
  upazila: "",
};

const DashboardAddressesPage = () => {
  const { showError, showSuccess } = useToast();
  const { data: addresses = [], isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);

  const districtOptions: DropDownListOption[] = useMemo(
    () => BANGLADESH_DISTRICTS.map((d) => ({ value: d.name, label: d.name })),
    [],
  );
  const upazilas = useMemo(
    () => (form.district ? upazilasForDistrictName(form.district) : []),
    [form.district],
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (addr: UserAddress) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label ?? "",
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      district: addr.district,
      upazila: addr.upazila,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address || !form.district || !form.upazila) {
      showError("Missing fields", "Name, phone, address, district, and upazila are required.");
      return;
    }

    const payload: AddressInput = {
      ...form,
      label: form.label?.trim() || undefined,
      // First address automatically becomes the default
      isDefault: editingId ? undefined : addresses.length === 0,
    };

    try {
      if (editingId) {
        await updateAddress.mutateAsync({ id: editingId, updates: payload });
        showSuccess("Address updated", "Your delivery address has been updated.");
      } else {
        await createAddress.mutateAsync(payload);
        showSuccess("Address added", "You can now use it at checkout.");
      }
      setDialogOpen(false);
    } catch (err) {
      showError("Could not save address", err instanceof Error ? err.message : "Please try again.");
    }
  };

  const handleDelete = async (addr: UserAddress) => {
    if (!window.confirm(`Delete the "${addr.label || addr.address}" address?`)) return;
    try {
      await deleteAddress.mutateAsync(addr.id);
      showSuccess("Address deleted", "The address has been removed.");
    } catch (err) {
      showError("Could not delete address", err instanceof Error ? err.message : "Please try again.");
    }
  };

  const handleSetDefault = async (addr: UserAddress) => {
    try {
      await updateAddress.mutateAsync({ id: addr.id, updates: { isDefault: true } });
      showSuccess("Default updated", `"${addr.label || addr.address}" is now your default address.`);
    } catch (err) {
      showError("Could not update default", err instanceof Error ? err.message : "Please try again.");
    }
  };

  const saving = createAddress.isPending || updateAddress.isPending;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={APP_PATHS.dashboard}>Account</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Saved addresses</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saved addresses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage delivery addresses used at checkout — add a new one or edit an existing entry.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Addresses</CardTitle>
              <CardDescription>
                {addresses.length} saved address{addresses.length === 1 ? "" : "es"}
              </CardDescription>
            </div>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1" /> Add address
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No saved addresses yet.</p>
                <p className="text-sm">Add one and it will be ready at checkout.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-lg border p-4 ${
                      addr.is_default ? "border-gray-900" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-sm">{addr.label || "Address"}</span>
                        {addr.is_default && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            DEFAULT
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label="Edit address"
                          onClick={() => openEdit(addr)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          aria-label="Delete address"
                          onClick={() => handleDelete(addr)}
                          disabled={deleteAddress.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {addr.name} · {addr.phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      {addr.address}, {addr.upazila}, {addr.district}
                    </p>
                    {!addr.is_default && (
                      <button
                        type="button"
                        className="mt-2 text-xs font-semibold underline"
                        onClick={() => handleSetDefault(addr)}
                        disabled={updateAddress.isPending}
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit address" : "Add address"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Select
                value={form.label || ""}
                onValueChange={(value) => {
                  if (!value) return;
                  setForm((p) => ({ ...p, label: value }));
                }}
              >
                <SelectTrigger>
                  <span className={form.label ? "" : "text-muted-foreground"}>
                    {form.label || "Select Location"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr-name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="addr-name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="addr-phone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="addr-address"
                placeholder="House, road, area"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  District <span className="text-red-500">*</span>
                </Label>
                <DropDownList
                  options={districtOptions}
                  value={form.district}
                  onChange={(value) => setForm((p) => ({ ...p, district: value, upazila: "" }))}
                  placeholder="Select District"
                  emptyMessage="No districts found"
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Upazila <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.upazila}
                  onValueChange={(value) => {
                    // Radix fires onValueChange("") on mount when the controlled
                    // value has no mounted item yet (edit mode) — ignore it.
                    if (!value) return;
                    setForm((p) => ({ ...p, upazila: value }));
                  }}
                  disabled={!form.district}
                >
                  <SelectTrigger>
                    {/* Plain span instead of SelectValue: Radix shows the placeholder
                        for values set programmatically (edit mode) before the
                        dropdown ever opened. */}
                    <span className={form.upazila ? "" : "text-muted-foreground"}>
                      {form.upazila || "Select Upazila"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {upazilas.map((u: string) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingId ? "Save changes" : "Add address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardAddressesPage;
