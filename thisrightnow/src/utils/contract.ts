import { ethers } from 'ethers';

export async function loadContract(address: string, abi: any) {
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(address, abi, signer);
}
