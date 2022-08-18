export function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max)
}

export function debounce(fn, delay) {
	let timeout
	return () => {
		clearTimeout(timeout)
		timeout = setTimeout(fn, delay)
	}
}
