import { Heading } from "@hope-ui/solid";
import { Component } from "solid-js";
import Header from "./Header";

/**
 * This component is rendered when the user comes back from a successful payment.
 */
const Thanks: Component = () => {

  return (
    <>
      <Header />

      <br />
      <br />

      <Heading size="4xl" class="extrabold main-title">Baedankt!</Heading>
      <br />
      <p>Je ontvangt de kaartjes snel in je inbox. Gebruik de QR-code om binnen te komen op het cantusterrein.<br /><br /><br />Kusjes van je bae's.</p>
    </>
  );

};

export default Thanks;