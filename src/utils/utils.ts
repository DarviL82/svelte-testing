export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

export function debounce(fn: () => void, delay: number) {
	let timeout: NodeJS.Timeout
	return () => {
		clearTimeout(timeout)
		timeout = setTimeout(fn, delay)
	}
}
