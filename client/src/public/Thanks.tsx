import { Heading } from "@hope-ui/solid";
import { useNavigate, useParams } from "@solidjs/router";
import { Component, createEffect, createResource } from "solid-js";
import { fetchPayment } from "../utils/api";

import Header from "./Header";

/**
 * This component is rendered when the user comes back from a successful payment.
 */
const Thanks: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [payment] = createResource(() => params.id, fetchPayment);

  createEffect(async () => {
    if (!payment() || payment().error) {
      navigate(`/complete/${params.id}`);
    }
  });

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