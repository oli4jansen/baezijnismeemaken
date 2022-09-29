import { Alert, Button, createDisclosure, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner } from "@hope-ui/solid";
import { useNavigate } from "@solidjs/router";
import { QRCode } from "jsqr";
import { Component, createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
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
      if (!msg.data) {
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
        <ModalContent>

          <Show when={!!response()} fallback={<ModalBody style="text-align: center; padding: 32px"><Spinner /></ModalBody>}>
            <Show when={!response().error} fallback={
              <Show when={response().error === 'ticket already scanned'} fallback={<ModalBody>{JSON.stringify(response().error)}</ModalBody>}>
                <ModalHeader style="color: #cd2b31; font-weight: bold">Kaartje is al gescand</ModalHeader>
                <ModalBody>
                  Dit kaartje is al eens eerder gescand.
                </ModalBody>
              </Show>
            }>
              <ModalHeader style="color: #18794e; font-weight: bold">Kaartje is geldig</ModalHeader>
              <ModalBody>
                Naam: {response().first_name} {response().last_name}<br />
                Kaartje: {response().ticket_name}<br />
              </ModalBody>
            </Show>
          </Show>
          <ModalFooter>
            <Button onClick={onClose}>Volgende</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <video autoplay={true} id="video" muted={true} playsinline style="width: 100%; height: 100%; max-height: 75vh" />
    </>
  );

};

export default Scanner;