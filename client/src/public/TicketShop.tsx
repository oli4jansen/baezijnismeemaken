import { Alert, Button, HStack, Spinner } from '@hope-ui/solid';
import { useNavigate } from '@solidjs/router';
import { Component, createEffect, createMemo, createResource, createSignal, ErrorBoundary, For, onCleanup, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { fetchTicketTypes, TicketType, createReservation, fetchShopOpened } from '../utils/api';

import TicketTypeSelector from './TicketTypeSelector';
import Header from './Header';
import ShopOpeningCountdown from './ShopOpeningCountdown';

const CLOSED_MESSAGE = 'De kaartverkoop is momenteel gesloten.';
const TOO_LATE_MESSAGE = 'Helaas, je bent net te laat. De hoeveelheid kaartjes die je wilde reserveren, is niet meer beschikbaar.';
const UNKNOWN_ERROR_MESSAGE = 'Er ging helaas iets mis. Probeer het nog eens of mail naar openluchtcantus@orcaroeien.nl.';

/**
 * TicketShop is the main page of the app, on which tickets can be selected.
 */
const TicketShop: Component = () => {
  const navigate = useNavigate();

  // Fetch the shop status (open, closed, countdown) from the server
  const [shopStatus, { refetch: refetchShopStatus }] = createResource(fetchShopOpened);

  // Fetch the ticket types from the server
  const [ticketTypes, { refetch: refetchTicketTypes }] = createResource(fetchTicketTypes);

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
      navigate(`/complete/${response.id}`);
    } else if (response && response.error && response.error.includes('no more tickets left')) {
      // The tickets were sold out between the page was loaded and the basket was submitted
      alert(TOO_LATE_MESSAGE);
      // Refetch the ticket types to update the view
      await refetchTicketTypes();
    } else {
      alert(UNKNOWN_ERROR_MESSAGE);
    }
  };

  // Refetch the shop status every 5 minutes to ensure we are in sync
  const interval = setInterval(() => refetchShopStatus(), 1000 * 60 * 5);

  onCleanup(() => clearInterval(interval));

  const countdownRequestsRefresh = () => {
    const ss = shopStatus();
    if (!!ss && ss.opensAtTimestamp > 0 && ss.opensAtTimestamp < (+new Date() + 1000)) {
      setTimeout(() => window.location.reload(), 1000);
    } else {
      refetchShopStatus();
    }
  };

  return (
    <>
      <Header />

      <ErrorBoundary fallback={<>
        <Show when={!shopStatus()?.open && !shopStatus()?.opensAtTimestamp}>
          <Alert status="warning" style="margin: 48px 0 12px 0">
            <p>{CLOSED_MESSAGE}</p>
          </Alert>
        </Show>
        <Show when={!shopStatus()?.open && !!shopStatus()?.opensAtTimestamp}>
          <ShopOpeningCountdown opensAtTimestamp={shopStatus()?.opensAtTimestamp || 0} refresh={countdownRequestsRefresh}></ShopOpeningCountdown>
        </Show>
      </>}>

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

        <HStack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Show when={numTickets() > 0}>
            <span class="total-price">
              Totaalprijs:&nbsp;
              <b>&euro;{totalPrice()}</b>
            </span>
          </Show>
          <div></div>
          <Button
            disabled={numTickets() === 0}
            loading={submitting()}
            loadingText="Aan het reserveren..."
            onClick={() => submit(basket)}>
            RESERVEER
          </Button>
        </HStack>

      </ErrorBoundary>

      <br /><br />
    </>
  );
};

export default TicketShop;

