<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MovieHub 18+ | Premium Streaming</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        body { background-color: #05070a; color: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .glass { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .movie-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .movie-card:hover { transform: translateY(-8px); }
        .category-pill { transition: all 0.3s; flex: 0 0 auto; }
        .floating-contact { animation: bounce 3s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    </style>
</head>
<body class="pb-24">

    <header class="glass sticky top-0 z-[100] px-4 py-4 text-center">
        <div class="max-w-6xl mx-auto">
            <div class="flex items-center justify-center gap-1 cursor-pointer mb-4" onclick="loadSection('/')">
                <span class="text-3xl font-[800] tracking-tighter text-white italic">Movie<span class="text-red-600">Hub</span></span>
                <div class="bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#05070a] -mt-5 -ml-2 shadow-xl">18+</div>
            </div>
            <div class="relative max-w-md mx-auto">
                <input id="searchInp" type="text" placeholder="Cari judul film..." class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all">
                <i class="fas fa-search absolute right-5 top-3.5 text-gray-500"></i>
            </div>
        </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 mt-8">
        <section class="mb-8">
            <h3 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Hot Discovery</h3>
            <div class="flex gap-2 overflow-x-auto no-scrollbar">
                <button onclick="loadSection('/indonesia')" class="category-pill bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black italic shadow-lg">INDONESIA</button>
                <button onclick="loadSection('/best-rating')" class="category-pill bg-yellow-500 text-black px-6 py-2.5 rounded-xl text-xs font-black italic shadow-lg"><i class="fas fa-star mr-1"></i> BEST RATING</button>
                <button onclick="loadSection('/year-2015')" class="category-pill bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black italic shadow-lg">YEAR 2015</button>
                <button onclick="loadSection('/year-2009')" class="category-pill bg-blue-800 text-white px-6 py-2.5 rounded-xl text-xs font-black italic shadow-lg">YEAR 2009</button>
            </div>
        </section>

        <section class="mb-8 bg-red-950/10 p-4 rounded-3xl border border-red-900/10">
            <h3 class="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3">Adult Collection</h3>
            <div class="flex gap-2 overflow-x-auto no-scrollbar">
                <button onclick="loadSection('/semi-jepang')" class="category-pill bg-gray-900 border border-red-900/30 text-red-400 px-5 py-2.5 rounded-xl text-xs font-bold">Semi Jepang</button>
                <button onclick="loadSection('/semi-philippines')" class="category-pill bg-gray-900 border border-red-900/30 text-red-400 px-5 py-2.5 rounded-xl text-xs font-bold">Semi Philippines</button>
                <button onclick="loadSection('/semi-korea')" class="category-pill bg-gray-900 border border-red-900/30 text-red-400 px-5 py-2.5 rounded-xl text-xs font-bold">Semi Korea</button>
            </div>
        </section>

        <section class="mb-10">
            <h3 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Explore Genres</h3>
            <div class="flex gap-2 overflow-x-auto no-scrollbar">
                <button onclick="loadSection('/mystery')" class="category-pill bg-gray-900 border border-white/5 px-5 py-2.5 rounded-xl text-xs font-bold hover:text-blue-400">Mystery</button>
                <button onclick="loadSection('/crime')" class="category-pill bg-gray-900 border border-white/5 px-5 py-2.5 rounded-xl text-xs font-bold hover:text-blue-400">Crime</button>
                <button onclick="loadSection('/fantasy')" class="category-pill bg-gray-900 border border-white/5 px-5 py-2.5 rounded-xl text-xs font-bold">Fantasy</button>
                <button onclick="loadSection('/romance')" class="category-pill bg-gray-900 border border-white/5 px-5 py-2.5 rounded-xl text-xs font-bold">Romance</button>
                <button onclick="loadSection('/action')" class="category-pill bg-gray-900 border border-white/5 px-5 py-2.5 rounded-xl text-xs font-bold">Action</button>
                <button onclick="loadSection('/drama')" class="category-pill bg-gray-900 border border-white/5 px-5 py-2.5 rounded-xl text-xs font-bold">Drama</button>
                <button onclick="loadSection('/comedy')" class="category-pill bg-gray-900 border border-white/5 px-5 py-2.5 rounded-xl text-xs font-bold">Comedy</button>
            </div>
        </section>

        <h2 id="sectionTitle" class="text-lg font-black text-white italic mb-6 uppercase tracking-tighter">Update Terbaru</h2>
        <div id="movieGrid" class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6"></div>
    </main>

    <a href="https://t.me/Bleszh" target="_blank" class="floating-contact fixed bottom-6 right-6 z-[200] bg-blue-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-4 border-[#05070a]">
        <i class="fab fa-telegram-plane text-2xl"></i>
    </a>

    <div id="playerModal" class="fixed inset-0 z-[1000] bg-black/95 hidden flex flex-col items-center justify-center p-4 backdrop-blur-md">
        <div class="w-full max-w-5xl">
            <div class="flex justify-between items-center mb-4">
                <span id="playingTitle" class="text-[10px] font-bold text-gray-400 truncate w-48 uppercase tracking-widest"></span>
                <button onclick="closePlayer()" class="bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg">TUTUP</button>
            </div>
            <div id="videoContainer" class="aspect-video bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5"></div>
            <p class="text-center text-[9px] text-gray-600 mt-4 font-bold tracking-widest uppercase">Pop-up iklan otomatis diblokir</p>
        </div>
    </div>

    <script>
        const API = 'https://apil.benx.workers.dev';

        async function loadSection(path) {
            const grid = document.getElementById('movieGrid');
            document.getElementById('sectionTitle').innerText = path === '/' ? "Update Terbaru" : path.replace('/', '').replace('-', ' ').toUpperCase();
            grid.innerHTML = '<div class="col-span-full py-20 text-center animate-pulse text-gray-700 font-bold text-[10px] uppercase tracking-widest">Memuat...</div>';
            try {
                const res = await fetch(API + path);
                const json = await res.json();
                renderMovies(json.data);
            } catch (e) { grid.innerHTML = 'Error Server.'; }
        }

        function renderMovies(movies) {
            const grid = document.getElementById('movieGrid');
            grid.innerHTML = '';
            if(!movies || movies.length === 0) {
                grid.innerHTML = '<p class="col-span-full text-center py-20 text-gray-700 italic text-xs">Kosong nih.</p>';
                return;
            }
            movies.forEach(m => {
                grid.innerHTML += `
                    <div class="movie-card cursor-pointer group" onclick="bukaDetail('${m.link}', '${m.title}')">
                        <div class="relative overflow-hidden rounded-[2.2rem] bg-gray-900 aspect-[3/4.2]">
                            <img src="${m.img}" class="w-full h-full object-cover">
                            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-all">
                                <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg"><i class="fas fa-play text-white ml-1"></i></div>
                            </div>
                        </div>
                        <h3 class="mt-3 text-[10px] font-bold text-gray-500 uppercase text-center line-clamp-1 tracking-tighter px-2">${m.title}</h3>
                    </div>`;
            });
        }

        async function bukaDetail(url, title) {
            const modal = document.getElementById('playerModal');
            const container = document.getElementById('videoContainer');
            document.getElementById('playingTitle').innerText = title;
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            container.innerHTML = '<div class="h-full flex items-center justify-center text-[10px] font-bold text-gray-700 animate-bounce">MENGUNCI IKLAN & MENCARI VIDEO...</div>';
            try {
                const res = await fetch(`${API}/detail?url=${encodeURIComponent(url)}`);
                const json = await res.json();
                if(json.streams && json.streams.length > 0) {
                    container.innerHTML = `<iframe src="${json.streams[0]}" class="w-full h-full" frameborder="0" allowfullscreen sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts"></iframe>`;
                } else { container.innerHTML = '<p class="text-xs font-bold text-gray-600 text-center py-20">Link Video Gagal Dimuat.</p>'; }
            } catch (e) { container.innerHTML = 'Error.'; }
        }

        function closePlayer() { document.getElementById('playerModal').classList.add('hidden'); document.getElementById('videoContainer').innerHTML = ''; document.body.style.overflow = 'auto'; }
        document.getElementById('searchInp').addEventListener('keypress', (e) => { if (e.key === 'Enter') loadSection(`/search?q=${e.target.value}`); });
        loadSection('/');
    </script>
</body>
</html>
