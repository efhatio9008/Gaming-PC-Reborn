// NEXUS GAMING - Interactive website controls
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', function() {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    menuToggle.textContent = isOpen ? '×' : '☰';
});

document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '☰';
    });
});

const cpu = document.getElementById('cpu');
const gpu = document.getElementById('gpu');
const ram = document.getElementById('ram');
const builderNotice = document.getElementById('builderNotice');

function updateSummary() {
    document.getElementById('cpuSummary').textContent = cpu.selectedOptions[0].textContent;
    document.getElementById('gpuSummary').textContent = gpu.selectedOptions[0].textContent;
    document.getElementById('ramSummary').textContent = ram.selectedOptions[0].textContent;
}

[cpu, gpu, ram].forEach(function(select) {
    select.addEventListener('change', updateSummary);
});

document.querySelectorAll('[data-preset]').forEach(function(button) {
    button.addEventListener('click', function() {
        const preset = button.dataset.preset;
        const choices = {
            phantom: ['i7', 'rtx2060', '16gb'],
            arctic: ['ryzen5', 'rx5700', '16gb'],
            neon: ['ryzen7', 'rtx2060', '32gb']
        };
        [cpu.value, gpu.value, ram.value] = choices[preset];
        updateSummary();
        builderNotice.textContent = 'Example configuration loaded. Verify component compatibility before purchasing.';
        document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
    });
});

document.getElementById('resetBuild').addEventListener('click', function() {
    cpu.selectedIndex = 0;
    gpu.selectedIndex = 0;
    ram.selectedIndex = 0;
    updateSummary();
    builderNotice.textContent = 'Build reset to default options.';
});

document.getElementById('copyBuild').addEventListener('click', async function() {
    const summary = 'NEXUS GAMING - MY PC BUILD\nCPU: ' + cpu.selectedOptions[0].textContent + '\nGPU: ' + gpu.selectedOptions[0].textContent + '\nRAM: ' + ram.selectedOptions[0].textContent + '\nNote: Concept configuration; compatibility and pricing not verified.';
    try {
        await navigator.clipboard.writeText(summary);
        builderNotice.textContent = 'Your build has been copied!';
    } catch (error) {
        const text = document.createElement('textarea');
        text.value = summary;
        document.body.appendChild(text);
        text.select();
        const copied = document.execCommand('copy');
        text.remove();
        builderNotice.textContent = copied ? 'Your build has been copied!' : 'Clipboard unavailable. Please use a modern browser or HTTPS.';
    }
});

// No backend is configured. This form opens the user's email application.
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    const body = 'From: ' + name + '\nReply-to: ' + email + '\n\n' + message;
    const mailto = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    document.getElementById('formNotice').textContent = 'Opening your email app. Add a recipient and send the message there.';
    window.location.href = mailto;
});

const sections = document.querySelectorAll('main section[id]');
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            document.querySelectorAll('.nav-link').forEach(function(link) {
                link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
            });
        }
    });
}, { rootMargin: '-25% 0px -60% 0px' });
sections.forEach(function(section) { observer.observe(section); });
updateSummary();
