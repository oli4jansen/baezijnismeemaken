import { Button, FormControl, FormLabel, Heading, HStack, IconButton, Input, Textarea } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import ArrowBack from "@suid/icons-material/ArrowBack";
import { Component, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { createTicketType } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";

const CreateTicketType: Component = () => {

  // TODO: this page should be disabled if the system is live

  const navigate = useNavigate();

  const [form, setForm] = createStore<{ name: string; description: string; price: number; amount_available: number }>({
    name: '',
    description: '',
    price: 100,
    amount_available: 100
  });

  const [saving, setSaving] = createSignal(false);

  const save = async (values: { name: string; description: string; price: number; amount_available: number }) => {
    setSaving(true);
    const response = await createTicketType({ ...form });
    console.log(response);
    navigate('/admin/settings');
  };

  onMount(async () => {
    ensureLoggedIn(() => navigate('/admin'));
  });

  return (
    <>
      <AdminMenu active="settings"></AdminMenu>

      <div style="max-width: 800px; margin: 0 auto">
        <HStack spacing={12}>
          <IconButton colorScheme="info" variant="ghost" aria-label="Terug naar overzicht" icon={<ArrowBack />} onClick={() => navigate('/admin/settings')} />
          <Heading size="2xl" class="admin-title">Kaart toevoegen</Heading>
        </HStack>

        <form onSubmit={e => { e.preventDefault(); save(form) }}>
          <FormControl required>
            <FormLabel for="user">Naam</FormLabel>
            <Input id="user" type="text" value={form.name} onInput={e => setForm({ name: e.currentTarget.value })} />
          </FormControl>

          <FormControl required>
            <FormLabel for="description">Beschrijving</FormLabel>
            <Textarea id="description" value={form.description} onInput={e => setForm({ description: e.currentTarget.value })} placeholder="Beschrijving van het kaartje.." />
          </FormControl>

          <FormControl required>
            <FormLabel for="price">Prijs (in centen)</FormLabel>
            <Input id="price" type="number" min="1" value={form.price} onInput={e => setForm({ price: parseInt(e.currentTarget.value, 10) })} />
          </FormControl>

          <FormControl required>
            <FormLabel for="amount_available">Aantal beschikbaar</FormLabel>
            <Input id="amount_available" type="number" min="1" value={form.amount_available} onInput={e => setForm({ amount_available: parseInt(e.currentTarget.value, 10) })} />
          </FormControl>

          <br />

          <HStack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
            <Button type="submit" disabled={form.name === '' || form.description === '' || form.amount_available <= 0 || form.price <= 0} loading={saving()} loadingText="Aan het toevoegen...">
              TOEVOEGEN
            </Button>
          </HStack>
        </form>
      </div>

    </>
  );

};

export default CreateTicketType;