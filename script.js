/* Loads content.json and fills the editable sections.
   The same content is already written in index.html, so if this
   file or content.json fails to load, the page still looks complete. */
(function () {
    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }
    function icon(classes) {
        var i = document.createElement('i');
        // Only allow Font Awesome class names
        i.className = /^[a-z0-9 -]+$/i.test(classes || '') ? classes : 'fa-solid fa-star';
        return i;
    }
    function safeUrl(url, allowMailto) {
        var ok = /^https?:\/\//i.test(url || '') || (allowMailto && /^mailto:/i.test(url || ''));
        return ok ? url : '#';
    }
    function setCards(selector, items, cardClass, withDescription) {
        var box = document.querySelector(selector);
        if (!box || !Array.isArray(items)) return;
        var frag = document.createDocumentFragment();
        items.forEach(function (item) {
            var card = el('div', cardClass);
            card.appendChild(icon(item.icon));
            card.appendChild(el('h3', '', item.title || ''));
            if (withDescription) card.appendChild(el('p', '', item.description || ''));
            frag.appendChild(card);
        });
        box.replaceChildren(frag);
    }
    function setProjects(items) {
        var section = document.querySelector('#projects');
        if (!section || !Array.isArray(items) || !items.length) return;
        var box = section.querySelector('.projects-container') || section.appendChild(el('div', 'projects-container'));
        var frag = document.createDocumentFragment();
        items.forEach(function (p) {
            var card = el('div', 'project-card');
            card.appendChild(el('h3', '', p.title || ''));
            if (p.description) card.appendChild(el('p', '', p.description));
            var pics = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
            if (pics.length) {
                var gallery = el('div', 'project-images');
                pics.forEach(function (src) {
                    if (!src) return;
                    var img = el('img');
                    img.src = src;
                    img.alt = p.title || 'Project';
                    img.loading = 'lazy';
                    gallery.appendChild(img);
                });
                card.appendChild(gallery);
            }
            if (p.link) {
                var a = el('a', '', 'View project');
                a.href = safeUrl(p.link);
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                card.appendChild(a);
            }
            frag.appendChild(card);
        });
        box.replaceChildren(frag);
    }
    function setContact(c) {
        if (!c) return;
        var text = document.querySelector('.contact-text');
        if (text && c.text) text.textContent = c.text;
        var mail = document.querySelector('.contact-email');
        if (mail && c.email) {
            mail.href = 'mailto:' + c.email;
            mail.replaceChildren(icon('fa-solid fa-envelope'), document.createTextNode(' ' + c.email));
        }
        ['facebook', 'github', 'youtube'].forEach(function (name) {
            if (!c[name]) return;
            document.querySelectorAll('a[aria-label="' + name.charAt(0).toUpperCase() + name.slice(1) + '"]').forEach(function (a) {
                a.href = safeUrl(c[name]);
            });
        });
    }
    fetch('content.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) {
            var about = document.querySelector('.landing .text p');
            if (about && d.about && d.about.text) about.textContent = d.about.text;
            setCards('.hobbies-container', d.hobbies, 'hobby-card', false);
            setCards('.skills-container', d.skills, 'skills-card', true);
            setProjects(d.projects);
            setContact(d.contact);
        })
        .catch(function () { /* keep the static content */ });

    /* Dark / light toggle. Default follows the device; a click saves the choice. */
    var lightCss = document.getElementById('light-css');
    if (lightCss) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-toggle';
        document.body.appendChild(btn);
        var isLight = function () {
            if (lightCss.media === 'all') return true;
            if (lightCss.media === 'not all') return false;
            return window.matchMedia('(prefers-color-scheme: light)').matches;
        };
        var refresh = function () {
            var light = isLight();
            btn.replaceChildren(icon(light ? 'fa-solid fa-moon' : 'fa-solid fa-sun'));
            btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
        };
        btn.addEventListener('click', function () {
            var next = isLight() ? 'dark' : 'light';
            lightCss.media = next === 'light' ? 'all' : 'not all';
            try { localStorage.setItem('theme', next); } catch (e) { }
            refresh();
        });
        refresh();
    }
})();
