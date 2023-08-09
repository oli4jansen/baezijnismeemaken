import { Component, createEffect, createMemo, createResource, createSignal, For, onMount, Show } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { Button, Checkbox, FormControl, FormErrorMessage, FormLabel, HStack, Input, Spinner } from '@hope-ui/solid';
import ArrowForwardIcon from '@suid/icons-material/ArrowForward';

import { fetchCompletion, fetchPayment, fetchReservation, postCompletion, postPayment } from '../utils/api';
import { groupBy } from '../utils/utils';

import Header from './Header';
import ReservationCountdown from './ReservationCountdown';

const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

/**
 * Component to complete a reservation (with personal details)
 */
const CompletionForm: Component = () => {
  // Get the route params and the navigate function
  const params = useParams();
  const navigate = useNavigate();

  // Call the API for the required information
  const [reservation, { mutate }] = createResource(() => params.id, fetchReservation);
  const [completion] = createResource(() => params.id, fetchCompletion);
  const [payment] = createResource(() => params.id, fetchPayment);

  const ticketByType = createMemo(() => Object.values(groupBy(reservation()?.tickets || [], 'ticket_type')).map(lst => ({ ...lst[0], amount: lst.length })));

  // Set a timeout to locally mark the reservation as expired
  createEffect(() => {
    if (reservation() === undefined) {
      return;
    }
    // Milliseconds until expiration
    const exp = reservation().valid_until - new Date().getTime();
    setTimeout(() => mutate({ ...reservation(), expired: true }), exp);
  });

  // Navigate back to home if the ID parameter is invalid
  onMount(async () => {
    if (!params.id || params.id === undefined || params.id === 'undefined') {
      navigate('/');
    }
  });

  createEffect(() => {
    const p = payment();
    if (!!p && !!p.created_at) {
      navigate(`/baedankt/${params.id}`);
    }
  });

  // Signals for the completion form
  const [email, setEmail] = createSignal("");
  const [firstName, setFirstName] = createSignal("");
  const [lastName, setLastName] = createSignal("");
  const [society, setSociety] = createSignal("UIT-loper");
  const [agree, setAgree] = createSignal(false);

  // Validation function for the email field
  const invalidEmail = () => email() !== "" && !emailRegex.test(email());

  const [creatingCompletion, setCreatingCompletion] = createSignal(false);
  const createCompletion = async () => {
    setCreatingCompletion(true);
    const response = await postCompletion(reservation().id, email(), firstName(), lastName(), society());

    if (response) {
      window.location.href = response.checkout;
    } else {
      alert("Something went wrong.");
    }
    console.log(response);
  };

  const [creatingPayment, setCreatingPayment] = createSignal(false);
  const createPayment = async () => {
    setCreatingPayment(true);
    const response = await postPayment(reservation().id);
    if (response) {
      window.location.href = response.checkout;
    } else {
      alert("Something went wrong.");
    }
  };

  return (
    <>
      <Header />

      <br />

      <Show when={reservation.loading}>
        <div class="spinner-container">
          <Spinner />
        </div>
      </Show>

      <Show when={!reservation.loading}>
        <ReservationCountdown validUntil={reservation().valid_until} />

        <div class="tickets-overview">
          <For each={Object.values(ticketByType())}>{(tt: any) =>
            <div class="ticket-small">
              <HStack direction="row" justifyContent="space-between" alignItems="center" spacing={2} class="price-and-actions">
                <span class="name">{tt.ticket_name}</span>

                <HStack direction="row" alignItems="center" spacing="8px" class="price">
                  <span class="parts">{tt.amount} x &euro;{(tt.price / 100).toFixed(2)}</span>
                  <ArrowForwardIcon sx={{ fontSize: 18 }} />
                  <span class="sum">&euro;{(tt.amount * tt.price / 100).toFixed(2)}</span>
                </HStack>
              </HStack>

            </div>
          }</For>
          <div class="ticket-small">
            <HStack direction="row" justifyContent="space-between" alignItems="center" spacing={2} class="price-and-actions" style="opacity: 0.75; margin-top: 12px">
              <span class="name">Transactiekosten</span>

              <HStack direction="row" alignItems="center" spacing="8px" class="price">
                <span class="sum">&euro;0.29</span>
              </HStack>
            </HStack>
          </div>
          <div class="ticket-small tickets-total-price">
            <HStack direction="row" justifyContent="end" alignItems="center">
              &euro;{(reservation().price / 100).toFixed(2)}
            </HStack>
          </div>
        </div>

        <Show when={!reservation().expired}>
          <Show when={completion()?.error} fallback={
            <div>
              We wachten nog op je betaling.
              <br /><br />
              Als je de betaling per ongeluk geannuleerd hebt, kun je het met onderstaande knop nog eens proberen.
              <br />
              <br />

              <Button onClick={() => createPayment()} disabled={reservation().expired} loading={creatingPayment()} loadingText="Naar baetalen...">Betaal opnieuw</Button>
            </div>
          }>
            <form onSubmit={e => { e.preventDefault(); createCompletion() }}>

              <div class="completion-form">
                <p>Vul je gegevens in en betaal om je kaartjes te bemachtigen.</p>

                <FormControl required invalid={invalidEmail()} disabled={reservation().expired || creatingCompletion()}>
                  <FormLabel for="email">E-mailadres</FormLabel>
                  <Input id="email" type="email" value={email()} onInput={(e) => setEmail(e.currentTarget.value)} />
                  <Show when={invalidEmail()}>
                    <FormErrorMessage>Vul een geldig e-mailadres in</FormErrorMessage>
                  </Show>
                </FormControl>

                <br />

                <FormControl required disabled={reservation().expired || creatingCompletion()}>
                  <FormLabel for="firstName">Voornaam</FormLabel>
                  <Input id="firstName" type="text" value={firstName()} onInput={(e) => setFirstName(e.currentTarget.value)} />
                </FormControl>

                <br />

                <FormControl required disabled={reservation().expired || creatingCompletion()}>
                  <FormLabel for="lastName">Achternaam</FormLabel>
                  <Input id="lastName" type="text" value={lastName()} onInput={(e) => setLastName(e.currentTarget.value)} />
                </FormControl>

                <br />

                <FormControl required disabled={reservation().expired || creatingCompletion()}>
                  <FormLabel for="society">Vereniging/UIT-loper</FormLabel>
                  <Input id="society" type="text" value={society()} onInput={(e) => setSociety(e.currentTarget.value)} />
                </FormControl>
                <br />

                <Checkbox checked={agree()} onChange={(e: any) => setAgree(e.target.checked)}>Als ik iets sloop, zal ik ervoor betalen.</Checkbox>
                <br />
              </div>

              <HStack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
                <Button type="submit" disabled={email() === '' || firstName() === '' || lastName() === '' || !agree() || reservation().expired} loading={creatingCompletion()} loadingText="Naar baetalen...">
                  BAETALEN
                </Button>
              </HStack>
            </form>
          </Show>

        </Show>

      </Show>
    </>
  );
};

export default CompletionForm;
