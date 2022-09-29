import { Alert, Badge, Box, Heading, HStack, IconButton, Table, Tbody, Td, Th, Thead, Tr } from "@hope-ui/solid";
import { useNavigate, useParams } from "@solidjs/router";
import ArrowBack from "@suid/icons-material/ArrowBack";
import Cancel from "@suid/icons-material/Cancel";
import CheckCircle from "@suid/icons-material/CheckCircle";
import { format } from "date-fns";
import { Component, createMemo, createResource, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { fetchCompletion, fetchPayment, fetchPaymentWithAuth, fetchReservation, fetchTicketTypes } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";
import ReservationsLog from "./ReservationsLog";

const ReservationDetails: Component = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [reservation] = createResource(() => fetchReservation(params.id));
  const [completion] = createResource(() => fetchCompletion(params.id));
  const [payment] = createResource(() => fetchPaymentWithAuth(params.id));

  onMount(() => {
    ensureLoggedIn(() => navigate('/admin'));
  });

  return (
    <>
      <AdminMenu></AdminMenu>

      <div style="max-width: 800px; margin: 0 auto">

        <Heading size="2xl" class="admin-title">Bekijk boeking</Heading>

        <br />
        {/* <pre>{JSON.stringify(reservation(), null, 2)}</pre> */}

        <Show when={!reservation.loading}>
          <Table highlightOnHover>
            <Thead>
              <Tr>
                <Th>Kaart type</Th>
                <Th>Prijs</Th>
                <Th numeric>Gescand?</Th>
              </Tr>
            </Thead>
            <Tbody>

              <For each={reservation().tickets}>{(t: any, i) =>
                <Tr onClick={() => navigate(`/admin/tickets/${t.id}`)}>
                  <Td>{t.ticket_name}</Td>
                  <Td>&euro;{(t.price / 100).toFixed(2)}</Td>
                  <Td numeric>
                    <Show when={t.scanned} fallback={<Cancel style="color: var(--hope-colors-danger9)" />}>
                      <CheckCircle style="color: var(--hope-colors-success9)" />
                    </Show>
                  </Td>
                </Tr>
              }</For>

            </Tbody>
          </Table>
        </Show>

        <br />
        <Heading size="lg">Persoonlijke gegevens (boeker)</Heading>
        <br />

        <Show when={!completion.loading && !completion.error} fallback={
          <Alert status="danger" style="font-size: 14px">
            <p>Deze boeking heeft nog geen persoonlijke gegevens.</p>
          </Alert>
        }>
          <Table>
            <Tbody>
              <Tr>
                <Td>Voornaam</Td>
                <Td>{completion().first_name}</Td>
              </Tr>
              <Tr>
                <Td>Achternaam</Td>
                <Td>{completion().last_name}</Td>
              </Tr>
              <Tr>
                <Td>E-mailadres</Td>
                <Td>{completion().last_name}</Td>
              </Tr>
              <Tr>
                <Td>Ingevuld op</Td>
                <Td>{format(new Date(completion().created_at), 'yyyy-MM-dd HH:mm:ss')}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Show>

        <br />
        <Heading size="lg">Betaling</Heading>
        <br />

        <Show when={!payment.loading && !payment.error} fallback={
          <Alert status="danger" style="font-size: 14px">
            <p>Deze boeking is nog niet betaald. Indien niet op tijd wordt betaald, wordt de boeking verwijderd.</p>
          </Alert>
        }>
          <Table>
            <Tbody>
              <Tr>
                <Td>Mollie ID</Td>
                <Td>{payment().mollie_id}</Td>
              </Tr>
              <Tr>
                <Td>Betaald op</Td>
                <Td>{format(new Date(payment().created_at), 'yyyy-MM-dd HH:mm:ss')}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Show>

        {/* <ReservationsLog></ReservationsLog> */}

        <br /><br /><br />
      </div>
    </>
  );

};

export default ReservationDetails;