import { Component, createMemo, createSignal, onCleanup, Show } from "solid-js";


const ReservationCountdown: Component<{ validUntil: number }> = (props) => {

    const [countdown, setCountdown] = createSignal(props.validUntil - new Date().getTime());
	const interval = setInterval(
		() => setCountdown(c => c - 1000),
		1000
	);
	onCleanup(() => clearInterval(interval));

    const minutes = createMemo(() => Math.max(0, Math.floor(countdown() / 1000 / 60)));
    const seconds = createMemo(() => Math.max(0, Math.floor(countdown() / 1000 - minutes() * 60)));

  return (
    <div class="reservation-countdown">
      <Show
        when={!(minutes() === 0 && seconds() === 0)}
        fallback={<span style="color: #ea2c04">Je reservering helaas is verlopen..</span>}>
      Deze kaartjes zijn <b>{minutes()}:{String(seconds()).padStart(2, "0")} minuten</b> voor je gereserveerd:
      </Show>
    </div>
  );

};

export default ReservationCountdown;