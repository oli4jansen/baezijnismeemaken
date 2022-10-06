import { Alert, Badge, Box, Button, Heading, HStack, IconButton, Input, Table, Tbody, Td, Th, Thead, Tooltip, Tr } from "@hope-ui/solid";
import { useNavigate, useParams } from "@solidjs/router";
import QrCode from "@suid/icons-material/QrCode";
import ArrowBack from "@suid/icons-material/ArrowBack";
import Cancel from "@suid/icons-material/Cancel";
import CheckCircle from "@suid/icons-material/CheckCircle";
import { format } from "date-fns";
import { Component, createEffect, createMemo, createResource, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { fetchCompletion, fetchPayment, fetchPaymentWithAuth, fetchReservation, fetchTicket, fetchTickets, fetchTicketTypes, personalizeTicketAsAdmin } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";
import ReservationsLog from "./ReservationsLog";
import { createStore } from "solid-js/store";
import ListAlt from "@suid/icons-material/ListAlt";
import Verified from "@suid/icons-material/Verified";

const TicketDetails: Component = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [ticket] = createResource(() => fetchTicket(params.id));

  // const [reservation, setReservation] = createSignal<any>(undefined);
  const [payment, setPayment] = createSignal<any>(undefined);

  const [form, setForm] = createStore<{ owner_email: string; owner_first_name: string; owner_last_name: string }>({
    owner_email: '',
    owner_first_name: '',
    owner_last_name: ''
  });

  const [saving, setSaving] = createSignal(false);

  onMount(() => {
    ensureLoggedIn(() => navigate('/admin'));
  });

  createEffect(async () => {
    const reservationId = ticket()?.reservation;

    if (reservationId !== undefined) {
      // setReservation(await fetchReservation(reservationId));
      setPayment(await fetchPaymentWithAuth(reservationId));
    }
  });

  createEffect(() => {
    if (ticket() !== undefined) {
      setForm({
        owner_email: ticket().owner_email,
        owner_first_name: ticket().owner_first_name,
        owner_last_name: ticket().owner_last_name,
      });
    }
  });

  const save = async () => {
    setSaving(true);
    const response = await personalizeTicketAsAdmin(params.id, form.owner_email, form.owner_first_name, form.owner_last_name);
    console.log(response);
    setSaving(false);
  };

  return (
    <>
      <AdminMenu></AdminMenu>

      <div style="max-width: 800px; margin: 0 auto">

        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="2xl" class="admin-title">Bekijk kaartje</Heading>
          <HStack alignItems="center" spacing="12px">
            <Show when={!ticket.loading}>
              {/* <Tooltip label={ticket().scanned ? 'Gescand' : 'Nog niet gescand'}>
                <Show when={ticket().scanned} fallback={<Cancel style="color: red"></Cancel>}>
                  <Verified style="color: green"></Verified>
                </Show>
              </Tooltip> */}
              <Button colorScheme="neutral" variant="ghost" size="sm" onClick={() => navigate(`/admin/reservations/${ticket().reservation}`)}>
                <ListAlt></ListAlt>
                &nbsp;
                <span>Bekijk boeking</span>
              </Button>
            </Show>
          </HStack>
        </HStack>

        {/* <Alert status="info" style="font-size: 14px">
          <p>Het kaartje wordt aangemaakt zodra iemand op "Reserveer" drukt. Indien er niet op tijd betaald wordt, verloopt de reservering en wordt het kaartje automatisch weer vrijgegeven. Deze gegevens kunnen dus aan verandering onderhevig zijn.</p>
        </Alert> */}

        <br />
        <Heading size="lg">Persoonlijke gegevens</Heading>
        <br />

        <Alert status="info" style="font-size: 14px">
          <HStack direction="row" justifyContent="space-between" alignItems="center" spacing={2} style="width: 100%">
            <QrCode></QrCode>
            <div style="margin-left: 12px">
              Als je persoonlijke details aanpast, wordt automatisch een nieuwe QR-code gemaakt en verstuurd. De oude QR-code is vanaf dat moment ongeldig.
            </div>

            {/* <Button colorScheme="info" variant="subtle" size="sm">
              Bekijk boeking
            </Button> */}
          </HStack>
        </Alert>

        <Show when={!ticket.loading}>
          <form onSubmit={e => { e.preventDefault(); save() }}>
            <Table>
              <Tbody>
                <Tr>
                  <Td>Voornaam</Td>
                  <Td>
                    <Input id="owner_first_name" type="text" value={form.owner_first_name} onInput={e => setForm({ owner_first_name: e.currentTarget.value })} />
                  </Td>
                </Tr>

                <Tr>
                  <Td>Achternaam</Td>
                  <Td>
                    <Input id="owner_last_name" type="text" value={form.owner_last_name} onInput={e => setForm({ owner_last_name: e.currentTarget.value })} />
                  </Td>
                </Tr>

                <Tr>
                  <Td>E-mailadres</Td>
                  <Td>
                    <Input id="owner_email" type="email" value={form.owner_email} onInput={e => setForm({ owner_email: e.currentTarget.value })} />
                  </Td>
                </Tr>

              </Tbody>
            </Table>

            <br />

            <HStack justifyContent="end">
              <Button type="submit" colorScheme="info" loading={saving()} loadingText="Aan het opslaan...">
                <span>Opslaan</span>
              </Button>
            </HStack>

            <br />
            <Heading size="lg">Kaart gegevens</Heading>
            <br />

            <Table>
              <Tbody>
                <Tr>
                  <Td>Kaartje voor</Td>
                  <Td>{ticket().ticket_name}</Td>
                </Tr>
                {/* <Tr>
                  <Td>Gereserveerd op</Td>
                  <Td>{format(new Date(ticket().created_at), 'yyyy-MM-dd HH:mm:ss')}</Td>
                </Tr> */}

                <Tr>
                  <Td>Prijs</Td>
                  <Td>&euro;{(ticket().ticket_price / 100).toFixed(2)}</Td>
                </Tr>

                <Show when={payment() !== undefined && !payment().error} fallback={
                  <Tr>
                    <Td>Betaald op</Td>
                    <Td>(nog niet betaald)</Td>
                  </Tr>
                }>
                  <Tr>
                    <Td>Betaald op</Td>
                    <Td>{format(new Date(payment().created_at), 'yyyy-MM-dd HH:mm:ss')}</Td>
                  </Tr>
                  <Tr>
                    <Td>Mollie ID</Td>
                    <Td>{payment().mollie_id}</Td>
                  </Tr>
                </Show>


              </Tbody>
            </Table>


          </form>
        </Show>

        {/* <br />
        <Heading size="lg">Persoonlijke gegevens</Heading>
        <br /> */}

        {/* <Show when={!completion.loading && !completion.error} fallback={
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
        </Show> */}

        <br /><br /><br />
      </div>
    </>
  );

};

export default TicketDetails;