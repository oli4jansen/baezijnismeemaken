import { Heading } from "@hope-ui/solid";
import { Component } from "solid-js";
import Header from "./Header";

const Repersonalized: Component = () => {

  return (
    <>
      <Header />

      <br />
      <br />

      <Heading size="4xl" class="extrabold main-title">Kaartje aangepast!</Heading>
      <br />
      <p>De gegevens op het kaartje zijn aangepast. Je huidige QR-code is ongeldig gemaakt. Er is een nieuwe QR-code naar het nieuwe e-mailadres verstuurd.</p>
    </>
  );

};

export default Repersonalized;