// ================================
// 1. Countdown Timer (sin cambios)
// ================================
(function () {
  const targetDate = new Date('October 31, 2025 00:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }

  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();
})();

// ================================
// 2. Music HUD: Play/Pause & Progreso (con autoplay forzado)
// ================================
(function () {
  const audio = document.getElementById('weddingSong');
  const btn = document.getElementById('audioToggle');
  const icon = document.getElementById('audioIcon');
  const progressFill = document.getElementById('progressFill');
  const thumb = document.getElementById('thumb');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('durationTime');
  let isPlaying = false;

  // Formatea segundos como m:ss
  function formatTime(sec) {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Cuando se cargan metadatos (duración)
  audio.addEventListener('loadedmetadata', function () {
    if (!isNaN(audio.duration)) {
      durationEl.textContent = formatTime(audio.duration);

      // Intentar reproducir automáticamente
      audio.play()
        .then(() => {
          // Si logra reproducirse, actualizar el estado y el ícono
          isPlaying = true;
          icon.classList.remove('bi-play-fill');
          icon.classList.add('bi-pause-fill');
        })
        .catch(() => {
          // Si el navegador bloquea autoplay, no hacemos nada. 
          // El usuario podrá darle al botón manualmente.
        });
    }
  });

  // Actualiza barra de progreso y tiempo actual
  audio.addEventListener('timeupdate', function () {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${percent}%`;
    thumb.style.left = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  function toggleAudio() {
    if (isPlaying) {
      audio.pause();
      icon.classList.remove('bi-pause-fill');
      icon.classList.add('bi-play-fill');
    } else {
      audio.play();
      icon.classList.remove('bi-play-fill');
      icon.classList.add('bi-pause-fill');
    }
    isPlaying = !isPlaying;
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    toggleAudio();
  });

  audio.addEventListener('pause', () => {
    isPlaying = false;
    icon.classList.remove('bi-pause-fill');
    icon.classList.add('bi-play-fill');
  });
  audio.addEventListener('play', () => {
    isPlaying = true;
    icon.classList.remove('bi-play-fill');
    icon.classList.add('bi-pause-fill');
  });

  // Como refuerzo, forzamos otro play() al cargar la página
  window.addEventListener('load', () => {
    audio.play()
      .then(() => {
        // Si logra reproducirse tras el load, actualizar el estado y el ícono
        isPlaying = true;
        icon.classList.remove('bi-play-fill');
        icon.classList.add('bi-pause-fill');
      })
      .catch(() => {
        // Si aún así el navegador lo bloquea, no hacemos nada
      });
  });
})();
