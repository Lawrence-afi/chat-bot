const buf2b64 = (buf) => {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
};

const b642buf = (b64) => {
  return Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
};

export async function importRsaPublicKey(publicKeyBase64) {
  const keyData = b642buf(publicKeyBase64);
  return crypto.subtle.importKey(
    "spki",
    keyData,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  );
}

export async function generateAesKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function exportCryptoKeyRaw(key) {
  return crypto.subtle.exportKey("raw", key);
}

export async function encryptAesGcm(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoded,
  );

  return { ciphertext, iv };
}

export async function rsaOaepEncrypt(publicKey, data) {
  return crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    data,
  );
}

export async function createEncryptedPayload(message, recipientPublicKeyBase64) {
  const recipientKey = await importRsaPublicKey(recipientPublicKeyBase64);
  const aesKey = await generateAesKey();
  const { ciphertext, iv } = await encryptAesGcm(aesKey, message);
  const rawAesKey = await exportCryptoKeyRaw(aesKey);
  const encryptedKeyBytes = await rsaOaepEncrypt(recipientKey, rawAesKey);
  const encryptedKey = buf2b64(encryptedKeyBytes);

  return {
    ciphertext: buf2b64(ciphertext),
    iv: buf2b64(iv),
    encryptedKey,
    encryptedKeyForSelf: encryptedKey,
  };
}

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
