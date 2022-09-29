import { Table, Tbody, Td, Th, Thead, Tr } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import { format } from 'date-fns';
import { Component, createResource, For, onMount } from "solid-js";
import { fetchReservations } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";

const Reservations: Component = () => {
  const navigate = useNavigate();

  const [reservations, { refetch }] = createResource(fetchReservations);

  onMount(() => {
    ensureLoggedIn(() => navigate('/admin'));
  });

  return (
    <>
      <AdminMenu active="reservations"></AdminMenu>

      <Table highlightOnHover>
        <Thead>
          <Tr>
            <Th>Gereserveerd op</Th>
            <Th>E-mailadres</Th>
            <Th>Voornaam</Th>
            <Th>Achternaam</Th>
            <Th>Aantal kaartjes</Th>
            <Th>Totaal</Th>
            <Th>Betaald?</Th>
          </Tr>
        </Thead>
        <Tbody>
          <For each={reservations()}>{(r: any, i) =>
            <Tr onClick={() => navigate(`/admin/reservations/${r.id}`)} style="cursor: pointer">
              <Td>{format(new Date(r.created_at), 'yyyy-MM-dd HH:mm:ss')}</Td>
              <Td>{r.email}</Td>
              <Td>{r.first_name}</Td>
              <Td>{r.last_name}</Td>
              <Td>{r.amount}</Td>
              <Td>&euro;{(r.price / 100).toFixed(2)}</Td>
              <Td>{r.paid ? 'Ja' : 'Nee'}</Td>
            </Tr>
          }</For>

        </Tbody>
      </Table>
    </>
  );

};

export default Reservations;