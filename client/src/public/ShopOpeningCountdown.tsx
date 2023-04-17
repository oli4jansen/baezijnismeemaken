import { Component, createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js";

/**
 * Shows a live countdown indicating how long the tickets will be reservered
 */
const ShopOpeningCountdown: Component<{ opensAtTimestamp: number; refresh: () => void }> = (props) => {
  // Create a countdown signal
  const [countdown, setCountdown] = createSignal(0);

  createEffect(() => {
    setCountdown(props.opensAtTimestamp - new Date().getTime());
  });

  // Every second, subtract a second from the value
  const interval = setInterval(() => {
    setCountdown(c => {
      if (c - 1000 < 1000) {
        props.refresh();
      }
      return c - 1000;
    });
  }, 1000);

  // Calculate memoized minutes and seconds to display
  const days = createMemo(() => Math.max(0, Math.floor(countdown() / 1000 / 60 / 60 / 24)));
  const hours = createMemo(() => Math.max(0, Math.floor(countdown() / 1000 / 60 / 60 - days() * 24)));
  const minutes = createMemo(() => Math.max(0, Math.floor(countdown() / 1000 / 60 - hours() * 60 - days() * 60 * 24)));
  const seconds = createMemo(() => Math.max(0, Math.floor(countdown() / 1000 - minutes() * 60 - hours() * 60 * 60 - days() * 60 * 60 * 24)));

  const daysStr = createMemo(() => String(days()));
  const hoursStr = createMemo(() => String(hours()));
  const minutesStr = createMemo(() => String(minutes()));
  const secondsStr = createMemo(() => String(seconds()));

  // Stop counting down when the component is cleaned up
  onCleanup(() => clearInterval(interval));

  return (
    <div class="shop-opening-countdown">
      <a href="https://mijn.orcaroeien.nl/#/events/1175" target="_blank" class="event">
        <div class="date">
          <div class="day">24</div>
          <div class="month">april</div>
        </div>
        <div class="title">
          <div>Kaartverkoop op Orca</div>
          <div class="subtitle">vanaf <u>8 uur</u></div>
        </div>
      </a>

      <Show when={days() !== 0 || hours() !== 0 || minutes() !== 0 || seconds() !== 0}>
        of kom hier over 
        <Show when={days() > 0}>{daysStr()} {days() === 1 ? 'dag' : 'dagen'}, </Show>
        <Show when={days() > 0 || hours() > 0}>{hoursStr()} uur, </Show>
        <Show when={days() > 0 || hours() > 0 || minutes() > 0}>{minutesStr()} {minutes() === 1 ? 'minuut' : 'minuten'} en </Show>
        {secondsStr()} seconden maar terug.
      </Show>

      <Show when={days() === 0 && hours() === 0 && minutes() === 0 && seconds() === 0}>
        De winkel kan ieder moment openen!
      </Show>
    </div>
  );
};

export default ShopOpeningCountdown;