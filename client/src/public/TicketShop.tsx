import { Button, HStack, Spinner } from '@hope-ui/solid';
import { useNavigate } from '@solidjs/router';
import { Component, createMemo, createResource, createSignal, ErrorBoundary, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { fetchTicketTypes, TicketType, createReservation } from '../utils/api';

import TicketTypeSelector from './TicketTypeSelector';
import Header from './Header';

const CLOSED_MESSAGE = 'De kaartverkoop is momenteel gesloten.';
const TOO_LATE_MESSAGE = 'Helaas, je bent net te laat. De hoeveelheid kaartjes die je wilde reserveren, is niet meer beschikbaar.';
const UNKNOWN_ERROR_MESSAGE = 'Er ging helaas iets mis. Probeer het nog eens of mail naar openluchtcantus@orcaroeien.nl.';

/**
 * TicketShop is the main page of the app, on which tickets can be selected.
 */
const TicketShop: Component = () => {
  const navigate = useNavigate();

  // Fetch the ticket types from the server
  const [ticketTypes, { refetch }] = createResource(fetchTicketTypes);

  // Create a store for the users basket
  const [basket, setBasket] = createStore<{ [ticketTypeId: string]: number }>({});


  // The number of tickets is memoized
  const numTickets = createMemo(() => Object.values(basket).reduce((acc, cur) => acc + cur, 0));

  // The total price is memoized
  const totalPrice = createMemo(() => {
    const total = Object.entries(basket).reduce((acc, [id, amount]) => {
      const ticket = ticketTypes()?.find(t => t.id === id);
      if (!ticket) {
        throw new Error('invalid ticket selected');
      }
      return acc + ticket.price * amount;
    }, 0);

    // Format price in cents to a readable string
    return (total / 100).toFixed(2);
  });


  // Function to decrease the number of tickets of a certain type in the basket
  const decreaseCount = (id: string): void => {
    if (basket[id] && basket[id] > 0) {
      setBasket(id, basket[id] - 1);
    }
  };

  // Function to increase the number of tickets of a certain type in the basket
  const increaseCount = (id: string, left: number): void => {
    setBasket(id, Math.min((basket[id] || 0) + 1, left));
  };


  // Signal to track whether the basket is being submitted
  const [submitting, setSumbitting] = createSignal(false);

  // Function to submit the basket
  const submit = async (tickets: { [id: string]: number }) => {
    // Do the submitting and update the signal while doing so
    setSumbitting(true);
    const response = await createReservation(tickets);
    setSumbitting(false);

    if (response && !response.error) {
      // Navigate to the next page where the reservation can be completed
      navigate(`/reservation/${response.id}`);
    } else if (response && response.error && response.error.includes('no more tickets left')) {
      // The tickets were sold out between the page was loaded and the basket was submitted
      alert(TOO_LATE_MESSAGE);
      // Refetch the ticket types to update the view
      await refetch();
    } else {
      alert(UNKNOWN_ERROR_MESSAGE);
    }
  };

  return (
    <>
      <Header />

      <ErrorBoundary fallback=<>{CLOSED_MESSAGE}</>>

        <Show when={ticketTypes.loading}>
          <div class="spinner-container"><Spinner /></div>
        </Show>

        <Show when={!ticketTypes.loading}>
          <For each={ticketTypes()}>{(tt: TicketType) =>
            <TicketTypeSelector
              ticketType={tt}
              inBasket={basket[tt.id] || 0}
              increase={() => increaseCount(tt.id, tt.amount_left)}
              decrease={() => decreaseCount(tt.id)} />
          }</For>
        </Show>

      </ErrorBoundary>

      <HStack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
        <span class="total-price">
          Totaal:&nbsp;
          <b>&euro;{totalPrice()}</b>
        </span>
        <Button
          disabled={numTickets() === 0}
          loading={submitting()}
          loadingText="Aan het reserveren..."
          onClick={() => submit(basket)}>
          Reserveer
        </Button>
      </HStack>

      <br /><br />
    </>
  );
};

export default TicketShop;

