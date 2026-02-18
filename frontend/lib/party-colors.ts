export const PARTY_COLORS: Record<string, string> = {
  C: "bg-blue-600",
  L: "bg-red-600",
  LD: "bg-amber-500",
  UKIP: "bg-purple-600",
  G: "bg-green-600",
  Ind: "bg-slate-500",
  SNP: "bg-yellow-500",
};

export function getPartyColor(partyCode: string): string {
  return PARTY_COLORS[partyCode] ?? "bg-zinc-500";
}
