/**
 * Sahil Attar — Portfolio JavaScript Logic
 */

'use strict';

// -------------------------------------------------------------------
// 1. Navigation Tab Switching (About, Resume, Portfolio, Learning, Contact)
// -------------------------------------------------------------------
const navLinks = document.querySelectorAll('[data-nav-btn]');
const articles = document.querySelectorAll('article');

navLinks.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetPage = btn.textContent.trim().toLowerCase();

    // Toggle active state on buttons
    navLinks.forEach(link => link.classList.remove('active'));
    articles.forEach(article => article.classList.remove('active'));

    btn.classList.add('active');

    // Activate corresponding page article
    const activeArticle = document.querySelector(`article[data-page="${targetPage}"]`);
    if (activeArticle) {
      activeArticle.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Animate resume skill progress bars when Resume is opened
      if (targetPage === 'resume') {
        requestAnimationFrame(() => {
          document.querySelectorAll('.skill-progress-fill').forEach(fill => {
            fill.style.width = fill.dataset.w + '%';
          });
        });
      }
    }
  });
});

// -------------------------------------------------------------------
// 2. Mobile Sidebar Contact Toggle ("Show Contacts")
// -------------------------------------------------------------------
const sidebarBtn = document.getElementById('sidebarBtn');
const sidebarMore = document.getElementById('sidebarMore');

if (sidebarBtn && sidebarMore) {
  sidebarBtn.addEventListener('click', () => {
    sidebarMore.classList.toggle('show');
  });
}

// -------------------------------------------------------------------
// 3. Portfolio Project Filtering (All, Machine Learning, Data, Web)
// -------------------------------------------------------------------
const filterButtons = document.querySelectorAll('.filter-item button');
const projectItems = document.querySelectorAll('.project-item');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectItems.forEach(item => {
      const cat = item.dataset.cat || '';
      const match = filter === 'all' || cat.includes(filter);
      item.classList.toggle('active', match);
    });
  });
});

// -------------------------------------------------------------------
// 4. Contact Form Submission (Working Form via FormSubmit AJAX)
// -------------------------------------------------------------------
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const formBtn = document.getElementById('formBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!formBtn) return;
    const originalBtnHtml = formBtn.innerHTML;

    // Show loading state
    formBtn.disabled = true;
    formBtn.innerHTML = `
      <svg class="spinner" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      <span>Sending...</span>
    `;

    if (formStatus) {
      formStatus.className = 'form-status';
      formStatus.style.display = 'none';
      formStatus.textContent = '';
    }

    try {
      const formData = new FormData(contactForm);

      const response = await fetch('https://formsubmit.co/ajax/sahilattar3011@gmail.com', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && (result.success === 'true' || result.success === true || response.status === 200)) {
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = '✓ Thank you! Your message has been sent directly to Sahil\'s email (sahilattar3011@gmail.com).';
        }
        contactForm.reset();
      } else if (result.message && result.message.toLowerCase().includes('activation')) {
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = 'ℹ️ Almost ready: FormSubmit sent an activation link to sahilattar3011@gmail.com. Please click "Activate Form" once in your inbox so messages will reach you!';
        }
        contactForm.reset();
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      if (formStatus) {
        formStatus.className = 'form-status error';
        formStatus.textContent = '✕ Could not deliver message automatically. Please reach out directly to sahilattar3011@gmail.com';
      }
    } finally {
      formBtn.disabled = false;
      formBtn.innerHTML = originalBtnHtml;
    }
  });
}
