export const fetchItunes = async (url: string) => {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    return { error: true, message: "Failed to parse API response" };
  }
};

export const getAlbum = async (id: string | number) => {
  const data = await fetchItunes(`https://itunes.apple.com/lookup?id=${id}`);
  if (!data || !data.results || data.results.length === 0) return { error: true, message: "Not found" };
  const album = data.results[0];
  album.cover_xl = album.artworkUrl100?.replace('100x100bb', '1000x1000bb');
  return album;
};

export const getAlbumWithTracks = async (id: string | number) => {
  const data = await fetchItunes(`https://itunes.apple.com/lookup?id=${id}&entity=song`);
  if (!data || !data.results || data.results.length === 0) return { error: true, message: "Not found" };
  
  const album = data.results[0];
  album.cover_xl = album.artworkUrl100?.replace('100x100bb', '1000x1000bb');
  
  const tracks = data.results
    .slice(1)
    .filter((t: any) => t.wrapperType === 'track')
    .sort((a: any, b: any) => a.trackNumber - b.trackNumber);
  
  return { album, tracks };
};

export const getArtist = async (id: string | number) => {
  const data = await fetchItunes(`https://itunes.apple.com/lookup?id=${id}&entity=album&limit=200`);
  if (!data || !data.results || data.results.length === 0) return { error: true, message: "Not found" };
  const artist = data.results[0];
  const albums = data.results.slice(1).filter((a: any) => a.wrapperType === 'collection').map((album: any) => ({
    ...album,
    cover_xl: album.artworkUrl100?.replace('100x100bb', '600x600bb')
  }));
  return { artist, albums };
};

export const getTrack = async (id: string | number) => {
  const data = await fetchItunes(`https://itunes.apple.com/lookup?id=${id}`);
  if (!data || !data.results || data.results.length === 0) return { error: true, message: "Not found" };
  const track = data.results[0];
  track.cover_xl = track.artworkUrl100?.replace('100x100bb', '1000x1000bb');
  return track;
};

export const searchAlbums = async (query: string) => {
  return fetchItunes(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=10`);
};

export const searchArtists = async (query: string) => {
  return fetchItunes(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=allArtist&limit=8`);
};

export const searchSongs = async (query: string) => {
  return fetchItunes(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`);
};

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
