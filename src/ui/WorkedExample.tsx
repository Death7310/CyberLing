import type { CodeSample } from '../curriculum/schema';

/** Renders code in chunks, each with its subgoal label beside it. */
export function WorkedExample({ sample }: { sample: CodeSample }) {
  const lines = sample.source.split('\n');
  if (!sample.labels?.length) return <pre>{sample.source}</pre>;
  const chunks: { code: string; label?: string }[] = [];
  let cursor = 1;
  const sorted = [...sample.labels].sort((a, b) => a.lines[0] - b.lines[0]);
  for (const lab of sorted) {
    if (lab.lines[0] > cursor) chunks.push({ code: lines.slice(cursor - 1, lab.lines[0] - 1).join('\n') });
    chunks.push({ code: lines.slice(lab.lines[0] - 1, lab.lines[1]).join('\n'), label: lab.label });
    cursor = lab.lines[1] + 1;
  }
  if (cursor <= lines.length) chunks.push({ code: lines.slice(cursor - 1).join('\n') });
  return (
    <div className="example">
      {chunks.filter((c) => c.label || c.code.trim()).map((c, i) => (
        <div className="chunk" key={i}>
          <pre>{c.code}</pre>
          {c.label && <div className="label">{c.label}</div>}
        </div>
      ))}
    </div>
  );
}
