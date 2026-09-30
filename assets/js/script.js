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
// 4. Contact Form Submission (Web3Forms & FormSubmit support + Mailto Fallback)
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

    // Prepare a mailto fallback URL with prefilled draft
    const mailtoSubject = encodeURIComponent(`Portfolio Inquiry from ${senderName || 'Visitor'}`);
    const mailtoBody = encodeURIComponent(`Name: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${senderMessage}`);
    const mailtoUrl = `mailto:sahilattar3011@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    try {
      // Determine endpoint: Web3Forms if access_key exists, else FormSubmit
      const hasWeb3Key = formObject.access_key && formObject.access_key.trim().length > 0 && formObject.access_key !== 'YOUR_ACCESS_KEY_HERE';
      const endpoint = hasWeb3Key
        ? 'https://api.web3forms.com/submit'
        : 'https://formsubmit.co/ajax/sahilattar3011@gmail.com';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formObject)
      });

      const result = await response.json().catch(() => ({}));

      const isSuccess = response.ok && (result.success === true || result.success === 'true');
      const isActivationNeeded = result.message && result.message.toLowerCase().includes('activation');

      if (isSuccess) {
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.innerHTML = `✓ Thank you, ${senderName || 'there'}! Your message has been sent successfully to Sahil.`;
        }
        contactForm.reset();
      } else if (isActivationNeeded) {
        if (formStatus) {
          formStatus.className = 'form-status warning';
          formStatus.innerHTML = `
            ⚠️ <strong>Form Activation Required:</strong> FormSubmit sent an activation link to <code>sahilattar3011@gmail.com</code>.<br>
            Please check your inbox or spam folder and click <strong>"Activate Form"</strong>.<br>
            <a href="${mailtoUrl}" class="form-fallback-link">Send directly via Email App instead</a>
          `;
        }
      } else {
        const errorReason = result.message || `Server status ${response.status}`;
        throw new Error(errorReason);
      }
    } catch (err) {
      if (formStatus) {
        formStatus.className = 'form-status error';
        formStatus.innerHTML = `
          ✕ <strong>Unable to deliver automatically:</strong> (${err.message || 'Service temporarily unreachable'}).<br>
          <a href="${mailtoUrl}" class="form-fallback-link">
            ✉️ Click here to open and send via your Email Client
          </a>
        `;
      }
      if (formStatus) {
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } finally {
      formBtn.disabled = false;
      formBtn.innerHTML = originalBtnHtml;
    }
  });
}
