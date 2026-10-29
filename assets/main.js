/* Temafric site script: language switch, mobile menu, quote form */
(function () {
  var KEY = 'temafric-lang';
  var root = document.documentElement;
  var WA_NUMBER = '243811562990';

  function store(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }

  function applyLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l);
    var t = root.getAttribute('data-title-' + l);
    if (t) document.title = t;
    var buttons = document.querySelectorAll('[data-set-lang]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-set-lang') === l ? 'true' : 'false');
    }
    // Attributes and <option> text that CSS cannot swap
    var els = document.querySelectorAll('[data-en]');
    for (var j = 0; j < els.length; j++) {
      var el = els[j], v = el.getAttribute('data-' + l);
      if (v == null) continue;
      if (el.tagName === 'OPTION') el.textContent = v;
      else if (el.hasAttribute('placeholder')) el.setAttribute('placeholder', v);
      else if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', v);
      else el.textContent = v;
    }
    var langField = document.getElementById('q-lang');
    if (langField) langField.value = l;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set-lang]');
    if (b) {
      var l = b.getAttribute('data-set-lang');
      store(l);
      applyLang(l);
    }
  });

  applyLang(root.getAttribute('data-lang') === 'fr' ? 'fr' : 'en');

  // Mobile menu
  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-btn');
  if (header && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('open')) {
        header.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
      }
    });
  }

  // Footer year
  var y = document.querySelectorAll('[data-year]');
  for (var k = 0; k < y.length; k++) y[k].textContent = new Date().getFullYear();

  // Quote form
  var form = document.getElementById('quote-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('q-submit');
  var started = document.getElementById('q-ts');
  if (started) started.value = String(Math.floor(Date.now() / 1000));

  function lang() { return root.getAttribute('data-lang') === 'fr' ? 'fr' : 'en'; }
  function msg(key) {
    var m = {
      ok: {
        en: 'Thank you. Your request has been sent to our sales team, who will contact you shortly.',
        fr: 'Merci. Votre demande a été envoyée à notre équipe commerciale, qui vous contactera rapidement.'
      },
      err: {
        en: 'Your request could not be sent from this page. Please email <a href="mailto:sales@temafric.com">sales@temafric.com</a> or use the WhatsApp button to send it.',
        fr: 'Votre demande n’a pas pu être envoyée depuis cette page. Écrivez-nous à <a href="mailto:sales@temafric.com">sales@temafric.com</a> ou utilisez le bouton WhatsApp pour l’envoyer.'
      },
      sending: { en: 'Sending…', fr: 'Envoi…' }
    };
    return m[key][lang()];
  }
  function show(kind, html) {
    status.hidden = false;
    status.className = 'status ' + kind;
    status.innerHTML = html;
  }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function optText(id) {
    var el = document.getElementById(id);
    if (!el || !el.value) return '';
    return el.options[el.selectedIndex].textContent.trim();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    // Bot traps: hidden field filled, or form sent within 3 seconds of loading
    var ts = started ? parseInt(started.value, 10) : 0;
    if (val('q-website') || (ts && Date.now() / 1000 - ts < 3)) {
      show('ok', msg('ok'));
      form.reset();
      return;
    }
    var label = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = msg('sending');
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    var who = val('q-company') || val('q-name');
    var payload = {
      _subject: 'Quotation request: ' + (optText('q-product') || '-') + ' — ' + who,
      _template: 'table',
      _captcha: 'false',
      _replyto: val('q-email'),
      'Name': val('q-name'),
      'Company': val('q-company') || '-',
      'Email': val('q-email'),
      'Phone / WhatsApp': val('q-phone'),
      'Country': val('q-country') || '-',
      'Product': optText('q-product') || '-',
      'Quantity': val('q-qty') || '-',
      'Delivery location': val('q-location') || '-',
      'Required by': val('q-date') || '-',
      'Details': val('q-message'),
      'Site language': lang().toUpperCase()
    };
    fetch(form.getAttribute('action'), {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && (data.success === true || data.success === 'true')) {
          show('ok', msg('ok'));
          form.reset();
          if (started) started.value = String(Math.floor(Date.now() / 1000));
        } else {
          show('err', msg('err'));
        }
      })
      .catch(function () { show('err', msg('err')); })
      .then(function () {
        clearTimeout(timer);
        submitBtn.disabled = false;
        submitBtn.innerHTML = label;
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
  });

  // Send the same request through WhatsApp
  var wa = document.getElementById('q-whatsapp');
  if (wa) {
    wa.addEventListener('click', function () {
      var fr = lang() === 'fr';
      var lines = [
        fr ? 'Demande de devis — Temafric' : 'Quotation request — Temafric',
        (fr ? 'Nom : ' : 'Name: ') + val('q-name'),
        (fr ? 'Société : ' : 'Company: ') + val('q-company'),
        (fr ? 'Produit : ' : 'Product: ') + optText('q-product'),
        (fr ? 'Quantité : ' : 'Quantity: ') + val('q-qty'),
        (fr ? 'Lieu de livraison : ' : 'Delivery location: ') + val('q-location'),
        (fr ? 'Date souhaitée : ' : 'Required by: ') + val('q-date'),
        (fr ? 'Détails : ' : 'Details: ') + val('q-message')
      ].filter(function (s) { return !/: $/.test(s); });
      wa.setAttribute('href', 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')));
    });
  }
})();
