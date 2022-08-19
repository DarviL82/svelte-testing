<script lang="ts">
	import StackedCards from "./components/StackedCards.svelte"
</script>

<div class="card-container">
	<StackedCards
		cards={[
			{
				smallTitle: "Q1",
				title: "Q1 2022",
				todos: ["Add a new feature", "Fix a bug", "Refactor code"],
			},
			{
				smallTitle: "Q2",
				title: "Q2 2022",
				todos: ["Add a new feature", "Fix a bug", "Refactor code"],
			},
			{
				smallTitle: "Q3",
				title: "Q3 2022",
				todos: ["Add a new feature", "Fix a bug", "Refactor code"],
			},
			{
				smallTitle: "Q4",
				title: "Q4 2022",
				todos: ["Add a new feature", "Fix a bug", "Refactor code"],
			},
			{
				smallTitle: "Q1",
				title: "Q1 2023",
				todos: ["Add a new feature", "Fix a bug", "Refactor code"],
			},
		]}
		cardColor="#25252e"
		scrollCardsOnWheel
		size={{ height: "40rem" }}
	/>
</div>

<style>
	.card-container {
		display: flex;
		justify-content: center;
		margin: 2em;
		gap: 3em;
	}
</style>
