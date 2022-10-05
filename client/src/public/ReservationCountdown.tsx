import { Component, createMemo, createSignal, onCleanup, Show } from "solid-js";

/**
 * Shows a live countdown indicating how long the tickets will be reservered
 */
const ReservationCountdown: Component<{ validUntil: number }> = (props) => {
  // The initial value of the countdown is the validUntil timestamp minus the current timestamp
  const initialValue = props.validUntil - new Date().getTime();

  // Create a countdown signal
  const [countdown, setCountdown] = createSignal(initialValue);

  // Every second, subtract a second from the value
  const interval = setInterval(() => setCountdown(c => c - 1000), 1000);

  // Calculate memoized minutes and seconds to display
  const minutes = createMemo(() => Math.max(0, Math.floor(countdown() / 1000 / 60)));
  const seconds = createMemo(() => Math.max(0, Math.floor(countdown() / 1000 - minutes() * 60)));

  const minutesStr = createMemo(() => String(minutes()));
  const secondsStr = createMemo(() => String(seconds()).padStart(2, "0"));

  // Stop counting down when the component is cleaned up
  onCleanup(() => clearInterval(interval));

  return (
    <div class="reservation-countdown">
      <Show when={minutes() !== 0 || seconds() !== 0}>
        Deze kaartjes zijn <b>{minutesStr()}:{secondsStr()} minuten</b> voor je gereserveerd:
      </Show>

      <Show when={minutes() === 0 && seconds() === 0}>
        <span style="color: #ea2c04">Je reservering helaas is verlopen..</span>
      </Show>
    </div>
  );
};

export default ReservationCountdown;