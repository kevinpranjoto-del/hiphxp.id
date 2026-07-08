import { PrismaClient, EventCategory, ArticleStatus, DirectoryStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── 1. ROLES ─────────────────────────────────────────────────────────────
  const roleNames = ['MUSICIAN', 'ADMIN', 'EDITOR', 'WRITER', 'SUPER_ADMIN'] as const;
  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    });
  }
  console.log('✅ Roles seeded');

  // ─── 2. GENRES ────────────────────────────────────────────────────────────
  const genreData = [
    { name: 'Hip-Hop', slug: 'hip-hop' },
    { name: 'R&B', slug: 'rnb' },
    { name: 'Trap', slug: 'trap' },
    { name: 'Boom Bap', slug: 'boom-bap' },
    { name: 'Neo Soul', slug: 'neo-soul' },
  ];
  const genres: Record<string, string> = {};
  for (const g of genreData) {
    const genre = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
    genres[g.slug] = genre.id;
  }
  console.log('✅ Genres seeded');

  // ─── 3. DEFAULT ARTISTS / MUSISI ──────────────────────────────────────────
  const artistData = [
    {
      name: 'Yung Kota',
      slug: 'yung-kota',
      real_name: 'Kevin Pratama',
      bio: 'Rapper dari Jakarta dengan gaya naratif yang kuat. Dikenal dengan lirik lo-fi tentang kehidupan kota.',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      genre_slug: 'boom-bap',
      instagram: '@yungkota',
      spotify: 'https://open.spotify.com/artist/placeholder-yungkota',
      is_verified: true,
    },
    {
      name: 'Terminal Rhymes Crew',
      slug: 'terminal-rhymes-crew',
      real_name: 'Kolektif',
      bio: 'Kolektif rap battle dan open mic dari Bandung. Penyelenggara cypher bulanan di berbagai venue.',
      city: 'Bandung',
      province: 'Jawa Barat',
      genre_slug: 'hip-hop',
      instagram: '@terminalrhymes',
      spotify: 'https://open.spotify.com/artist/placeholder-terminal',
      is_verified: true,
    },
    {
      name: 'Sudut Senja',
      slug: 'sudut-senja',
      real_name: 'Rahel Indah',
      bio: 'Penyanyi R&B dan Neo Soul dari Jogja. Kolaborasi dengan berbagai produser lokal.',
      city: 'Jogja',
      province: 'DI Yogyakarta',
      genre_slug: 'neo-soul',
      instagram: '@sudut_senja',
      spotify: 'https://open.spotify.com/artist/placeholder-sudut',
      is_verified: true,
    },
    {
      name: 'Pesisir Beats',
      slug: 'pesisir-beats',
      real_name: 'Ahmad Fauzi',
      bio: 'Produser beat trap dan boom bap dari Surabaya. Sudah merilis puluhan beat untuk rapper indie Indonesia.',
      city: 'Surabaya',
      province: 'Jawa Timur',
      genre_slug: 'trap',
      instagram: '@pesisirbeats',
      spotify: 'https://open.spotify.com/artist/placeholder-pesisir',
      is_verified: false,
    },
  ];

  const artistIds: Record<string, string> = {};
  for (const a of artistData) {
    const { genre_slug, ...rest } = a;
    const artist = await prisma.artist.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        ...rest,
        genre_id: genres[genre_slug] || null,
      },
    });
    artistIds[a.slug] = artist.id;
  }
  console.log('✅ Artists seeded');

  // ─── 4. SONGS ─────────────────────────────────────────────────────────────
  const songData = [
    {
      title: 'Malam Bising',
      slug: 'malam-bising',
      artist_slug: 'yung-kota',
      genre_slug: 'boom-bap',
      cover_image: null,
      audio_url: null,
      release_date: new Date('2026-06-20'),
    },
    {
      title: 'Beton & Bara',
      slug: 'beton-dan-bara',
      artist_slug: 'yung-kota',
      genre_slug: 'boom-bap',
      cover_image: null,
      audio_url: null,
      release_date: new Date('2026-07-01'),
    },
    {
      title: 'Senja di Malioboro',
      slug: 'senja-di-malioboro',
      artist_slug: 'sudut-senja',
      genre_slug: 'neo-soul',
      cover_image: null,
      audio_url: null,
      release_date: new Date('2026-06-15'),
    },
    {
      title: 'Pesisir Anthem',
      slug: 'pesisir-anthem',
      artist_slug: 'pesisir-beats',
      genre_slug: 'trap',
      cover_image: null,
      audio_url: null,
      release_date: new Date('2026-05-30'),
    },
  ];

  for (const s of songData) {
    const { artist_slug, genre_slug, ...rest } = s;
    await prisma.song.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        ...rest,
        artist_id: artistIds[artist_slug],
        genre_id: genres[genre_slug] || null,
      },
    });
  }
  console.log('✅ Songs seeded');

  // ─── 5. COLLECTIVES (Community Hub) ───────────────────────────────────────
  const collectiveData = [
    {
      name: 'Sudut Kota Records',
      slug: 'sudut-kota-records',
      description: 'Label independen fokus rap naratif dan produksi lo-fi.',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      instagram: '@sudut_kota',
      status: 'ACTIVE' as DirectoryStatus,
      is_verified: true,
    },
    {
      name: 'Terminal Rhymes',
      slug: 'terminal-rhymes',
      description: 'Kolektif penyelenggara rap battle dan open mic bulanan.',
      city: 'Bandung',
      province: 'Jawa Barat',
      instagram: '@terminalrhymes',
      status: 'ACTIVE' as DirectoryStatus,
      is_verified: true,
    },
    {
      name: 'Sudut Senja Records',
      slug: 'sudut-senja-records',
      description: 'Rumah produksi untuk musisi R&B dan neo soul lokal.',
      city: 'Jogja',
      province: 'DI Yogyakarta',
      instagram: '@sudut_senja_rec',
      status: 'ACTIVE' as DirectoryStatus,
      is_verified: true,
    },
    {
      name: 'Pesisir Beatmakers',
      slug: 'pesisir-beatmakers',
      description: 'Kumpulan produser beat trap dan boom bap generasi baru.',
      city: 'Surabaya',
      province: 'Jawa Timur',
      instagram: '@pesisirbeats',
      status: 'ACTIVE' as DirectoryStatus,
      is_verified: false,
    },
    {
      name: 'Kolektif Bebas Dinding',
      slug: 'kolektif-bebas-dinding',
      description: 'Komunitas mural dan seni jalanan berbasis di Jogja.',
      city: 'Jogja',
      province: 'DI Yogyakarta',
      instagram: '@bebasdinding',
      status: 'ACTIVE' as DirectoryStatus,
      is_verified: false,
    },
  ];

  for (const c of collectiveData) {
    await prisma.collective.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log('✅ Collectives seeded');

  // ─── 6. EVENTS ────────────────────────────────────────────────────────────
  const eventData = [
    {
      name: 'Rap Battle Terminal',
      slug: 'rap-battle-terminal-2026-07',
      venue: 'Terminal Rhymes HQ',
      organizer: 'Terminal Rhymes',
      city: 'Bandung',
      province: 'Jawa Barat',
      category: 'RAP_BATTLE' as EventCategory,
      event_date: new Date('2026-07-12T19:00:00Z'),
      event_time: '19:00 WIB',
      status: 'PUBLISHED' as ArticleStatus,
      featured: true,
    },
    {
      name: 'Malam Cypher Sudut Kota',
      slug: 'malam-cypher-sudut-kota-2026-07',
      venue: 'Sudut Kota Records Studio',
      organizer: 'Sudut Kota Records',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      category: 'GIG' as EventCategory,
      event_date: new Date('2026-07-15T20:00:00Z'),
      event_time: '20:00 WIB',
      status: 'PUBLISHED' as ArticleStatus,
      featured: false,
    },
    {
      name: 'Festival Mural Tembok Cerita',
      slug: 'festival-mural-tembok-cerita-2026-07',
      venue: 'Jalan Prawirotaman, Jogja',
      organizer: 'Kolektif Bebas Dinding',
      city: 'Jogja',
      province: 'DI Yogyakarta',
      category: 'STREET_EVENT' as EventCategory,
      event_date: new Date('2026-07-21T10:00:00Z'),
      event_time: '10:00 WIB',
      status: 'PUBLISHED' as ArticleStatus,
      featured: false,
    },
    {
      name: 'Beatmaker Showcase',
      slug: 'beatmaker-showcase-2026-07',
      venue: 'Pesisir Studio, Surabaya',
      organizer: 'Pesisir Beatmakers',
      city: 'Surabaya',
      province: 'Jawa Timur',
      category: 'FESTIVAL' as EventCategory,
      event_date: new Date('2026-07-27T18:00:00Z'),
      event_time: '18:00 WIB',
      status: 'PUBLISHED' as ArticleStatus,
      featured: false,
    },
  ];

  for (const e of eventData) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: {},
      create: e,
    });
  }
  console.log('✅ Events seeded');

  // ─── 7. SONGS MEANINGS ────────────────────────────────────────────────────
  const songBara = await prisma.song.findFirst({ where: { slug: 'beton-dan-bara' } });
  if (songBara) {
    await prisma.songMeaning.upsert({
      where: { song_id: songBara.id },
      update: {},
      create: {
        song_id: songBara.id,
        content: 'Lagu "Beton & Bara" menceritakan perjuangan keras masyarakat kelas pekerja di wilayah suburban Jakarta. Beton merepresentasikan kerasnya infrastruktur kota, sedangkan Bara adalah api semangat bertahan hidup yang tidak pernah padam di tengah keterbatasan ekonomi.',
      }
    });
  }
  console.log('✅ Song Meanings seeded');

  // ─── 8. MUSIC REVIEWS ─────────────────────────────────────────────────────
  await prisma.musicReview.upsert({
    where: { slug: 'beton-dan-bara-review' },
    update: {},
    create: {
      title: '"Beton & Bara" — Suara Baru dari Pinggiran Kota',
      slug: 'beton-dan-bara-review',
      content: 'EP terbaru "Beton & Bara" dari Yung Kota membawa produksi lo-fi yang mentah dan lirik yang berbicara langsung soal hidup di pinggiran ibu kota. Setiap track terasa seperti catatan harian yang direkam di kamar sempit — jujur, kasar, tanpa polesan berlebih.\n\nBagian paling kuat ada di pertengahan EP, ketika beat melambat dan ruang diberikan sepenuhnya pada penceritaan. Yung Kota membuktikan dirinya sebagai salah satu penulis lirik paling tajam di generasinya.',
      rating: 8.5,
      artist_id: artistIds['yung-kota'],
    }
  });
  console.log('✅ Music Reviews seeded');

  // ─── 9. RELEASE RADAR ─────────────────────────────────────────────────────
  const radars = [
    { title: 'Senja di Malioboro', slug: 'senja-di-malioboro-radar', content: 'Rilisan terbaru dari Sudut Senja yang mengawinkan vokal R&B lembut dengan alunan neo-soul khas Yogyakarta.', artist_id: artistIds['sudut-senja'] },
    { title: 'Pesisir Anthem', slug: 'pesisir-anthem-radar', content: 'Lagu trap bertenaga tinggi yang diproduseri oleh Pesisir Beats dengan rima tajam tentang kehidupan pesisir Surabaya.', artist_id: artistIds['pesisir-beats'] },
  ];
  for (const r of radars) {
    await prisma.releaseRadar.upsert({
      where: { slug: r.slug },
      update: {},
      create: r
    });
  }
  console.log('✅ Release Radar seeded');

  // ─── 10. LIFESTYLE POSTS ──────────────────────────────────────────────────
  await prisma.streetwearPost.upsert({
    where: { slug: 'gaya-lokal-standar-global' },
    update: {},
    create: {
      title: 'Gaya Lokal, Standar Global',
      slug: 'gaya-lokal-standar-global',
      content: 'Streetwear lokal kini sedang mendominasi skena fashion anak muda. Dengan menggabungkan elemen grafis khas hip-hop dan material berkualitas tinggi, brand-brand lokal membuktikan bahwa karya dalam negeri mampu bersaing dengan raksasa global. Dari panggung gigs hingga sudut jalanan kota, gaya ini mendefinisikan ekspresi diri tanpa batas.',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      status: 'PUBLISHED',
    }
  });
  await prisma.graffitiPost.upsert({
    where: { slug: 'tembok-bicara' },
    update: {},
    create: {
      title: 'Tembok Bicara',
      slug: 'tembok-bicara',
      content: 'Graffiti bukan sekadar coretan vandal, melainkan media protes dan ekspresi visual yang menghidupkan tembok-tembok beton kota yang mati. Melalui kolaborasi antar seniman jalanan, kini mural dan graffiti menjadi galeri terbuka yang merekam denyut nadi dan suara kolektif warga kota.',
      city: 'Bandung',
      province: 'Jawa Barat',
      status: 'PUBLISHED',
    }
  });
  await prisma.dancePost.upsert({
    where: { slug: 'gerak-jalanan' },
    update: {},
    create: {
      title: 'Gerak Jalanan',
      slug: 'gerak-jalanan',
      content: 'Skena breakdance dan street dance urban terus berkembang pesat. Melalui cypher bulanan dan battle breaking yang kompetitif, para b-boy dan b-girl lokal tidak hanya melatih ketangkasan fisik, tetapi juga mempererat solidaritas komunitas tari jalanan di Indonesia.',
      city: 'Surabaya',
      province: 'Jawa Timur',
      status: 'PUBLISHED',
    }
  });
  console.log('✅ Lifestyle posts seeded');

  // ─── 11. EDITORIALS / FEATURES ────────────────────────────────────────────
  await prisma.interview.upsert({
    where: { slug: 'saya-nggak-nulis-buat-trending' },
    update: {},
    create: {
      title: '"Saya nggak nulis buat trending. Saya nulis biar 10 tahun lagi masih relevan."',
      slug: 'saya-nggak-nulis-buat-trending',
      content: 'Dalam wawancara eksklusif kali ini, kami duduk bersama produser dan penulis lagu veteran yang telah 12 tahun konsisten membentuk lanskap musik independen. Soal proses kreatif, kegagalan, dan alasan mengapa dia memilih untuk tetap independen meskipun banyak tawaran label besar menghampiri.\n\n"Bagi saya, musik adalah artefak waktu. Jika Anda menulis hanya untuk trending di media sosial hari ini, maka karya Anda akan mati besok. Tulislah sesuatu yang jujur, sesuatu yang merekam apa yang benar-benar terjadi di sekitar Anda," ujarnya.',
      status: 'PUBLISHED',
    }
  });
  console.log('✅ Editorial Interviews seeded');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
