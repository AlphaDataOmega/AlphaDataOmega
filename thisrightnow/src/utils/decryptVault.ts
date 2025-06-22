export async function decryptVault(encryptedBase64: string, ivBase64: string, passphrase: string) {
  const dec = new TextDecoder();
  const enc = new TextEncoder();

  const encrypted = Uint8Array.from(Buffer.from(encryptedBase64, "base64"));
  const iv = Uint8Array.from(Buffer.from(ivBase64, "base64"));

  const key = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  try {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );

    const json = JSON.parse(dec.decode(decrypted));
    return json.keys;
  } catch {
    throw new Error("Invalid passphrase or corrupted vault.");
  }
}
