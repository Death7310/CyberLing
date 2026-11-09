import type { Track, TrackId } from './schema';
import { python } from './tracks/python/index';
import { c } from './tracks/c/index';
import { cpp } from './tracks/cpp/index';
import { csharp } from './tracks/csharp/index';
import { aws } from './tracks/aws/index';
import { azure } from './tracks/azure/index';

/** Order matters: it is the recommended learning sequence (Python → C → C++ → C# → clouds). */
export const tracks: Track[] = [python, c, cpp, csharp, aws, azure];

export function trackById(id: TrackId): Track {
  const t = tracks.find((x) => x.id === id);
  if (!t) throw new Error(`unknown track ${id}`);
  return t;
}
