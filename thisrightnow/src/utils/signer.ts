export async function getSigner() {
  const { ethers } = await import('ethers');
  const provider = new ethers.BrowserProvider(
    (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
  );
  return provider.getSigner();
}
