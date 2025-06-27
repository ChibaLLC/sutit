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


		<!-- Hero Section with Glassmorphism -->
		<div class="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
			<!-- Animated Background Elements -->
			<div class="absolute inset-0">
				<div class="absolute top-10 left-10 w-32 h-32 bg-[#3D5A80]/20 rounded-full blur-xl animate-pulse"></div>
				<div
					class="absolute top-32 right-20 w-48 h-48 bg-[#F36A3E]/15 rounded-full blur-2xl animate-pulse delay-1000"
				></div>
				<div
					class="absolute bottom-20 left-1/3 w-40 h-40 bg-[#98C1D9]/25 rounded-full blur-xl animate-pulse delay-500"
				></div>
			</div>

			<div class="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
				<div class="veil rounded-3xl p-8 sm:p-12 text-[#3D5A80] relative overflow-hidden">
					<!-- Background decorations -->
					<div
						class="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full translate-x-16 sm:translate-x-32 -translate-y-16 sm:-translate-y-32"
					></div>
					<div
						class="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-[#F36A3E]/10 rounded-full -translate-x-12 sm:-translate-x-24 translate-y-12 sm:translate-y-24"
					></div>

					<div class="relative z-10">
						<h2 class="text-2xl sm:text-3xl font-bold mb-8 flex items-center text-[#3D5A80]">
							<Icon name="material-symbols:bolt" class="w-7 h-7 sm:w-8 sm:h-8 mr-3" />
							Quick Actions
						</h2>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
							<NuxtLink
								to="/forms/create"
								class="group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:scale-105 border border-white/20"
							>
								<div class="flex items-center space-x-4">
									<div class="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
										<Icon
											name="material-symbols:add-circle-outline"
											class="w-6 h-6 text-[#3D5A80]"
										/>
									</div>
									<div>
										<h3 class="font-semibold text-[#3D5A80]">Create Form</h3>
										<p class="text-[#3D5A80]/70 text-sm">Start building a new form</p>
									</div>
								</div>
							</NuxtLink>

							<NuxtLink
								to="/forms"
								class="group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:scale-105 border border-white/20"
							>
								<div class="flex items-center space-x-4">
									<div class="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
										<Icon
											name="material-symbols:folder-open-outline"
											class="w-6 h-6 text-[#3D5A80]"
										/>
									</div>
									<div>
										<h3 class="font-semibold text-[#3D5A80]">Manage Forms</h3>
										<p class="text-[#3D5A80]/70 text-sm">View and edit your forms</p>
									</div>
								</div>
							</NuxtLink>

							<NuxtLink
								to="/analytics"
								class="group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:scale-105 border border-white/20 sm:col-span-2 lg:col-span-1"
							>
								<div class="flex items-center space-x-4">
									<div class="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
										<Icon
											name="material-symbols:analytics-outline"
											class="w-6 h-6 text-[#3D5A80]"
										/>
									</div>
									<div>
										<h3 class="font-semibold text-[#3D5A80]">Analytics</h3>
										<p class="text-[#3D5A80]/70 text-sm">View performance insights</p>
									</div>
								</div>
							</NuxtLink>
						</div>
					</div>
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

				</div>
			</Card>
		</div>

		<!-- Quick Actions Section -->
	</div>
</template>

<style scoped>
.wrapper {
	position: absolute;
	top: 0;
	left: 0;
	padding-top: 5rem;
	min-width: 100vw;
	min-height: 100vh;
	background: radial-gradient(100.76% 179.14% at -2.4% -2.78%, #ffffff 25.3%, #e0fbfc 100%);
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
