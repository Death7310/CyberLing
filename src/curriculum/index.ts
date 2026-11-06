import type { Track, TrackId } from './schema';
import { python } from './tracks/python';
import { c } from './tracks/c';
import { cpp } from './tracks/cpp';
import { csharp } from './tracks/csharp';
import { aws } from './tracks/aws';
import { azure } from './tracks/azure';

/** Order matters: it is the recommended learning sequence (Python → C → C++ → C# → clouds). */
export const tracks: Track[] = [python, c, cpp, csharp, aws, azure];

export function trackById(id: TrackId): Track {
  const t = tracks.find((x) => x.id === id);
  if (!t) throw new Error(`unknown track ${id}`);
  return t;
}
