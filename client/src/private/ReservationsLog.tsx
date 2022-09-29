import { useNavigate } from "@solidjs/router";
import { Component, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import createWebsocket from "../utils/websocket";


/**
 * Only nest this component in other components that ensure the user is logged in
 */
const ReservationsLog: Component = () => {

  const token = localStorage.getItem('token') || "";

  const onOpen = () => {
    console.log(state());
    send(token);
  };

  const [reservations, setReservations] = createSignal<any[]>([]);

  const [connect, disconnect, send, state] = createWebsocket(
    "ws://localhost:8080/wss",
    msg => {
      setReservations(res => [JSON.parse(msg.data), ...res]);
    },
    msg => alert(msg),
    onOpen
  );

  onMount(() => connect());

  return (
    <>
      Dashboard

      <For each={reservations()}>{(r: any) =>
        <div>{JSON.stringify(r)}</div>
      }</For>
    </>
  );

};

export default ReservationsLog;