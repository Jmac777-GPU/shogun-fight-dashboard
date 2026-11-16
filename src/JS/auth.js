console.log('auth.js loaded')

async function signIn(googleResponse) {
	const statusElement = document.getElementById('auth-status')
	const accessRequest = document.getElementById('access-request')

	// Reset previous authentication feedback
	accessRequest.hidden = true
	statusElement.style.color = ''
	document.getElementById('copy-account-id').textContent = 'Copy Account ID'

	if (!googleResponse?.credential) {
		statusElement.textContent = 'Google did not return a credential.'
		return
	}

	statusElement.textContent = 'Verifying your account…'

	try {
		const httpResponse = await fetch('/.netlify/functions/oauth', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				credential: googleResponse.credential
			})
		})

		const data = await httpResponse.json()

		if (!httpResponse.ok) {
			// Display verified account information if unauthorized
			if (httpResponse.status === 403 && data.account?.id) {
				document.getElementById('account-email').textContent =
					data.account.email

				document.getElementById('account-id').textContent = data.account.id

				accessRequest.hidden = false
			}

			throw new Error(data.error || `HTTP ${httpResponse.status}`)
		}

		if (data.authorized !== true) {
			throw new Error('Access was not authorized.')
		}

		console.log('Account verified and authorized')

		statusElement.style.color = 'green'
		statusElement.textContent = `Welcome, ${data.user.name || 'staff member'}! Your account is authorized.`
	} catch (error) {
		console.error('Sign-in failed:', error)
		statusElement.textContent =
			error.message || 'Sign-in failed. Please try again.'
	}
}

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

document
	.getElementById('copy-account-id')
	.addEventListener('click', async () => {
		const accountId = document.getElementById('account-id').textContent
		const button = document.getElementById('copy-account-id')

		try {
			await navigator.clipboard.writeText(accountId)
			button.textContent = 'Copied!'
		} catch {
			button.textContent = 'Select the ID above to copy'
		}
	})

async function checkSession() {
	const statusElement = document.getElementById('auth-status')
	try {
		const response = await fetch('/.netlify/functions/oauth', {
			cache: 'no-store'
		})

		if (response.status === 401) return
		if (!response.ok) throw new Error(`HTTP ${response.status}`)

		const {user} = await response.json()

		statusElement.style.color = 'green'
		statusElement.textContent = `Welcome back, ${user.name || 'staff member'}!`
	} catch (error) {
		console.error('Session check failed:', error)
	}
}

checkSession()
