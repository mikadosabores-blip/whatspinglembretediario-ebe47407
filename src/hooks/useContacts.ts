import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserContact {
  id: string;
  user_id: string;
  name: string;
  whatsapp_number: string;
  label: string;
  created_at: string;
}

export const CONTACT_LABELS = [
  { value: "namorado", label: "Namorado(a)", emoji: "❤️" },
  { value: "familia", label: "Família", emoji: "👨‍👩‍👧‍👦" },
  { value: "amigo", label: "Amigo(a)", emoji: "🤝" },
  { value: "outro", label: "Outro", emoji: "📌" },
];

const MAX_CONTACTS = 3;

export function useContacts() {
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    const { data, error } = await supabase
      .from("user_contacts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching contacts:", error);
      return;
    }
    setContacts((data as UserContact[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: { name: string; whatsapp_number: string; label: string }) => {
    if (contacts.length >= MAX_CONTACTS) {
      toast.error(`Máximo de ${MAX_CONTACTS} contatos permitido`);
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await supabase.from("user_contacts").insert({
      user_id: session.user.id,
      name: contact.name.trim(),
      whatsapp_number: contact.whatsapp_number.replace(/\D/g, ""),
      label: contact.label,
    });

    if (error) {
      toast.error("Erro ao adicionar contato");
      return false;
    }

    toast.success("Contato adicionado!");
    await fetchContacts();
    return true;
  };

  const updateContact = async (id: string, updates: Partial<UserContact>) => {
    const { error } = await supabase.from("user_contacts").update(updates).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar contato");
      return;
    }
    await fetchContacts();
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from("user_contacts").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover contato");
      return;
    }
    toast.success("Contato removido");
    await fetchContacts();
  };

  return { contacts, loading, addContact, updateContact, deleteContact, canAddMore: contacts.length < MAX_CONTACTS };
}
