import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ABI from '../abi/TRNUsageOracle.json';

const TRN_USAGE_ORACLE = '0xYourContractAddressHere';

export function useTRNBalance(address: string) {
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    if (!address) return;

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const contract = new ethers.Contract(TRN_USAGE_ORACLE, ABI, provider);

    contract.getAvailableTRN(address).then((res: any) => {
      setBalance(res.toString());
    });
  }, [address]);

  return balance;
}
