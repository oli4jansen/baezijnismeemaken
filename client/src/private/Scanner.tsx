import { Button, createDisclosure, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import { format } from "date-fns";
import { QRCode } from "jsqr";
import { Component, createEffect, createSignal, Match, onCleanup, onMount, Show, Switch } from "solid-js";
import { createTicketScan } from "../utils/api";
import { ensureLoggedIn } from "../utils/auth";
import AdminMenu from "./AdminMenu";

const Scanner: Component = () => {
  const navigate = useNavigate();

  const [response, setResponse] = createSignal<any>(undefined);
  const [lookingForQR, setLookingForQR] = createSignal(true);

  const { isOpen, onOpen, onClose } = createDisclosure();

  createEffect(() => setLookingForQR(!isOpen()));

  createEffect(() => { if (!isOpen()) tick() });

  let worker: Worker;
  let video: HTMLVideoElement;
  let stream: MediaStream | undefined;
  let canvas: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D | null;

  // 'tick' gets called often to send frames to the Web Worker
  const tick = () => {
    if (!lookingForQR() || !worker || !canvasContext) {
      return;
    }
    requestAnimationFrame(() => {
      setResponse(null);
      if (!canvasContext) {
        return;
      }
      canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      worker.postMessage({ data: imageData.data, width: canvas.width, height: canvas.height });
    });
  };

  onMount(async () => {
    ensureLoggedIn(() => navigate('/admin'));

    // Create a new Web Worker to find the QR code
    if (!window.Worker) {
      return navigate('/admin/dashboard');
    }
    worker = new Worker(new URL('../utils/qr-worker.ts', import.meta.url), { type: 'module' });

    // Get the webcam video stream
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const videoTracks = stream.getVideoTracks();
    const videoTrackSettings = videoTracks[0].getSettings();

    // Play webcam stream in <video /> tag
    video = document.getElementById("video") as HTMLVideoElement;
    video.srcObject = stream;
    await video.play();

    // Create a <canvas /> tag to get pixels from stream
    canvas = document.createElement("canvas");
    canvas.height = videoTrackSettings.height || 500;
    canvas.width = videoTrackSettings.width || 900;
    canvasContext = canvas.getContext("2d");
    if (!canvasContext) {
      return;
    }

    // If the Web Worker responds, check if a QR code has been found and handle it
    worker.onmessage = async (msg: MessageEvent<QRCode | null>) => {
      if (!lookingForQR()) {
        return;
      }
      if (!msg.data || msg.data.data === '') {
        return tick();
      }
      // Stop looking for the QR code
      setLookingForQR(false);
      onOpen();
      setResponse(await createTicketScan(msg.data.data));
    };

    tick();
  });

  // Stop looking for the QR code if the component is cleaned up
  onCleanup(() => {
    setLookingForQR(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  });

  return (
    <>
      <AdminMenu active="scanner"></AdminMenu>

      <Modal opened={isOpen()} onClose={onClose}>
        <ModalOverlay />
        <ModalContent style={`background-color: ${!!response() ? response().error ? '#ea2c04' : '#18794e' : 'white'}`}>

          <Show
            when={!!response()}
            fallback={<ModalBody style="text-align: center; padding: 32px"><Spinner /></ModalBody>}>

            <Switch>
              <Match when={!response().error}>

                <ModalHeader style="color: white; font-weight: bold">Kaartje is geldig</ModalHeader>
                <ModalBody style="color: white">
                  <span style="opacity: 0.75">Kaartje:</span> {response().ticket.ticket_name}<br />
                  <span style="opacity: 0.75">Naam:</span> {response().ticket.owner_first_name} {response().ticket.owner_last_name}<br />
                </ModalBody>

              </Match>
              <Match when={response().error === 'ticket already scanned'}>

                <ModalHeader style="color: white; font-weight: bold">Kaartje is al gescand</ModalHeader>
                <ModalBody style="color: white">
                  Dit kaartje is al eens eerder gescand.<br /><br />
                  <span style="opacity: 0.75">Gescand op:</span> {format(new Date(response().ticketScan.created_at), 'yyyy-MM-dd HH:mm:ss')}<br />
                </ModalBody>

              </Match>
              <Match when={response().error === 'ticket re-personalized'}>

                <ModalHeader style="color: white; font-weight: bold">Kaartje doorverkocht</ModalHeader>
                <ModalBody style="color: white">
                  Dit kaartje is doorverkocht, op een andere naam gezet of er is een nieuwe QR-code gegenereerd.<br /><br />
                  <span style="opacity: 0.75">Kaartje:</span> {response().ticket.ticket_name}<br />
                  <span style="opacity: 0.75">Nieuwe naam:</span> {response().ticket.owner_first_name} {response().ticket.owner_last_name}<br />
                  <span style="opacity: 0.75">Nieuw e-mailadres:</span> {response().ticket.owner_email}<br />
                </ModalBody>

              </Match>
              <Match when={response().error}>

                <ModalHeader style="color: white; font-weight: bold">Kaartje ongeldig</ModalHeader>
                <ModalBody style="color: white">
                  <pre>{response().error}</pre>
                </ModalBody>

              </Match>
            </Switch>

          </Show>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="neutral" variant="subtle">Volgende</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <video autoplay={true} id="video" muted={true} playsinline style="width: 100%; height: 100%; max-height: 75vh" />
    </>
  );

};

export default Scanner;