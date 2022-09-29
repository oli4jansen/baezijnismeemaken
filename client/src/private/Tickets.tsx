import { Table, Tbody, Td, Th, Thead, Tr } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import Cancel from "@suid/icons-material/Cancel";
import Verified from "@suid/icons-material/Verified";
import { format } from 'date-fns';
import { Component, createResource, For, onMount, Show } from "solid-js";
import { fetchTickets } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";

const Tickets: Component = () => {
  const navigate = useNavigate();

  const [tickets] = createResource(fetchTickets);

  onMount(() => {
    ensureLoggedIn(() => navigate('/admin'));
  });

  return (
    <>
      <AdminMenu active="tickets"></AdminMenu>

      <Table highlightOnHover>
        <Thead>
          <Tr>
            <Th>Gereserveerd op</Th>
            <Th>Naam</Th>
            <Th>E-mailadres</Th>
            <Th>Kaartje voor</Th>
            <Th numeric>Betaald?</Th>
            <Th numeric>Gescand?</Th>
          </Tr>
        </Thead>
        <Tbody>
          <For each={tickets()}>{(t: any, i) =>
            <Tr onClick={() => navigate(`/admin/tickets/${t.id}`)} style="cursor: pointer">
              <Td>{format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss')}</Td>
              <Td>{t.owner_first_name} {t.owner_last_name}</Td>
              <Td>{t.owner_email}</Td>
              <Td>{t.ticket_name}</Td>
              <Td numeric>
                <Show when={t.paid} fallback={<Cancel style="color: red"></Cancel>}>
                  <Verified style="color: green"></Verified>
                </Show>
              </Td>
              <Td numeric>
                <Show when={t.scanned} fallback={<Cancel style="color: red"></Cancel>}>
                  <Verified style="color: green"></Verified>
                </Show>
              </Td>
            </Tr>
          }</For>

        </Tbody>
      </Table>
    </>
  );

};

export default Tickets;