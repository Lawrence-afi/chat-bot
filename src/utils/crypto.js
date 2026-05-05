export async function generateKeys(password) {
  const buf2b64 = (buf) => {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  };

  // 1. Generate RSA keypair
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );

  const publicKeyDer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKeyDer = await crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey,
  );

  // 2. Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 3. Derive key from password
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt"],
  );

  // 4. Encrypt private key
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedPrivateKey = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    encryptionKey,
    privateKeyDer,
  );

  return {
    public_key: buf2b64(publicKeyDer),
    wrapped_private_key: buf2b64(encryptedPrivateKey),
    pbkdf2_salt: buf2b64(salt),
    iv: buf2b64(iv),
  };
}
