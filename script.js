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

    // 3. Galería de Imágenes a Pantalla Completa
    (function () {
        const albumImages = document.querySelectorAll('.album-img');
        const modalImage = document.getElementById('modalImage');
        const imageModalEl = document.getElementById('imageModal');
        const imageModal = new bootstrap.Modal(imageModalEl);

        albumImages.forEach((img) => {
            img.addEventListener('click', function () {
                modalImage.src = this.src;
                modalImage.alt = this.alt || 'Foto ampliada';
                imageModal.show();
            });
        });
    })();

    // ================================
    // 4. Efecto de hojas cayendo
    // ================================
    ; (function () {
        // ————— EDITABLE VARS —————
        const MAX_LEAVES = 15;    // Máximo de hojas en pantalla
        const SPAWN_INTERVAL_MS = 1500; // Cada cuántos ms aparece una nueva hoja
        const VX_RANGE = [0.2, 1.2]; // [min, max] velocidad horizontal
        const VY_RANGE = [0.5, 2.5]; // [min, max] velocidad vertical
        // ————————————————————————

        // Detección de móvil (≤400px) para tamaño 50%
        const isMobile = window.matchMedia('(max-width: 400px)').matches;

        // Creamos el canvas y lo adjuntamos
        const canvas = document.createElement('canvas');
        canvas.id = 'leafCanvas';
        Object.assign(canvas.style, {
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 2000,
        });
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let W, H;
        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        // Carga de la imagen
        const leafImg = new Image();
        leafImg.src = 'data/particles.png'; // ajusta ruta si hiciera falta

        // Clase Leaf
        class Leaf {
            constructor() { this.reset(); }
            reset() {
                // Reaparecen en X aleatoria a lo largo del ancho, y encima de la pantalla
                this.x = Math.random() * W;
                this.y = -Math.random() * 100;

                // Tamaño base y reducción en móvil
                const baseSize = 20 + Math.random() * 40;
                this.size = isMobile ? baseSize * 0.5 : baseSize;

                // Velocidades muy variables
                this.vx = VX_RANGE[0] + Math.random() * (VX_RANGE[1] - VX_RANGE[0]);
                this.vy = VY_RANGE[0] + Math.random() * (VY_RANGE[1] - VY_RANGE[0]);

                // Rotación
                this.rot = Math.random() * Math.PI * 2;
                this.vr = (Math.random() - 0.5) * 0.1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.rot += this.vr;
                // Si sale de pantalla, reseteamos
                if (this.y > H + this.size || this.x > W + this.size) {
                    this.reset();
                }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rot);
                ctx.drawImage(
                    leafImg,
                    -this.size / 2,
                    -this.size / 2,
                    this.size,
                    this.size
                );
                ctx.restore();
            }
        }

        // Array de hojas y función de spawn
        const leaves = [];
        function spawnLeaf() {
            if (leaves.length < MAX_LEAVES) {
                leaves.push(new Leaf());
            }
        }

        // Spawn inicial y spawn periódico
        spawnLeaf();
        setInterval(spawnLeaf, SPAWN_INTERVAL_MS);

        // Loop de animación
        function animate() {
            ctx.clearRect(0, 0, W, H);
            for (const leaf of leaves) {
                leaf.update();
                leaf.draw();
            }
            requestAnimationFrame(animate);
        }

        // Arranca al cargar la imagen
        leafImg.onload = animate;
    })();


})();
