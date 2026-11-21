// NEXUS GAMING - Interactive website controls
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

const navLinks = Array.from(mainNav.querySelectorAll('.nav-link'));
const mobileNavigation = window.matchMedia('(max-width: 800px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const siteHeader = menuToggle.closest('.site-header');
const destinations = navLinks.map(function(link) {
    return document.getElementById(link.hash.slice(1));
});

function setMenuOpen(isOpen) {
    mainNav.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    menuToggle.textContent = isOpen ? '×' : '☰';
}

menuToggle.addEventListener('click', function() {
    setMenuOpen(!mainNav.classList.contains('open'));
});

navLinks.forEach(function(link, index) {
    link.addEventListener('click', function(event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!mainNav.classList.contains('open')) return;

        setMenuOpen(false);
        destinations[index].focus({ preventScroll: true });
    });
});

document.addEventListener('keydown', function(event) {
    if (event.key !== 'Escape' || !mainNav.classList.contains('open')) return;
    setMenuOpen(false);
    menuToggle.focus();
});

document.addEventListener('click', function(event) {
    if (mainNav.classList.contains('open') && !siteHeader.contains(event.target)) {
        setMenuOpen(false);
    }
});

document.addEventListener('focusin', function(event) {
    if (mainNav.classList.contains('open') && !siteHeader.contains(event.target)) {
        setMenuOpen(false);
    }
});

mobileNavigation.addEventListener('change', function(event) {
    const focusedLink = mainNav.contains(document.activeElement);
    const focusedToggle = document.activeElement === menuToggle;
    setMenuOpen(false);

    if (event.matches && focusedLink) menuToggle.focus();
    if (!event.matches && focusedToggle) (mainNav.querySelector('.active') || navLinks[0]).focus();
});

menuToggle.hidden = false;

let activeNavIndex = -1;
let navUpdatePending = false;

