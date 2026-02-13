'use strict';
const form = document.querySelector('.form');
const input = document.querySelector('.input');
const submitBtn = document.querySelector('.shortURL');
const qrImg = document.getElementById('imgqr');
const qrSec = document.querySelector('.qrSec');
const urlShort = document.querySelector('.urlshort');
const copyBtnQr = document.querySelector('.copyurl');
const loadingUrl = document.querySelector('.loadingUrl');
const showMoreBtn = document.querySelector('#showMoreBtn');
const wrapper = document.querySelector('.links-wrapper');
const inputField = document.getElementById('inputField');
const footerBtn = document.querySelector('.footerBTN');
const linksBtn = document.querySelector('.links');
const prevLinksSection = document.querySelector('.prev-links-section');
const navbar = document.querySelector('.navbar');

let linkShort = '';

let arr = JSON.parse(localStorage.getItem('shortLinks')) || [];

form.addEventListener('submit', async (e) => {
	e.preventDefault();
	const originalLink = input.value.trim();

	if (!checkUrl(originalLink)) return;

	const fullLink = checkHttps(originalLink)
		? originalLink
		: `http://${originalLink}`;
	try {
		await getShortLink(fullLink);
	} catch (err) {
		console.error(err);
	}
});

function checkHttps(link) {
	return link.startsWith('http');
}

function checkUrl(url) {
	const urlPattern =
		/^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)(\/[\w\-./?%&=]*)?$/i;
	return urlPattern.test(url);
}

async function getShortLink(linkLong) {
	submitBtn.textContent = 'Generating...';
	qrSec.classList.add('hid');
	loadingUrl.classList.remove('hid');

	const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
		method: 'POST',
		headers: {
			Authorization: 'Bearer 69da99aca7b9645ea234082103d8a9e0c7dd66d2',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ long_url: linkLong }),
	});

	if (!response.ok) throw new Error('Failed to fetch short URL');

	const data = await response.json();
	const { link } = data;

	linkShort = link;

	setTimeout(() => {
		loadingUrl.classList.add('hid');
		qrSec.classList.remove('hid');
		submitBtn.textContent = 'Generate Link';
	}, 3000);

	qrImg.src = generateQRCode(link);
	urlShort.textContent = link;
	addLink({ old: linkLong, new: link, time: Date.now() });
}

function generateQRCode(link) {
	return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
		link
	)}&size=200x200`;
}

urlShort.addEventListener('click', () => {
	window.open(linkShort, '_blank');
});

copyBtnQr.addEventListener('click', () => {
	navigator.clipboard.writeText(linkShort).then(() => {
		copyBtnQr.textContent = 'Copied';
		setTimeout(() => (copyBtnQr.textContent = 'Copy Link'), 3000);
	});
});

function addLink(linkData) {
	arr.push(linkData);
	localStorage.setItem('shortLinks', JSON.stringify(arr));

	const trimmed = arr.slice(0, 3);
	localStorage.setItem('trimLinks', JSON.stringify(trimmed));
	renderLinks();
}

function renderLinks() {
	wrapper.innerHTML = '';

	const linksToShow =
		arr.length <= 3 ? arr : JSON.parse(localStorage.getItem('trimLinks'));
	showMoreBtn.classList.toggle('hid', arr.length <= 3);

	linksToShow.forEach(({ old, new: short }) => {
		const div = document.createElement('div');
		div.className = 'link-item';
		div.innerHTML = `
      <p class="original-link">${old}</p>
      <div class="link-details">
        <span class="short-link">${short}</span>
        <div class="copyPart">
          <button class="copy-btn" data-copy="original">Copy Original</button>
          <button class="copy-btn" data-copy="short">Copy Short</button>
          <span class="delete">X</span>
        </div>
      </div>`;
		wrapper.appendChild(div);
	});
}

wrapper.addEventListener('click', (e) => {
	if (e.target.classList.contains('copy-btn')) {
		const btn = e.target;
		const type = btn.dataset.copy;
		const text = btn
			.closest('.link-item')
			.querySelector(
				type === 'original' ? '.original-link' : '.short-link'
			).textContent;

		navigator.clipboard.writeText(text).then(() => {
			btn.textContent = 'Copied';
			setTimeout(() => {
				btn.textContent =
					type === 'original' ? 'Copy Original' : 'Copy Short';
			}, 2000);
		});
	}

	if (e.target.classList.contains('delete')) {
		const shortLink = e.target
			.closest('.link-item')
			.querySelector('.short-link').textContent;
		arr = arr.filter((item) => item.new !== shortLink);
		localStorage.setItem('shortLinks', JSON.stringify(arr));
		const trimmed = arr.slice(0, 3);
		localStorage.setItem('trimLinks', JSON.stringify(trimmed));
		renderLinks();
	}
});

showMoreBtn.addEventListener('click', () => {
	showMoreBtn.classList.add('hid');
	for (let i = 3; i < arr.length; i++) {
		const { old, new: short } = arr[i];
		const div = document.createElement('div');
		div.className = 'link-item';
		div.innerHTML = `
      <p class="original-link">${old}</p>
      <div class="link-details">
        <span class="short-link">${short}</span>
        <div class="copyPart">
          <button class="copy-btn" data-copy="original">Copy Original</button>
          <button class="copy-btn" data-copy="short">Copy Short</button>
          <span class="delete">X</span>
        </div>
      </div>`;
		wrapper.appendChild(div);
	}
});

footerBtn.addEventListener('click', () => {
	inputField.focus();
	navbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

linksBtn.addEventListener('click', () => {
	prevLinksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

renderLinks();
input.value = '';