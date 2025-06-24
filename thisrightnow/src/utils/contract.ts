import { ethers } from "ethers";

/**
 * Loads a contract either by address or by name.
 * If a name is provided, the address will be looked up via
 * `import.meta.env.VITE_<NAME>_ADDRESS`.
 *
 * @param nameOrAddress - Contract name or address
 * @param abi - Contract ABI
 * @param useSigner - Connect with signer (default: true)
 */
export async function loadContract(
  nameOrAddress: string,
  abi: ethers.InterfaceAbi,
  useSigner = true,
) {
  const provider = new ethers.BrowserProvider(
    (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum!,
  );

  let address = nameOrAddress;
  if (!address.startsWith("0x")) {
    address =
      (import.meta.env[`VITE_${nameOrAddress.toUpperCase()}_ADDRESS`] as string) ||
      "0x0000000000000000000000000000000000000000";
  }

  if (useSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(address, abi, signer);
  }
  return new ethers.Contract(address, abi, provider);
}