function updateActiveNavigation() {
    navUpdatePending = false;
    const scrollRoot = document.scrollingElement;
    const atBottom = scrollRoot.scrollHeight > scrollRoot.clientHeight &&
        scrollRoot.scrollHeight - scrollRoot.scrollTop - scrollRoot.clientHeight <= 2;
    const activationLine = siteHeader.getBoundingClientRect().bottom + 32;
    let nextIndex = 0;

    if (atBottom) {
        nextIndex = destinations.length - 1;
    } else {
        destinations.forEach(function(section, index) {
            if (section.getBoundingClientRect().top <= activationLine) nextIndex = index;
        });
    }

    if (nextIndex === activeNavIndex) return;
    navLinks.forEach(function(link, index) {
        const isActive = index === nextIndex;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
    activeNavIndex = nextIndex;
}

function queueNavigationUpdate() {
    if (navUpdatePending) return;
    navUpdatePending = true;
    window.requestAnimationFrame(updateActiveNavigation);
}

window.addEventListener('scroll', queueNavigationUpdate, { passive: true });
window.addEventListener('resize', queueNavigationUpdate);
window.addEventListener('hashchange', queueNavigationUpdate);
window.addEventListener('load', queueNavigationUpdate);
queueNavigationUpdate();

const cpu = document.getElementById('cpu');
const gpu = document.getElementById('gpu');
const ram = document.getElementById('ram');
const builderNotice = document.getElementById('builderNotice');
const builderPreviewImage = document.getElementById('buildPreviewImage');
const builder = document.getElementById('builder');
const builderSelects = [cpu, gpu, ram];
const summaryFields = ['cpuSummary', 'gpuSummary', 'ramSummary'].map(function(id) {
    return document.getElementById(id);
});
const presets = {
    phantom: ['i7', 'rtx2060', '16gb'],
    arctic: ['ryzen5', 'rx5700', '16gb'],
    neon: ['ryzen7', 'rtx2060', '32gb']
};

// Twelve original gaming PC photos are reused across all 48 configurations.
// This is a visual showcase, not an exact hardware-to-photo compatibility match.
const buildPhotos = [
    '1.jpeg', '2.jpg', '3.jpg', '4.jfif',
    '5.jpg', '6.jfif', '9.jfif', '10.jpg',
    '11.jpg', '12.png', '13.jfif', '14.jfif'
];
const cpuOptions = ['i5', 'i7', 'ryzen5', 'ryzen7'];
const gpuOptions = ['gtx1660', 'rtx2060', 'rx5700', 'rx580'];
const ramOptions = ['8gb', '16gb', '32gb'];

function getBuildLabels() {
    return builderSelects.map(function(select) {
        return select.selectedOptions[0].textContent;
    });
}

function updateBuildPhoto(labels) {
    const cpuIndex = cpuOptions.indexOf(cpu.value);
    const gpuIndex = gpuOptions.indexOf(gpu.value);
    const ramIndex = ramOptions.indexOf(ram.value);
    const combinationIndex = (cpuIndex * gpuOptions.length + gpuIndex) * ramOptions.length + ramIndex;
    const photoPath = 'assets/pic/' + buildPhotos[combinationIndex % buildPhotos.length];

    if (builderPreviewImage.getAttribute('src') !== photoPath) builderPreviewImage.src = photoPath;
    builderPreviewImage.alt = 'Gaming PC appearance preview for ' + labels[0] + ', ' + labels[1] + ' and ' + labels[2] + '. Illustrative photo only.';
}

function updateSummary() {
    const labels = getBuildLabels();
    summaryFields.forEach(function(field, index) {
        field.textContent = labels[index];
    });
    updateBuildPhoto(labels);
}

builderSelects.forEach(function(select) {
    select.addEventListener('change', updateSummary);
});

document.querySelectorAll('[data-preset]').forEach(function(button) {
    button.addEventListener('click', function() {
        const choices = presets[button.dataset.preset];
        if (!Array.isArray(choices)) return;

        builderSelects.forEach(function(select, index) {
            select.value = choices[index];
        });
        updateSummary();
        builderNotice.textContent = 'Example configuration loaded. Verify component compatibility before purchasing.';
        builder.focus({ preventScroll: true });
        builder.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
});

document.getElementById('resetBuild').addEventListener('click', function() {
    builderSelects.forEach(function(select) {
        select.selectedIndex = 0;
    });
    updateSummary();
    builderNotice.textContent = 'Build reset to default options.';
});

function copyWithFallback(summary) {
    const previousFocus = document.activeElement;
    const text = document.createElement('textarea');
    text.value = summary;
    text.readOnly = true;
    text.style.position = 'fixed';
    text.style.inset = '0 auto auto 0';
    text.style.opacity = '0';
    document.body.appendChild(text);

    try {
        text.focus({ preventScroll: true });
        text.select();
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        text.remove();
        previousFocus.focus({ preventScroll: true });
    }
}

document.getElementById('copyBuild').addEventListener('click', async function() {
    const [cpuLabel, gpuLabel, ramLabel] = getBuildLabels();
    const summary = 'NEXUS GAMING - MY PC BUILD\nCPU: ' + cpuLabel + '\nGPU: ' + gpuLabel + '\nRAM: ' + ramLabel + '\nNote: Concept configuration; compatibility and pricing not verified.';
    let copied;

    try {
        await navigator.clipboard.writeText(summary);
        copied = true;
    } catch {
        copied = copyWithFallback(summary);
    }

    builderNotice.textContent = copied ? 'Your build has been copied!' : 'Clipboard unavailable. Please use a modern browser or HTTPS.';
});

updateSummary();

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

// Keep the native controls and provide feedback when the video source is unavailable.
const gameVideo = document.getElementById('gameVideo');
const videoPlayButton = document.getElementById('videoPlayButton');
const videoStatus = document.getElementById('videoStatus');
const videoSource = gameVideo.querySelector('source');
const videoErrorMessage = 'Video failed to load. Confirm that assets/video/1.mp4 exists and is supported by your browser.';

function showVideoMessage(message) {
    videoStatus.textContent = message;
    videoStatus.hidden = !message;
}

function reportVideoError() {
    videoPlayButton.hidden = false;
    showVideoMessage(videoErrorMessage);
}

videoPlayButton.addEventListener('click', async function() {
    if (gameVideo.error || gameVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        reportVideoError();
        return;
    }

    showVideoMessage('');
    try {
        await gameVideo.play();
    } catch (error) {
        if (error.name === 'AbortError') return;
        if (error.name === 'NotSupportedError') reportVideoError();
        else showVideoMessage('Video could not start. Try the video controls again.');
    }
});

gameVideo.addEventListener('play', function() {
    if (document.activeElement === videoPlayButton) gameVideo.focus({ preventScroll: true });
    videoPlayButton.hidden = true;
    showVideoMessage('');
});
gameVideo.addEventListener('pause', function() {
    videoPlayButton.hidden = false;
});
gameVideo.addEventListener('ended', function() {
    videoPlayButton.hidden = false;
});
gameVideo.addEventListener('error', reportVideoError);
videoSource.addEventListener('error', reportVideoError);

if (gameVideo.error || gameVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
    reportVideoError();
}