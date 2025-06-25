<script setup lang="ts">
definePageMeta({
	middleware: ["auth"],
});

const { data: stats } = await useFetch("/api/forms/me/stats", {
	headers: {
		Authorization: `Bearer ${getAuthToken()}`,
	},
	onResponseError({ response }) {
		console.error(response);
	},
	onRequestError({ error }) {
		console.error(error);
	},
});

const { data: recents } = await useFetch(`/api/forms/me/recents`, {
	headers: {
		Authorization: `Bearer ${getAuthToken()}`,
	},
	onResponseError({ error }) {
		console.error(error);
	},
	onRequestError({ error }) {
		console.error(error);
	},
});
</script>

<template>
	<div>
		<Title>Dashboard</Title>
		<Pill />
		<div class="container lg:flex-nowrap flex-wrap" v-if="stats">
			<NuxtLink
				to="/forms"
				class="w-full lg:w-4/12 xl:w-3/12 md:w-3/12 px-4 h-[140px] hover:scale-[1.02] transition-transform duration-300"
			>
				<CardSummaryCard
					title="forms"
					:icon="`mdi:file`"
					:count="stats.forms"
					:description="`You have created ${stats?.forms || 0} forms so far`"
				/>
				<div class="h-1 w-full bg-transparent rounded -mt-1" v-if="stats.forms < 10">
					<div
						class="h-1 bg-sky rounded max-w-full"
						:style="{ width: `${((stats?.forms || 0) / 10) * 100}%` }"
					/>
				</div>
			</NuxtLink>
			<NuxtLink
				to="/finance"
				class="w-full lg:w-4/12 xl:w-3/12 md:w-3/12 px-4 h-[140px] hover:scale-[1.02] transition-transform duration-300"
			>
				<CardSummaryCard
					title="money"
					icon="mdi:dollar"
					:count="stats.earnings"
					:description="`You have earned ${stats?.earnings || 0} KES so far`"
				/>
				<div class="h-1 w-full bg-transparent rounded -mt-1" v-if="stats.earnings < 10000">
					<div
						class="h-1 bg-sky rounded max-w-full"
						:style="{ width: `${((stats?.earnings || 0) / 10000) * 100}%` }"
					/>
				</div>
			</NuxtLink>
			<NuxtLink
				to="/marketplace"
				class="w-full lg:w-4/12 xl:w-3/12 md:w-3/12 px-4 h-[140px] hover:scale-[1.02] transition-transform duration-300"
			>
				<CardSummaryCard
					title="reach"
					icon="mdi:git"
					:count="stats.responses"
					:description="`You have reached ${stats.responses || 0} people`"
				/>
				<div class="h-1 w-full bg-transparent rounded -mt-1" v-if="stats.responses < 10">
					<div
						class="h-1 bg-sky rounded max-w-full"
						:style="{ width: `${((stats?.responses || 0) / 10) * 100}%` }"
					/>
				</div>
			</NuxtLink>
		</div>
		<div class="flex flex-col px-4 xl:px-6 mt-8 w-full">
			<h1 class="w-full xl:w-6/12 xl:px-5 lg:px-10 lg:w-full md:w-9/12 m-auto uppercase font-bold mt-1">
				Recents
			</h1>
			<ul
				class="w-full xl:w-6/12 xl:px-5 lg:px-10 lg:w-full md:w-9/12 m-auto recent-list"
				v-if="recents && recents.length"
			>
				<li v-for="item in recents" class="flex align-middle gap-3 m-auto p-2 w-full">
					<div class="w-fit">
						<Icon name="mdi:file" class="w-6 h-6 text-gray-500" />
					</div>
					<div class="flex w-full">
						<div class="inline-flex align-middle">
							<h2
								class="text-[#262626] text-nowrap text-ellipsis overflow-clip h-full uppercase font-semibold mr-2 mt-auto w-[100px]"
								style="font-size: 0.85rem"
							>
								{{ item.formName }}
							</h2>
							<span
								class="text-gray-500 text-nowrap text-ellipsis overflow-clip h-full flex-1 max-w-[200px]"
								style="font-size: 0.85rem"
								>{{ item.formDescription }}</span
							>
						</div>
						<div class="inline-flex w-fit ml-auto">
							<NuxtLink :to="`/forms/${item.ulid}`" title="View  Form">
								<Icon
									name="mdi:eye"
									class="w-6 h-6 hover:text-blue-500 text-gray-500 transition-colors"
								/>
							</NuxtLink>
							<NuxtLink :to="`/forms/${item.ulid}/edit`" title="Edit Form">
								<Icon
									name="mdi:edit-box-outline"
									class="w-6 h-6 hover:text-orange-500 text-gray-500 transition-colors"
								/>
							</NuxtLink>
							<NuxtLink :to="`/forms/${item.ulid}/submissions`" title="Submissions">
								<Icon
									name="mdi:page-next-outline"
									class="w-6 h-6 hover:text-emerald-500 text-gray-500 transition-colors"
								/>
							</NuxtLink>
						</div>
					</div>
				</li>
			</ul>
			<div v-else class="w-full xl:w-6/12 xl:px-5 lg:px-10 lg:w-full md:w-9/12 m-auto mt-2">
				<p class="text-center text-gray-500">
					You have not created any forms yet.
					<NuxtLink to="/forms/create" class="text-blue-500">Create one now</NuxtLink>
				</p>
			</div>
		</div>
		<div class="flex flex-col px-4 xl:px-6 mt-8">
			<h1 class="w-full xl:w-6/12 xl:px-5 lg:px-10 lg:w-full md:w-9/12 m-auto uppercase font-bold mt-1">
				Actions
			</h1>
			<ul class="w-full xl:w-6/12 xl:px-5 lg:px-10 lg:w-full md:w-9/12 m-auto mt-2 text-center">
				<li
					class="py-2 bg-peach text-white rounded hover:bg-emerald-600 transition-colors w-40 font-semibold uppercase"
					style="font-size: smaller"
				>
					<NuxtLink to="/forms/create">Create A Form</NuxtLink>
				</li>
			</ul>
		</div>
	</div>
</template>
<style scoped lang="scss">
.container {
	max-width: 1200px;
	margin: auto;
	display: flex;
	justify-content: center;
	gap: 1rem;
	margin-top: 4.5rem;
}

.recent-list li:hover {
	background-color: #f9f9f9;

	transition: background-color 0.3s;
}

.recent-list li {
	border: 1px solid hsl(0, 0%, 95%);
	border-radius: 5px;
	margin-bottom: 5px;
	width: 100%;
	padding: 1rem;
	display: flex;
	justify-content: space-between;
	align-items: center;

	transition: background-color 0.3s;
}

.recent-list li svg {
	cursor: pointer;
	margin-left: 0.25rem;
}
</style>
