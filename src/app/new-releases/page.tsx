import Link from 'next/link';

export default async function NewReleasesPage() {
  // Fetch top 50 from Apple RSS, then filter to only 2025+ releases
  const res = await fetch('https://itunes.apple.com/us/rss/topalbums/limit=50/json', { next: { revalidate: 3600 } });
  const data = await res.json();
  const allEntries = data.feed.entry || [];
  
  // Filter: only show albums released in 2025 or 2026
  const recentEntries = allEntries.filter((item: any) => {
    const releaseDate = item['im:releaseDate']?.label;
    if (!releaseDate) return false;
    const year = parseInt(releaseDate.substring(0, 4));
    return year >= 2025;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 mt-4">
      <h1 className="text-4xl font-bold mb-2">New Releases</h1>
      <p className="text-zinc-400 mb-8">Recently released albums currently trending on the charts.</p>
      
      {recentEntries.length === 0 ? (
        <p className="text-zinc-500 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 text-center">No new releases found at the moment.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recentEntries.map((item: any) => {
            const id = item.id.attributes['im:id'];
            const title = item['im:name'].label;
            const artist = item['im:artist'].label;
            const releaseYear = item['im:releaseDate']?.label?.substring(0, 4);
            // Get highest resolution image
            const images = item['im:image'] || [];
            const coverUrl = images.length > 0 
              ? images[images.length - 1].label.replace(/\/\d+x\d+/, '/600x600')
              : "https://placehold.co/400x400/18181b/3f3f46?text=No+Cover";

            return (
              <Link href={`/album/${id}`} key={id} className="group flex flex-col gap-3">
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 aspect-square shadow-lg">
                  <img 
                    src={coverUrl} 
                    alt={title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition truncate">{title}</h3>
                  <p className="text-sm text-zinc-400 truncate">{artist} • {releaseYear}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
