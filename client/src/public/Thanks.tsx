import { Heading, HStack } from "@hope-ui/solid";
import { Component, createMemo, createSignal, onCleanup, Show } from "solid-js";
import logoUrl from '../assets/logo.svg';


const Thanks: Component = () => {

  return (
    <>
      <HStack spacing={48}>
        <img src={logoUrl} style="width: 100px; height: auto; transform: rotate(-5deg)" />
      </HStack>

      <br />
      <br />

      <Heading size="4xl" class="extrabold main-title">Baedankt!</Heading>
      <br />
      <p>Je ontvangt de kaartjes snel in je inbox. Gebruik de QR-code om binnen te komen op het cantusterrein.<br /><br /><br />Kusjes van je bae's.</p>
    </>
  );

};

export default Thanks;