// ===== PLAYLIST (tracks) =====
// Using royalty-free / test tracks from SoundHelix (free for demo)
const playlist = [
    {
        title: "Sunlit Horizon",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "Electric Dreams",
        artist: "Ambient Rock",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "Coastal Drive",
        artist: "Chillwave",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
];

// DOM elements
const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const songTitleEl = document.getElementById('song-title');
const artistEl = document.getElementById('song-artist');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume');
const playlistContainer = document.getElementById('playlist-items');

let currentTrackIndex = 0;
let isPlaying = false;
let autoplayEnabled = true;  // bonus autoplay after track ends

// load track by index
function loadTrack(index) {
    if (index < 0) index = 0;
    if (index >= playlist.length) index = playlist.length - 1;
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];
    audio.src = track.src;
    songTitleEl.textContent = track.title;
    artistEl.textContent = track.artist;
    // reset progress
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    if (audio.readyState >= 2) {
        durationEl.textContent = formatTime(audio.duration);
    } else {
        durationEl.textContent = '0:00';
    }
    // highlight active playlist item
    updatePlaylistActive();
    if (isPlaying) {
        audio.play().catch(e => console.log("autoplay blocked, user interaction needed"));
    }
}

// format seconds to MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// update progress bar & time
function updateProgress() {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);
    }
}

// seek when clicking on progress bar
function setProgress(e) {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    audio.currentTime = percent * audio.duration;
}

// play / pause
function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        playPauseBtn.textContent = '▶';
    } else {
        audio.play().catch(err => console.warn("play error", err));
        playPauseBtn.textContent = '⏸';
    }
    isPlaying = !isPlaying;
}

// next track
function nextTrack() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        audio.play().catch(e => console.log("autoplay"));
    } else {
        // if paused and user clicks next, automatically start playing (common UX)
        togglePlayPause();
    }
}

// prev track
function prevTrack() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        audio.play().catch(e => console.log(""));
    } else {
        togglePlayPause();
    }
}

// when audio ends -> autoplay next if enabled
function onTrackEnd() {
    if (autoplayEnabled) {
        nextTrack();
    } else {
        isPlaying = false;
        playPauseBtn.textContent = '▶';
    }
}

// render playlist in UI
function renderPlaylist() {
    playlistContainer.innerHTML = '';
    playlist.forEach((track, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${track.title}</span><span style="font-size:0.7rem;">${track.artist}</span>`;
        li.addEventListener('click', () => {
            if (currentTrackIndex !== idx) {
                currentTrackIndex = idx;
                loadTrack(currentTrackIndex);
                if (!isPlaying) togglePlayPause();
                else audio.play();
            }
        });
        playlistContainer.appendChild(li);
    });
    updatePlaylistActive();
}

function updatePlaylistActive() {
    const items = document.querySelectorAll('#playlist-items li');
    items.forEach((item, i) => {
        if (i === currentTrackIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// volume control
function setVolume() {
    audio.volume = volumeSlider.value;
}

// Event listeners
playPauseBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', onTrackEnd);
progressBar.addEventListener('click', setProgress);
volumeSlider.addEventListener('input', setVolume);

// optional: keyboard support
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
    } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextTrack();
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevTrack();
    }
});

// initialize
renderPlaylist();
loadTrack(0);
audio.volume = volumeSlider.value;
// Add little message for autoplay badge
const autoplaySpan = document.getElementById('autoplay-badge');
autoplaySpan.addEventListener('click', () => {
    autoplayEnabled = !autoplayEnabled;
    autoplaySpan.style.opacity = autoplayEnabled ? '1' : '0.6';
    autoplaySpan.title = autoplayEnabled ? 'Autoplay ON' : 'Autoplay OFF';
});
autoplaySpan.style.cursor = 'pointer';