// ============================================
// TK Tiling and Stone — JavaScript
// ============================================

const SUPABASE_URL = 'https://fbpdcwbzkcklaxvqtayd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicGRjd2J6a2NrbGF4dnF0YXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDg0OTEsImV4cCI6MjA4NDkyNDQ5MX0.9q0OH-gKssCWc_iNS-mSapunSkP7nezGNZn5fS_8_AA';
const GALLERY_COUNT = 12;

// --- Nav scroll effect ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// --- Mobile menu ---
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// --- Hero slideshow ---
const heroImgs = document.querySelectorAll('.hero-img');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
let slideInterval;

function goToSlide(i) {
  heroImgs[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = i;
  heroImgs[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() {
  goToSlide((currentSlide + 1) % heroImgs.length);
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    clearInterval(slideInterval);
    goToSlide(parseInt(dot.dataset.index));
    slideInterval = setInterval(nextSlide, 5000);
  });
});

slideInterval = setInterval(nextSlide, 5000);

// --- Gallery (dynamic from storage) ---
const galleryGrid = document.getElementById('galleryGrid');
let galleryImages = [];

async function loadGallery() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/tktiling`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` },
    body: JSON.stringify({ prefix: '', limit: 200, sortBy: { column: 'name', order: 'asc' } })
  });
  const files = await res.json();
  galleryImages = files
    .filter(f => f.name && /\.(jpg|jpeg|png|webp)$/i.test(f.name) && f.name.startsWith('gallery-'))
    .map(f => `${SUPABASE_URL}/storage/v1/object/public/tktiling/${f.name}`);

  galleryGrid.innerHTML = '';
  galleryImages.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${src}" alt="TK Tiling project ${i + 1}" loading="lazy" />
      <div class="gallery-item-overlay">
        <span class="gallery-expand">+</span>
      </div>
    `;
    item.addEventListener('click', () => openLightbox(i));
    galleryGrid.appendChild(item);
  });
}

loadGallery();

// --- Lightbox ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let lightboxIndex = 0;

function openLightbox(i) {
  lightboxIndex = i;
  lightboxImg.src = galleryImages[i];
  lightboxImg.alt = `TK Tiling project ${i + 1}`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => {
  lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
  lightboxImg.src = galleryImages[lightboxIndex];
});
document.getElementById('lightboxNext').addEventListener('click', () => {
  lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
  lightboxImg.src = galleryImages[lightboxIndex];
});
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev').click();
  if (e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
});

// --- Contact form ---
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  formSuccess.style.display = 'none';
  formError.style.display = 'none';

  const data = {
    name: form.name.value,
    phone: form.phone.value,
    email: form.email.value,
    project: form.project.value,
    message: form.message.value,
    created_at: new Date().toISOString(),
  };

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/tktiling_enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(data),
    });

    if (resp.ok) {
      form.reset();
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
      formSuccess.style.display = 'block';
    } else {
      throw new Error('Failed');
    }
  } catch {
    submitBtn.textContent = 'Send Message';
    submitBtn.disabled = false;
    formError.style.display = 'block';
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});
