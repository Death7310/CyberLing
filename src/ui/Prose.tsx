import { parseBlocks, parseInline } from '../learning/markdown';

export function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((p, i) =>
        p.t === 'code' ? <code key={i}>{p.v}</code> : p.t === 'bold' ? <strong key={i}>{p.v}</strong> : <span key={i}>{p.v}</span>,
      )}
    </>
  );
}

export function Prose({ body }: { body: string }) {
  return (
    <div className="prose">
      {parseBlocks(body).map((b, i) => {
        if (b.type === 'code') return <pre key={i}>{b.text}</pre>;
        if (b.type === 'ul') return <ul key={i}>{b.items!.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ul>;
        return <p key={i}><Inline text={b.text!} /></p>;
      })}
    </div>
  );
}
