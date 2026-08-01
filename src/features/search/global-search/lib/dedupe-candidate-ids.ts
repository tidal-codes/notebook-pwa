
interface FlexFieldResult {
  field: string;
  result: Array<string | number>;
}

export function dedupeCandidateIds(fieldResults: FlexFieldResult[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const fieldResult of fieldResults) {
    for (const id of fieldResult.result) {
      const stringId = String(id);
      if (!seen.has(stringId)) {
        seen.add(stringId);
        ordered.push(stringId);
      }
    }
  }

  return ordered;
}
