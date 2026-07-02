function renderFlag(code) {
	if (!code || code.length !== 2) {
		return `<span class="country-flag country-flag-missing">?</span>`;
	}

	return `
		<img
			class="country-flag"
			src="${getFlagUrl(code)}"
			alt=""
			onerror="this.outerHTML='<span class=&quot;country-flag country-flag-missing&quot;>?</span>'"
		>
	`;
}

function getFlagUrl(code) {
	return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
}