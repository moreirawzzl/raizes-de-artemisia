"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { maskMoneyInput, parseMaskedMoney } from "@/lib/format";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

interface InitialData {
  id?: string;
  name?: string;
  description?: string;
  benefits?: string;
  usage?: string;
  care?: string;
  weight?: string;
  price?: string;
  stock?: number;
  featured?: boolean;
  images?: string[];
}

export function ProductForm({ initial }: { initial?: InitialData }) {
  const router = useRouter();
  const isEditing = !!initial?.id;

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [benefits, setBenefits] = useState(initial?.benefits ?? "");
  const [usage, setUsage] = useState(initial?.usage ?? "");
  const [care, setCare] = useState(initial?.care ?? "");
  const [weight, setWeight] = useState(initial?.weight ?? "");
  const [priceDisplay, setPriceDisplay] = useState(
    initial?.price ? Number(initial.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""
  );
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [notifyCustomers, setNotifyCustomers] = useState(false);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (data.urls) setImages((prev) => [...prev, ...data.urls]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      description,
      benefits,
      usage,
      care,
      weight,
      price: parseMaskedMoney(priceDisplay),
      stock: Number(stock),
      featured,
      notifyCustomers,
      images
    };

    const res = await fetch(isEditing ? `/api/products/${initial!.id}` : "/api/products", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/produtos");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl2 border border-bege-claro bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Nome do produto</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <Label>Fotos do produto</Label>
          <label className="block cursor-pointer rounded-xl border border-dashed border-bege-escuro bg-fundo p-4 text-center text-xs text-verde-secundario">
            {uploading ? "Enviando..." : "📷 Clique para enviar fotos (pode escolher várias)"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </label>
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={url} className="relative h-14 w-14">
                  <Image src={url} alt="" fill className="rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8a4a3a] text-[10px] text-white"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label>Descrição</Label>
          <textarea
            required value={description} onChange={(e) => setDescription(e.target.value)}
            className="min-h-[90px] w-full rounded-xl border border-bege-claro bg-fundo p-3 text-sm text-verde-principal outline-none focus:border-verde-secundario"
          />
        </div>

        <div>
          <Label>Benefícios</Label>
          <Input value={benefits} onChange={(e) => setBenefits(e.target.value)} />
        </div>
        <div>
          <Label>Modo de uso</Label>
          <Input value={usage} onChange={(e) => setUsage(e.target.value)} />
        </div>
        <div>
          <Label>Cuidados</Label>
          <Input value={care} onChange={(e) => setCare(e.target.value)} />
        </div>
        <div>
          <Label>Peso</Label>
          <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="ex: 250g" />
        </div>

        <div>
          <Label>Preço</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-verde-secundario">R$</span>
            <Input
              inputMode="numeric"
              className="pl-9"
              placeholder="0,00"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(maskMoneyInput(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label>Estoque</Label>
          <Input type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} />
        </div>

        <div className="flex flex-col gap-3 sm:col-span-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <label htmlFor="featured" className="text-xs text-verde-secundario">Destacar na página inicial</label>
          </div>
          
          {!isEditing && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notifyCustomers" checked={notifyCustomers} onChange={(e) => setNotifyCustomers(e.target.checked)} />
              <label htmlFor="notifyCustomers" className="text-xs text-verde-secundario">Notificar usuários sobre o novo produto</label>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={saving} className="mt-6">
        {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Adicionar produto"}
      </Button>
    </form>
  );
}
