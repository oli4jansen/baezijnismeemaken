import { Button, Heading, HStack, Table, Tbody, Td, Th, Thead, Tr } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import Add from "@suid/icons-material/Add";
import { Component, createResource, For, onMount } from "solid-js";
import { fetchTicketTypes } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";

const Settings: Component = () => {
  const navigate = useNavigate();

  const [ticketTypes] = createResource(fetchTicketTypes);
  
  onMount(() => {
    ensureLoggedIn(() => navigate('/admin'));
  });

  return (
    <>
      <AdminMenu active="settings"></AdminMenu>

      <HStack direction="row" justifyContent="space-between" alignItems="right" spacing={2}>
        <Heading size="2xl" class="admin-title"></Heading>
        
        <Button onClick={() => navigate('/admin/settings/new')} size="sm">
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