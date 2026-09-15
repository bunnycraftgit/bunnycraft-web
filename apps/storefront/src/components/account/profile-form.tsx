"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarUploader } from "@/components/account/avatar-uploader";

export function ProfileForm({
  initialName,
  email,
  initialImage,
  memberSince,
}: {
  initialName: string;
  email: string;
  initialImage: string | null;
  memberSince: string;
}) {
  const { update } = useSession();
  const [name, setName] = React.useState(initialName);
  const [image, setImage] = React.useState<string | null>(initialImage);
  const [saving, setSaving] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
      if (!res.ok) throw new Error();
      await update({ name, image });
      toast.success("Profile updated.");
    } catch {
      toast.error("Couldn't update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <AvatarUploader image={image} name={name || email} onChange={setImage} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <p className="text-xs text-muted-foreground">Member since {memberSince}</p>
      <Button type="submit" disabled={saving} className="w-fit">
        {saving && <LoaderCircleIcon className="animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
