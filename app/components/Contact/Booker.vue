<template>
	<div>
		<Link
			href="https://calendar.google.com/calendar/scheduling-button-script.css"
			rel="stylesheet"
		/>
		<button class="bg-navy text-white px-4 py-2 rounded" type="button" ref="button">
			Schedule Meeting
		</button>
	</div>
</template>
<script setup lang="ts">
const button = ref<HTMLButtonElement | null>(null);
declare global {
	interface Window {
		calendar: {
			schedulingButton: {
				load: (obj: any) => void;
			};
		};
	}
}

const { onLoaded } = useScript(
	{
		src: "https://calendar.google.com/calendar/scheduling-button-script.js",
		async: true,
		crossorigin: false,
	},
	{
		use() {
			return window.calendar;
		},
	}
);

onMounted(() => {
	onLoaded((calendar) => {
		calendar.schedulingButton.load({
			url: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ300wldBWhoIE6szLGoakkzHLCl3qHJiSpmlEaDEv0f6bcBWhfFI8NRnzpsy-xII1rK_tJAKeVP?gv=true",
			color: "#3d5a80",
			label: "",
			target: button.value,
		});

		const target = button.value?.nextElementSibling as HTMLButtonElement;
		target?.classList.add("hidden");
		button.value?.addEventListener("click", () => target?.click());
	});
});
</script>
