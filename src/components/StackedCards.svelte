<script lang="ts">
	import { onMount } from "svelte"

	import { fly } from "svelte/transition"
	import type { CSSColor, CSSUnit } from "../utils/typedefs"
	import { clamp, debounce } from "../utils/utils"

	export let cards: { smallTitle?: string; title: string; todos: string[] }[]
	export let cardColor: CSSColor = "#444"
	export let overlayColor: CSSColor = "black"

	/** Wether the cards should be positioned vertically or horizontally.
	 * Allowed values are `true`, `false` and `"auto"`.
	 * Auto will set them based on the current width of the viewport */
	export let vertical: boolean | "auto" = "auto"

	export let size: {
		width?: CSSUnit
		height?: CSSUnit
		expandedSize?: CSSUnit
		collapsedSize?: CSSUnit
	} = {}

	/** Minimun brightness of the cards from 0 to 1 */
	export let minBrightness: number = 0

	/** Maximun brightness of the cards from 0 to 1 */
	export let maxBrightness: number = 1

	/** Invert the cards brightness variation effect
	 * to change from dark to bright (default is the opposite) */
	export let invert: boolean = false

	/** The amount of steps to divide the brightness variation.
	 * This defaults to the size of the cards array provided. */
	export let gradientTransitionSteps: number = undefined

	/** When a card is collapsed, don't show the smallTitle */
	export let dontShowSmallTitleWhenCollapsed: boolean = false

	/** Scroll over the cards with the mouse wheel */
	export let scrollCardsOnWheel = false

	let hoveredCardIndex: number = 0
	let container: HTMLDivElement
	let isHoverDisabled: boolean = false

	function setCardIndex(index: number) {
		hoveredCardIndex = clamp(index, 0, cards.length - 1)
	}

	function handleCardHover(currentCardIndex: number) {
		if (isHoverDisabled) return
		setCardIndex(currentCardIndex)
	}

	const enableHover = debounce(() => {
		isHoverDisabled = false
	}, 1000)

	function handleCardScroll(event: WheelEvent) {
		if (!scrollCardsOnWheel) return
		event.preventDefault()
		setCardIndex(hoveredCardIndex - Math.sign(event.deltaY))
		isHoverDisabled = true
		enableHover() // Enables hover again after 1 second of no scrolling
	}

	$: {
		if (container) {
			/** Apply the correct amount of opacity to each card */
			;[...container.children].forEach((c: HTMLDivElement, i) => {
				const value = clamp(
					(Math.abs(i - hoveredCardIndex) *
						Math.round(
							100 / (gradientTransitionSteps ?? cards.length)
						)) /
						100,
					minBrightness,
					maxBrightness
				)

				c.style.setProperty(
					"--opacity",
					(invert ? 1 - value : value).toString()
				)
			})
		}
	}

	onMount(() => {
		// set default values
		size = {
			width: "100%",
			height: "100%",
			expandedSize: "15rem",
			collapsedSize: "5rem",
			...size,
		}
	})

	let windowWidth: number = 0
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div
	class="stacked-cards"
	class:vertical={(vertical === "auto" && windowWidth < 768) ||
		vertical === true}
	bind:this={container}
	on:wheel={handleCardScroll}
	style:width={size.width || null}
	style:height={size.height || null}
	style:--expanded-size={size.expandedSize || null}
	style:--collapsed-size={size.collapsedSize || null}
	style:--bg-color={cardColor}
	style:--overlay-color={overlayColor}
>
	{#each cards as card, i}
		<div
			class="card"
			on:mouseover={() => handleCardHover(i)}
			on:focus={() => handleCardHover(i)}
			class:active={i === hoveredCardIndex}
			style:z-index={cards.length - i}
		>
			{#if !dontShowSmallTitleWhenCollapsed || i === hoveredCardIndex}
				<h1 class="small-title">{card.smallTitle ?? card.title}</h1>
			{/if}

			{#if i === hoveredCardIndex}
				<div
					class="content"
					in:fly={{ y: 15, duration: 250, delay: 150 }}
					out:fly={{ y: 15, duration: 50 }}
				>
					<h1 class="title">{card.title}</h1>
					<ul class="todos">
						{#each card.todos as todo}
							<li>{todo}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
	.stacked-cards {
		$border-radius: 15px;

		position: relative;
		display: flex;
		background-color: #111;
		overflow: hidden;
		border-radius: $border-radius;
		box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.2);
		width: 100%;

		.card {
			display: flex;
			position: relative;
			flex-direction: column;
			justify-content: start;
			background-color: var(--bg-color, #111);
			border-radius: 0 $border-radius $border-radius 0;
			width: 0;
			flex-grow: 1;
			isolation: isolate;
			transition: all 0.5s, background-color 0.15s;

			// left padding under the previous card
			&::before {
				content: "";
				position: absolute;
				inset-block: 0;
				left: -$border-radius;
				width: $border-radius;
				background-color: var(--bg-color, #111);
				z-index: -2;
				transition: 0.15s;
			}

			// overlay for darking the card
			&::after {
				content: "";
				position: absolute;
				inset: 0;
				left: -$border-radius;
				background-color: var(--overlay-color, black);
				opacity: var(--opacity, 0);
				z-index: -1;
				border-radius: 0 $border-radius $border-radius 0;
				transition: 0.25s;
			}

			.small-title {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%) scale(var(--scale, 1));
				transition: transform 0.25s, opacity 0.1s;
			}

			.content {
				display: flex;
				flex-direction: column;
				gap: 1.5rem;
				padding: 3.5rem;

				.title {
					font-size: 2.75rem;
				}
			}

			&.active {
				width: var(--expanded-size);
				transition: 0.25s;

				.small-title {
					--scale: 4;
					opacity: 0.025;
					user-select: none;
				}
			}

			&:not(.active) {
				min-width: var(--collapsed-size);
			}
		}

		&.vertical {
			height: 0;
			flex-direction: column;

			.card {
				width: 100%;
				border-radius: 0 0 $border-radius $border-radius;
				transition: all 0.75s, width 0s;

				&::before,
				&::after {
					top: -$border-radius;
					inset-inline: 0;
				}

				&::after {
					border-radius: 0 0 $border-radius $border-radius;
				}

				&::before {
					width: auto;
					height: $border-radius;
				}

				&.active {
					transition: all 0.25s, width 0s;
					height: var(--expanded-size);
				}

				&:not(.active) {
					height: var(--collapsed-size);
				}
			}
		}

		@media (prefers-reduced-motion) {
			&,
			& * {
				transition: none !important;
			}
		}
	}
</style>
