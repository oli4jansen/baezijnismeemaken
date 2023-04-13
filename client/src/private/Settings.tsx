import { Button, Heading, HStack, Table, Tbody, Td, Th, Thead, Tr, Switch, Alert, Input } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import Add from "@suid/icons-material/Add";
import { Component, createEffect, createResource, createSignal, For, onMount } from "solid-js";
import { changeShopOpened, fetchShopOpened, fetchTicketTypes } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";

const Settings: Component = () => {
  const navigate = useNavigate();

  const [ticketTypes] = createResource(fetchTicketTypes);
  const [shopOpened, { mutate }] = createResource(fetchShopOpened);
  
  const shopOpenedSwitchChange = () => {
    const open = !shopOpened()?.open;
    const opensAtTimestamp = 0;
    mutate({ open, opensAtTimestamp });
    changeShopOpened({ open, opensAtTimestamp });
  };

  const shopOpensAtTimestampChange = () => {
    try {
      const date = new Date((document.getElementById('opensAtTimestamp') as HTMLInputElement).value);
      console.log(+date);
      const open = false;
      const opensAtTimestamp = +date;
      mutate({ open, opensAtTimestamp });
      changeShopOpened({ open, opensAtTimestamp });
    } catch (error) {
      alert('Datum heeft verkeerd formaat, probeer jaar-maand-datum uur:minuut (bijv. 2023-06-01 12:00).');
    }
  };

  const [readableDateFromTimestamp, setReadableDate] = createSignal<string>('');

  createEffect(() => {
    if (!shopOpened() || !shopOpened()?.opensAtTimestamp) {
      setReadableDate('');
    } else {
      const d = new Date(shopOpened()?.opensAtTimestamp || 0);
      setReadableDate(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    }
  });

  onMount(() => {
    ensureLoggedIn(() => navigate('/admin'));
  });

  return (
    <>
      <AdminMenu active="settings"></AdminMenu>

      <div style="padding: 6px 12px">
        <Switch defaultChecked checked={shopOpened()?.open} disabled={!!shopOpened()?.opensAtTimestamp} onChange={shopOpenedSwitchChange} labelPlacement="end">
          <div style="margin-bottom: -6px">Kaartverkoop open</div>
          <small style="font-size: 12px; opacity: 0.75">Kaart types kunnen{shopOpened()?.open ? ' niet' : ''} toegevoegd of bewerkt worden.</small>
        </Switch>
      </div>

      <div style="padding: 6px 12px; max-width: 400px">
        <div>
          <label for="opensAtTimestamp" style="font-size: 14px; margin-bottom: 6px; display: block">Tijdstip waarop kaartverkoop opent</label>
          <HStack direction="row" justifyContent="space-between" spacing={2}>
            <Input id="opensAtTimestamp" type="text" value={readableDateFromTimestamp()} disabled={shopOpened()?.open} placeholder="jaar-maand-dag uur:minuut" />
            <Button onClick={shopOpensAtTimestampChange}>
              Stel in
            </Button>
          </HStack>
        </div>
      </div>

      <br />

      <HStack direction="row" justifyContent="space-between" alignItems="right" spacing={2}>
        <Heading size="2xl" class="admin-title"></Heading>
        
        <Button onClick={() => navigate('/admin/settings/new')} disabled={shopOpened()?.open} size="sm">
          <Add />
          Voeg kaart type toe
        </Button>
      </HStack>

      <Table highlightOnHover>
        <Thead>
          <Tr>
            <Th>Naam</Th>
            <Th>Beschrijving</Th>
            <Th>Beschikbaar</Th>
            <Th>Prijs</Th>
          </Tr>
        </Thead>
        <Tbody>
          <For each={ticketTypes()}>{(tt: any, i) =>
            <Tr onClick={() => navigate(`/admin/settings/${tt.id}`)} style="cursor: pointer">
              <Td>{tt.name}</Td>
              <Td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{tt.description}</Td>
              <Td>{tt.amount_available}</Td>
              <Td>&euro;{(tt.price / 100).toFixed(2)}</Td>
            </Tr>
          }</For>

        </Tbody>
      </Table>
    </>
  );

};

export default Settings;