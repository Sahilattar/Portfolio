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

// Check URL hash on page load (e.g. #resume, #portfolio, #about)
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash) {
    const targetBtn = Array.from(navLinks).find(btn => btn.textContent.trim().toLowerCase() === hash);
    if (targetBtn) {
      targetBtn.click();
    }
  }
});

// -------------------------------------------------------------------
// 2. Mobile Sidebar Contact Toggle ("Show Contacts")
// -------------------------------------------------------------------
const sidebarBtn = document.getElementById('sidebarBtn');
const sidebarMore = document.getElementById('sidebarMore');

if (sidebarBtn && sidebarMore) {
  sidebarBtn.addEventListener('click', () => {
    sidebarMore.classList.toggle('show');
    const isShowing = sidebarMore.classList.contains('show');
    const btnSpan = sidebarBtn.querySelector('span');
    if (btnSpan) {
      btnSpan.textContent = isShowing ? 'Hide Contacts' : 'Show Contacts';
    }
    const svg = sidebarBtn.querySelector('svg');
    if (svg) {
      svg.style.transform = isShowing ? 'rotate(180deg)' : 'rotate(0deg)';
      svg.style.transition = 'transform 0.3s ease';
    }
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
// 4. Contact Form Submission (Web3Forms Instant & Mailto Fallback)
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
      formStatus.innerHTML = '';
    }

    const formData = new FormData(contactForm);
    const formObject = Object.fromEntries(formData.entries());
    const senderName = (formObject.name || '').trim();
    const senderEmail = (formObject.email || '').trim();
    const senderMessage = (formObject.message || '').trim();

    // Prepare a mailto URL with prefilled recipient, subject, and body
    const mailtoSubject = encodeURIComponent(`Portfolio Inquiry from ${senderName || 'Visitor'}`);
    const mailtoBody = encodeURIComponent(`Hi Sahil,\n\nName: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${senderMessage}`);
    const mailtoUrl = `mailto:sahilattar3011@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    const rawKey = (formObject.access_key || '').trim();
    const hasWeb3Key = rawKey.length > 0 && rawKey !== 'YOUR_ACCESS_KEY_HERE';

    // If Web3Forms access key is not yet set, provide instant response (no hanging)
    if (!hasWeb3Key) {
      setTimeout(() => {
        formBtn.disabled = false;
        formBtn.innerHTML = originalBtnHtml;

        if (formStatus) {
          formStatus.className = 'form-status warning';
          formStatus.innerHTML = `
            <strong>✉️ Ready to send:</strong> Click below to deliver your message directly to Sahil's email (pre-filled draft).<br>
            <a href="${mailtoUrl}" class="form-fallback-link" style="margin-top: 8px;">
              Open in Email App & Send
            </a>
          `;
          formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Try opening the pre-filled email client automatically
        try {
          window.location.href = mailtoUrl;
        } catch (_) {}
      }, 300);
      return;
    }

    // When Web3Forms key IS configured, send via fast API with strict 4s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formObject),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const result = await response.json().catch(() => ({}));
      const isSuccess = response.ok && (result.success === true || result.success === 'true');

      if (isSuccess) {
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.innerHTML = `✓ Thank you, ${senderName || 'there'}! Your message has been sent successfully to Sahil.`;
        }
        contactForm.reset();
      } else {
        throw new Error(result.message || `Server status ${response.status}`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout ? 'Request timed out' : (err.message || 'Service unavailable');

      if (formStatus) {
        formStatus.className = 'form-status error';
        formStatus.innerHTML = `
          ✕ <strong>Notice (${errorMsg}):</strong> Could not deliver in background.<br>
          <a href="${mailtoUrl}" class="form-fallback-link">
            ✉️ Click here to send your message via your Email Client
          </a>
        `;
      }
    } finally {
      if (formStatus) {
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      formBtn.disabled = false;
      formBtn.innerHTML = originalBtnHtml;
    }
  });
}
