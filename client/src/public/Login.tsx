import { Component, createSignal, onMount } from 'solid-js';
import { Button, FormControl, FormLabel, HStack, Input } from '@hope-ui/solid';
import { useNavigate } from '@solidjs/router';
import { createStore } from 'solid-js/store';

import { getToken } from '../utils/api';
import { ensureLoggedOut } from '../utils/auth';
import Header from './Header';

/**
 * Logs admins in to the admin dashboard
 */
const Login: Component = () => {
  const navigate = useNavigate();

  const [form, setForm] = createStore<{ user: string; pass: string; }>({
    user: 'bae',
    pass: ''
  });

  const [loggingIn, setLoggingIn] = createSignal(false);

  const login = async (values: { user: string; pass: string }) => {
    setLoggingIn(true);
    const response = await getToken(values.user, values.pass);
    if (!response.token) {
      alert('Geen token ontvangen. Bel Olivier!');
    }
    localStorage.setItem('token', response.token);
    navigate('/admin/dashboard');
  };

  onMount(() => {
    ensureLoggedOut(() => navigate('/admin/dashboard'));
  });

  return (
    <div style="max-width: 600px; margin: 0 auto">
      <Header />

      <br /><br />

      <form onSubmit={e => { e.preventDefault(); login(form) }}>
        <FormControl required>
          <FormLabel for="user">Gebruikersnaam</FormLabel>
          <Input id="user" type="text" value={form.user} onInput={e => setForm({ user: e.currentTarget.value })} />
        </FormControl>

        <FormControl required>
          <FormLabel for="pass">Wachtwoord</FormLabel>
          <Input id="pass" type="password" value={form.pass} onInput={e => setForm({ pass: e.currentTarget.value })} />
        </FormControl>

        <br />

        <HStack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          <Button type="submit" disabled={form.user === '' || form.pass === ''} loading={loggingIn()} loadingText="Aan het inloggen...">
            INLOGGEN
          </Button>
        </HStack>
      </form>
    </div>
  );
};

export default Login;
