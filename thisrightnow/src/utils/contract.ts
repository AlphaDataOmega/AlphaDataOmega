import { ethers } from 'ethers';

export async function loadContract(address: string, abi: ethers.InterfaceAbi) {
  const provider = new ethers.BrowserProvider(
    (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!
  );
  const signer = await provider.getSigner();
  return new ethers.Contract(address, abi, signer);
}
