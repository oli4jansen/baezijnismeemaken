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

        <div style="padding: 48px 0 0; font-size: 12px; opacity: 0.75; text-align: center">Stuur voor vragen even een mailtje naar <a href="mailto:intro@orcaroeien.nl">intro@orcaroeien.nl</a>.</div>

      </ErrorBoundary>

      <div class="socials">
        <a href="mailto:intro@orcaroeien.nl" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/></svg>
        </a>
        <a href="https://www.instagram.com/ausr_orca/" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        {/* <a href="https://facebook.com/berendbootjeannaerowtisch" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
        </a> */}
        {/* <a href="https://mijn.orcaroeien.nl/#/events/1129" target="_blank">
          <img src="https://mijn.orcaroeien.nl/favicon-32x32.png" style="height: 18px; width: 18px" />
        </a> */}
        {/* <a href="https://www.youtube.com/channel/UCQYLA-GmN4_5coeNTMbeLwQ" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
        </a> */}
      </div>

      <br /><br />
    </>
  );
};

export default TicketShop;

