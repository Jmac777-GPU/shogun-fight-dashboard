async function signOut() {
	try {
		const response = await fetch('/netlify/functions/oauth.mjs', {
			method: 'DELETE'
		})
		if (!response.ok) throw new Error('Unable to sign out.')

		window.location.href.replace('/')
	} catch (error) {
		console.error('Sign-out failed: ', error)
	}
}

document.querySelectorAll('[data-sign-out]').forEach((button) => {
	button.addEventListener('click', signOut)
})
