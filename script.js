document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const audio = new Audio();
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeBar = document.getElementById('volume-bar');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    const songList = document.getElementById('song-list');
    const songs = Array.from(songList.children);
    const cdPlayer = document.querySelector('.cd-player');
    
    // Player state
    let currentSongIndex = 0;
    let isPlaying = false;
    
    // Initialize player
    initPlayer();
    
    function initPlayer() {
        // Set initial volume
        audio.volume = volumeBar.value / 100;
        
        // Load first song
        loadSong(currentSongIndex);
        
        // Event listeners
        playBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', prevSong);
        nextBtn.addEventListener('click', nextSong);
        
        progressBar.addEventListener('input', setProgress);
        volumeBar.addEventListener('input', setVolume);
        
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', nextSong);
        audio.addEventListener('loadedmetadata', updateDuration);
        
        songList.addEventListener('click', playSelectedSong);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }
    
    function loadSong(index) {
        const song = songs[index];
        const songSrc = song.getAttribute('data-src');
        const songTitleText = song.getAttribute('data-title');
        const songArtistText = song.getAttribute('data-artist');
        const songDuration = song.getAttribute('data-duration');
        
        audio.src = songSrc;
        songTitle.textContent = songTitleText;
        songArtist.textContent = songArtistText;
        totalTimeDisplay.textContent = songDuration;
        
        // Update active song in playlist
        songs.forEach(item => item.classList.remove('active'));
        song.classList.add('active');
        
        // Scroll to active song in playlist
        song.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // If player was playing, continue playing
        if (isPlaying) {
            audio.play()
                .then(() => {
                    cdPlayer.classList.add('playing');
                })
                .catch(error => {
                    console.error('Playback failed:', error);
                    isPlaying = false;
                    updatePlayButton();
                });
        }
    }
    
    function togglePlay() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }
    
    function playSong() {
        isPlaying = true;
        updatePlayButton();
        cdPlayer.classList.add('playing');
        
        audio.play()
            .catch(error => {
                console.error('Playback failed:', error);
                isPlaying = false;
                updatePlayButton();
            });
    }
    
    function pauseSong() {
        isPlaying = false;
        updatePlayButton();
        cdPlayer.classList.remove('playing');
        audio.pause();
    }
    
    function updatePlayButton() {
        playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
    
    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
    }
    
    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
    }
    
    function updateProgress() {
        const { currentTime, duration } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.value = progressPercent;
        
        // Update current time display
        const currentMinutes = Math.floor(currentTime / 60);
        const currentSeconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
        currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds}`;
    }
    
    function updateDuration() {
        const duration = audio.duration;
        const durationMinutes = Math.floor(duration / 60);
        const durationSeconds = Math.floor(duration % 60).toString().padStart(2, '0');
        totalTimeDisplay.textContent = `${durationMinutes}:${durationSeconds}`;
    }
    
    function setProgress() {
        const duration = audio.duration;
        const seekTime = (duration * this.value) / 100;
        audio.currentTime = seekTime;
    }
    
    function setVolume() {
        const volume = this.value / 100;
        audio.volume = volume;
        
        // Update volume icon
        const volumeIcon = document.querySelector('.volume-control i');
        if (volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }
    
    function playSelectedSong(e) {
        const li = e.target.closest('li');
        if (!li) return;
        
        const index = songs.indexOf(li);
        if (index !== -1) {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            playSong();
        }
    }
    
    function handleKeyboardShortcuts(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                audio.currentTime = Math.max(0, audio.currentTime - 5);
                break;
            case 'ArrowRight':
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
                break;
            case 'MediaTrackPrevious':
            case 'KeyP':
                prevSong();
                break;
            case 'MediaTrackNext':
            case 'KeyN':
                nextSong();
                break;
        }
    }
});