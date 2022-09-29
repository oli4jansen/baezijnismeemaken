import { Button, Heading, HStack, IconButton, Spinner } from '@hope-ui/solid';
import { useNavigate } from '@solidjs/router';
import { Component, createMemo, createResource, createSignal, ErrorBoundary, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import RemoveIcon from '@suid/icons-material/Remove';
import AddIcon from '@suid/icons-material/Add';
import { fetchTicketTypes } from '../utils/api';

import logoUrl from '../assets/logo.svg';

const MAX_TICKETS_PER_RESERVATION = 50;

// ---

const TicketShop: Component = () => {
  const [ticketTypes, { refetch }] = createResource(fetchTicketTypes);
  const [basket, setBasket] = createStore<{ [ticketTypeId: string]: number }>({});
  const totalPrice = createMemo(() => {
    const total = Object.entries(basket).reduce((acc, [id, amount]) => {
      const ticket = ticketTypes()?.find(t => t.id === id);
      if (!ticket) {
        throw new Error('invalid ticket selected');
      }
      return acc + ticket.price * amount;
    }, 0);
    return (total / 100).toFixed(2);
  });

  const numTickets = createMemo(() => Object.values(basket).reduce((acc, cur) => acc + cur, 0));

  const navigate = useNavigate();

  const decreaseCount = (id: string): void => {
    if (basket[id] && basket[id] > 0) {
      setBasket(id, basket[id] - 1);
    }
  };

  const increaseCount = (left: number, id: string): void => {
    setBasket(id, Math.min((basket[id] || 0) + 1, MAX_TICKETS_PER_RESERVATION, left));
  };

  const [creatingReservation, setCreatingReservation] = createSignal(false);
  const createReservation = async (tickets: { [id: string]: number }) => {
    setCreatingReservation(true);
    const url = `http://localhost:8080/reservations`;
    const response = await (await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tickets: Object.entries(tickets).map(([id, amount]) => ({ id, amount }))
      })
    })).json();

    setCreatingReservation(false);

    if (response && !response.error) {
      navigate(`/reservation/${response.id}`);
    } else if (response && response.error && response.error.includes('no more tickets left')) {
      alert('Helaas, je bent net te laat. De hoeveelheid kaartjes die je wilde reserveren, is niet meer beschikbaar.');
      await refetch();
    } else {
      alert("Er ging helaas iets mis. Probeer het nog eens of mail naar openluchtcantus@orcaroeien.nl.");
    }
  };

  return (
    <>
      <HStack spacing={48}>
        <img src={logoUrl} style="width: 100px; height: auto; transform: rotate(-5deg)" />
      </HStack>

      <ErrorBoundary fallback={err => <>De kaartverkoop is momenteel gesloten.</>}>
        <Show
          when={!ticketTypes.loading}
          fallback={<div style="width: 100%; text-align: center; padding: 32px 0"><Spinner></Spinner></div>}
        >
          <For each={ticketTypes()}>{(tt: any, i) =>
            <div class="ticket-type">
              <HStack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                <Heading class="name" size="xl">{tt.name}</Heading>
                <span style="margin-right: 18px; opacity: 0.5">{tt.amount_left - (basket[tt.id] || 0)}/{tt.amount_available}</span>
              </HStack>

              <div class="description">{tt.description}</div>

              <HStack direction="row" justifyContent="space-between" alignItems="center" spacing={2} class="price-and-actions">
                <h3 class="price">&euro;{(tt.price / 100).toFixed(2)}</h3>

                <HStack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
                  <IconButton aria-label="Remove ticket" icon={<RemoveIcon />} onClick={() => decreaseCount(tt.id)} disabled={!basket[tt.id] || basket[tt.id] === 0} />
                  <span class="amount">{basket[tt.id] || 0}</span>
                  <IconButton aria-label="Add ticket" icon={<AddIcon />} onClick={() => increaseCount(tt.amount_left, tt.id)} disabled={tt.amount_left === 0 || basket[tt.id] === tt.amount_left} />
                </HStack>
              </HStack>
            </div>
          }</For>
          <Show when={ticketTypes()?.length === 0}>
            De kaartverkoop is momenteel gesloten.
          </Show>
        </Show>
      </ErrorBoundary>

      <HStack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
        <span class="total-price">
          Totaal:&nbsp;
          <b>&euro;{totalPrice()}</b>
        </span>
        <Button disabled={numTickets() === 0} loading={creatingReservation()} loadingText="Aan het reserveren..." onClick={() => createReservation(basket)}>Reserveer</Button>
      </HStack>

      <br /><br /><br />
    </>
  );
};

export default TicketShop;

