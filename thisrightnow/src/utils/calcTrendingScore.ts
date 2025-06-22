export function calcTrendingScore({
  retrns,
  boostTRN,
  resonance,
  createdAt,
}: {
  retrns: number;
  boostTRN: number;
  resonance: number;
  createdAt: number; // ms
}): number {
  const ageInHours = (Date.now() - createdAt) / 3600000;
  const decay = Math.pow(1 + ageInHours, 1.25);

  return (
    (retrns * 1 + Math.log(boostTRN + 1) * 2 + resonance * 3) / decay
  );
}
