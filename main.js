/* The Appraisal Professor — script.js
   Minimal, dependency-free behavior for the static site. */

(function () {
  'use strict';

  /* Smooth-scroll for in-page anchor links (accounts for sticky nav). */
  var nav = document.querySelector('.nav');
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id === '#' || id === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = nav ? nav.offsetHeight + 12 : 0;
      var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* Form handling.
     These are front-end only. To actually receive submissions, point the
     form at an email service (e.g. Formspree) by giving each <form> an
     action="https://formspree.io/f/XXXX" and method="POST", then delete
     the handler below. For now we just show a friendly confirmation. */
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      var original = btn.textContent;
      btn.textContent = form.dataset.form === 'guide' ? 'Sent — check your inbox ✓' : 'Thanks — Andrew will reach out ✓';
      btn.disabled = true;
      btn.style.opacity = '0.85';
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.opacity = '';
        form.reset();
      }, 3200);
    });
  });
})();
