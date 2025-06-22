export async function encryptVault(keys: string[], passphrase: string) {
  const enc = new TextEncoder();
  const rawKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const payload = JSON.stringify({ keys });

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    rawKey,
    enc.encode(payload)
  );

  return {
    encrypted: Buffer.from(encrypted).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
  };
}
