import React, { useState, useEffect, useRef } from 'react';
import './Portofolio.css';

export default function App() {
  const [profileImg, setProfileImg] = useState(
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23151B45'/%3E%3Ccircle cx='100' cy='78' r='36' fill='%238F7BFF'/%3E%3Cpath d='M30 200c0-44 31-72 70-72s70 28 70 72z' fill='%238F7BFF'/%3E%3C/svg%3E"
  );
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const barRefs = useRef([]);

  // Load foto profil dari localStorage saat pertama kali render
  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem('febie-foto');
      if (savedPhoto) setProfileImg(savedPhoto);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Inisialisasi Canvas Particle Network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mouse = { x: -999, y: -999 };
    let W, H, D;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const getAccentColor = () => {
      return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#8F7BFF';
    };

    const handleResize = () => {
      D = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * D;
      canvas.height = H * D;
      ctx.setTransform(D, 0, 0, D, 0, 0);

      const count = Math.min(110, Math.floor((W * H) / 9000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35
        });
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      const color = getAccentColor();
      ctx.fillStyle = color;
      ctx.strokeStyle = color;

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        if (!isReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;

          let dx = p.x - mouse.x;
          let dy = p.y - mouse.y;
          let dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < 130) {
            p.x += (dx / dist) * 1.6;
            p.y += (dy / dist) * 1.6;
          }
        }

        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          let q = particles[j];
          let len = Math.hypot(p.x - q.x, p.y - q.y);
          if (len < 120) {
            ctx.globalAlpha = (1 - len / 120) * 0.35;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove);

    handleResize();
    tick();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Intersection Observer untuk animasi progress bar keahlian
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.w + '%';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    barRefs.current.forEach((bar) => {
      if (bar) observer.observe(bar);
    });

    return () => observer.disconnect();
  }, []);

  // Handle Spotlight Hover pada Card Proyek
  const handleCardPointerMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  // Handle Unggah & Kompres Foto Profil
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = () => {
        const size = 480;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const minDim = Math.min(img.width, img.height);
        
        canvas.getContext('2d').drawImage(
          img,
          (img.width - minDim) / 2,
          (img.height - minDim) / 2,
          minDim,
          minDim,
          0,
          0,
          size,
          size
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProfileImg(dataUrl);
        try {
          localStorage.setItem('febie-foto', dataUrl);
        } catch (err) {
          console.error(err);
        }
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="portfolio-app">
      {/* Navbar */}
      <nav>
        <div className="wrap">
          <a className="logo" href="#hero">RIFQII.DEV</a>
          <ul>
            <li><a href="#proyek">Proyek</a></li>
            <li><a href="#keahlian">Keahlian</a></li>
            <li><a href="#kontak">Kontak</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="hero">
        <canvas ref={canvasRef} id="net" aria-hidden="true"></canvas>
        <div className="wrap hero-grid">
          <div>
            <span className="status"><i></i>Terbuka untuk proyek baru</span>
            <h1>Febie Rifqi Fardani</h1>
            <p className="lead">
              Saya merancang dan membangun produk digital yang cepat, rapi, dan terasa seperti dari masa depan. Developer full-stack dan desainer antarmuka di Subang.
            </p>
            <div className="btns">
              <a className="btn main" href="#proyek">Lihat proyek</a>
              <a className="btn" href="#kontak">Hubungi saya</a>
            </div>
          </div>
          
          <label className="photo" title="Klik untuk mengganti foto">
            <img src={profileImg} alt="Foto profil Febie Rifqi Fardani" />
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              aria-label="Unggah foto profil" 
            />
            <em>Ganti foto</em>
          </label>
        </div>
      </header>

      {/* Proyek Section */}
      <section id="proyek">
        <div className="wrap">
          <h2>Proyek pilihan</h2>
          <p className="sub">Empat karya terbaru, dari dasbor data sampai aplikasi mobile. Ganti isinya dengan proyek Anda sendiri.</p>
          <div className="grid">
            <article className="card" onPointerMove={handleCardPointerMove}>
              <div className="thumb t1"></div>
              <div className="body">
                <h3>Nebula Analytics</h3>
                <p>Dasbor analitik real-time untuk tim logistik, memproses 2 juta event per hari.</p>
                <div className="tags"><span>React</span><span>Node.js</span><span>WebSocket</span></div>
              </div>
            </article>

            <article className="card" onPointerMove={handleCardPointerMove}>
              <div className="thumb t2"></div>
              <div className="body">
                <h3>Orbit Pay</h3>
                <p>Aplikasi dompet digital dengan pembayaran QRIS dan onboarding kurang dari satu menit.</p>
                <div className="tags"><span>Flutter</span><span>Firebase</span><span>UI/UX</span></div>
              </div>
            </article>

            <article className="card" onPointerMove={handleCardPointerMove}>
              <div className="thumb t3"></div>
              <div className="body">
                <h3>Quantum Store</h3>
                <p>Toko online headless dengan skor Lighthouse 98 dan checkout satu halaman.</p>
                <div className="tags"><span>Next.js</span><span>Stripe</span><span>Tailwind</span></div>
              </div>
            </article>

            <article className="card" onPointerMove={handleCardPointerMove}>
              <div className="thumb t4"></div>
              <div className="body">
                <h3>Sinyal AI</h3>
                <p>Asisten ringkasan dokumen berbahasa Indonesia untuk tim hukum dan keuangan.</p>
                <div className="tags"><span>Python</span><span>LLM</span><span>FastAPI</span></div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Keahlian & Perjalanan */}
      <section id="keahlian">
        <div className="wrap split">
          <div>
            <h2>Keahlian</h2>
            <p className="sub">Teknologi yang saya pakai setiap hari.</p>
            <div className="bars">
              <div className="bar">
                <b><span>Frontend (React, Next.js)</span><span>95%</span></b>
                <div><i ref={(el) => { barRefs.current[0] = el; }} data-w="95"></i></div>
              </div>
              <div className="bar">
                <b><span>Backend (Node.js, Python)</span><span>88%</span></b>
                <div><i ref={(el) => { barRefs.current[1] = el; }} data-w="88"></i></div>
              </div>
              <div className="bar">
                <b><span>Desain UI/UX (Figma)</span><span>90%</span></b>
                <div><i ref={(el) => { barRefs.current[2] = el; }} data-w="90"></i></div>
              </div>
              <div className="bar">
                <b><span>Cloud dan DevOps</span><span>78%</span></b>
                <div><i ref={(el) => { barRefs.current[3] = el; }} data-w="78"></i></div>
              </div>
            </div>
          </div>
          
          <div>
            <h2>Perjalanan</h2>
            <p className="sub">Urutan karier sejauh ini.</p>
            <ol className="tl">
              <li>
                <small>2023 – 2024</small>
                <h3>Security Cyber, Neo Soho</h3>
                <p>Memimpin tim keamanan siber untuk mengidentifikasi dan menangani ancaman keamanan.</p>
              </li>
              <li>
                <small>2024 – 2025</small>
                <h3>Full-stack Developer, Kopi Digital</h3>
                <p>Merilis 12 produk web dan mobile untuk klien regional.</p>
              </li>
              <li>
                <small>2025 – Sekarang</small>
                <h3>S1 Sistem Informasi, Universitas Subang</h3>
                <p>Fokus pada interaksi manusia dan komputer.</p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Kontak Section */}
      <section id="kontak">
        <div className="wrap">
          <div className="box">
            <h2>Ayo bangun sesuatu bersama</h2>
            <p className="sub">Punya ide atau butuh tim untuk produk berikutnya? Kirim pesan, saya balas dalam 24 jam.</p>
            <a className="mail" href="mailto:halo@febie.dev">halo@febie.dev</a>
            <div className="links">
              <a href="#github">GitHub</a>
              <a href="#linkedin">LinkedIn</a>
              <a href="#dribbble">Dribbble</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>© 2026 Febie Rifqi Fardani. Dibuat di Subang.</footer>
    </div>
  );
}