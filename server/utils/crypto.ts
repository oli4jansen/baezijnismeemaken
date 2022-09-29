import { decode, encode, create, Payload, verify } from "../deps.ts";
import { fromEnv } from "./env.ts";


// ======= INITIALIZATION =========

// Get a key to use HMAC SHA-512
const algHS512: HmacImportParams = { name: "HMAC", hash: "SHA-512" };

// Get the HS512 key from .env, fallback to generating a new key
const hs512 = await fromEnv('CRYPTO_HS512_KEY', async () => {
  const key = await crypto.subtle.generateKey(algHS512, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', key);
  return jwk.k as string;
}, true);

// JSON Web Key (JWK) with which we sign the JSON Web Tokens (JWT) that are used for authorization
const jwkHS512: JsonWebKey = {
  "alg": "HS512",
  "ext": true,
  "k": hs512,
  "key_ops": ["sign", "verify"],
  "kty": "oct",
};

// Make sure this stays aligned with the JWK
const jwtHeader: { alg: "HS512", typ: "JWT" } = { alg: "HS512", typ: "JWT" };

// Load the JWK as an active CryptoKey
const keyHS512 = await crypto.subtle.importKey("jwk", jwkHS512, algHS512, false, jwkHS512.key_ops as KeyUsage[]);

// Next: get a key for the AES-GCM algorithm
const algAES = { name: "AES-GCM", length: 256 };

// Get the A256GCM key from .env, fallback to generating a new key
const a256GCM = await fromEnv('CRYPTO_A256GCM_KEY', async () => {
  const key = await crypto.subtle.generateKey(algAES, true, ['encrypt', 'decrypt']);
  const jwk = await crypto.subtle.exportKey('jwk', key);
  return jwk.k as string;
}, true);

// JSON Web Key (JWK) with which we encrypt the payload used as QR-codes
const jwkAES: JsonWebKey = {
  "alg": "A256GCM",
  "ext": true,
  "k": a256GCM,
  "key_ops": ["encrypt", "decrypt"],
  "kty": "oct"
};

// Load the JWK as an active CryptoKey
const keyAES = await crypto.subtle.importKey("jwk", jwkAES, algAES, false, jwkAES.key_ops as KeyUsage[]);

// Get an IV of length 12 with a random order of the letters "B", "A" and "E"
const getRandomInitVector = () => new TextEncoder().encode(
  Array.from({ length: 12 }, () => "bae"[Math.floor(Math.random() * 3)]).join('')
);


// ======= PUBLIC API =========


/**
 * Method to generate a new JWT token. Could be expanded with more data in payload in the future.
 */
export const generateToken = async (payload: Payload) => {
  return await create(jwtHeader, payload, keyHS512);
};

/**
 * Takes a token and verifies it. Returns the payload if valid. Throws an Error if invalid.
 */
export const verifyToken = async (jwtToken: string) => {
  return await verify(jwtToken, keyHS512);
};

/**
 * Encode a string using AES-GCM (used for QR-code payload)
 */
export const encodeAesGcm = async (str: string) => {
  const iv = getRandomInitVector();
  const uint8Array = new TextEncoder().encode(str);
  const signed = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    keyAES,
    uint8Array,
  );
  const base64 = encode(signed);
  return [base64, new TextDecoder("utf-8").decode(iv)];
};

/**
 * Decode a base64-encoded string using AES-GCM
 */
export const decodeAesGcm = async (b64: string, iv: string) => {
  const uint8Array = decode(b64);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new TextEncoder().encode(iv) },
    keyAES,
    uint8Array,
  );
  return new TextDecoder("utf-8").decode(decrypted);
};
