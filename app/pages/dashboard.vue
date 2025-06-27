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

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

const formatCurrency = (amount: number) => {
	return `KES ${amount.toLocaleString()}`;
};

// Reactive data for better UX
const isLoading = ref(false);
const greeting = computed(() => {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
});
</script>

<template>
	<div class="wrapper">
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

			<!-- Hero Content -->

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
			</div>
		</div>

		<!-- Stats Cards Section -->
		<div class="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-12">
				<!-- Forms Card -->
				<NuxtLink to="/forms" class="block group">
					<Card
						variant="primary"
						size="lg"
						icon="material-symbols:description-outline"
						:value="stats?.forms || 0"
						title="Total forms created"
						badge="Forms"
						:progress="Math.min(((stats?.forms || 0) / 20) * 100, 100)"
						:progress-label="`${stats?.forms || 0} of 20 goal`"
						:hoverable="true"
						:clickable="true"
					/>
				</NuxtLink>

				<!-- Earnings Card -->
				<NuxtLink to="/finance" class="block group">
					<Card
						variant="success"
						size="lg"
						icon="material-symbols:payments-outline"
						:value="formatCurrency(stats?.earnings || 0)"
						title="Total earnings"
						badge="Revenue"
						:progress="Math.min(((stats?.earnings || 0) / 10000) * 100, 100)"
						:progress-label="`${formatCurrency(stats?.earnings || 0)} earned`"
						:hoverable="true"
						:clickable="true"
					/>
				</NuxtLink>

				<!-- Responses Card -->
				<NuxtLink to="/marketplace" class="block group md:col-span-2 xl:col-span-1">
					<Card
						variant="info"
						size="lg"
						icon="material-symbols:people-outline"
						:value="(stats?.responses || 0).toLocaleString()"
						title="People reached"
						badge="Reach"
						:progress="Math.min(((stats?.responses || 0) / 2000) * 100, 100)"
						:progress-label="`${(stats?.responses || 0).toLocaleString()} total responses`"
						:hoverable="true"
						:clickable="true"
					/>
				</NuxtLink>
			</div>
		</div>

		<!-- Recent Forms Section -->
		<div class="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
			<Card size="lg" :decorative="false" class="!p-0">
				<template #header>
					<div class="flex items-center justify-between w-full p-6 sm:p-8 pb-0">
						<h2 class="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
							<Icon name="material-symbols:schedule" class="w-7 h-7 sm:w-8 sm:h-8 text-[#3D5A80] mr-3" />
							Recent Forms
						</h2>
						<NuxtLink
							to="/forms"
							class="text-[#3D5A80] hover:text-[#F36A3E] font-medium flex items-center group transition-colors"
						>
							View all
							<Icon
								name="material-symbols:arrow-forward"
								class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
							/>
						</NuxtLink>
					</div>
				</template>

				<div class="p-6 sm:p-8 pt-4">
					<div v-if="recents && recents.length" class="space-y-4">
						<div
							v-for="(item, index) in recents"
							:key="item.ulid"
							class="group bg-gradient-to-r from-gray-50/50 to-white/50 hover:from-[#98C1D9]/10 hover:to-white/80 rounded-2xl p-4 sm:p-6 border border-gray-100 hover:border-[#3D5A80]/20 transition-all duration-300 hover:shadow-md backdrop-blur-sm"
						>
							<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
								<div class="flex items-start space-x-4 flex-1 min-w-0">
									<!-- Form Icon -->
									<div
										class="flex-shrink-0 p-3 bg-gradient-to-br from-[#3D5A80]/10 to-[#98C1D9]/20 rounded-xl group-hover:from-[#3D5A80]/20 group-hover:to-[#98C1D9]/30 transition-colors"
									>
										<Icon
											name="material-symbols:description-outline"
											class="w-6 h-6 text-[#3D5A80]"
										/>
									</div>

									<!-- Form Details -->
									<div class="flex-1 min-w-0">
										<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
											<h3
												class="text-lg font-semibold text-gray-900 group-hover:text-[#3D5A80] transition-colors truncate"
											>
												{{ item.formName }}
											</h3>
											<div class="flex flex-wrap gap-2">
												<span
													v-if="item.price_individual > 0"
													class="inline-flex px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full"
												>
													{{ formatCurrency(item.price_individual) }}
												</span>
												<span
													v-else
													class="inline-flex px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
												>
													Free
												</span>
												<span
													v-if="item.allowGroups"
													class="inline-flex px-2 py-1 bg-[#98C1D9]/20 text-[#3D5A80] text-xs font-medium rounded-full"
												>
													Groups
												</span>
												<span
													v-if="item.requireMerch"
													class="inline-flex px-2 py-1 bg-[#F36A3E]/10 text-[#F36A3E] text-xs font-medium rounded-full"
												>
													Merch
												</span>
											</div>
										</div>
										<p class="text-gray-600 text-sm mb-3 line-clamp-2">
											{{ item.formDescription }}
										</p>
										<div
											class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500"
										>
											<span class="flex items-center">
												<Icon
													name="material-symbols:calendar-today-outline"
													class="w-4 h-4 mr-1"
												/>
												{{ formatDate(item.createdAt) }}
											</span>
											<span
												v-if="item.withdrawnFunds && item.withdrawnFunds > 0"
												class="flex items-center"
											>
												<Icon name="material-symbols:payments-outline" class="w-4 h-4 mr-1" />
												{{ formatCurrency(item.withdrawnFunds) }} withdrawn
											</span>
										</div>
									</div>
								</div>

								<!-- Action Buttons -->
								<div class="flex items-center justify-end lg:justify-start space-x-2">
									<NuxtLink
										:to="`/forms/${item.ulid}`"
										class="p-2 text-gray-500 hover:text-[#3D5A80] hover:bg-[#3D5A80]/10 rounded-lg transition-colors"
										title="View Form"
									>
										<Icon name="material-symbols:visibility-outline" class="w-5 h-5" />
									</NuxtLink>
									<NuxtLink
										:to="`/forms/${item.ulid}/edit`"
										class="p-2 text-gray-500 hover:text-[#F36A3E] hover:bg-[#F36A3E]/10 rounded-lg transition-colors"
										title="Edit Form"
									>
										<Icon name="material-symbols:edit-outline" class="w-5 h-5" />
									</NuxtLink>
									<NuxtLink
										:to="`/forms/${item.ulid}/submissions`"
										class="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
										title="View Submissions"
									>
										<Icon name="material-symbols:assignment-outline" class="w-5 h-5" />
									</NuxtLink>
								</div>
							</div>
						</div>
					</div>

					<!-- Empty State -->
					<div v-else class="text-center py-16">
						<div class="mb-6">
							<div
								class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"
							>
								<Icon name="material-symbols:description-outline" class="w-12 h-12 text-gray-400" />
							</div>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">No forms yet</h3>
						<p class="text-gray-500 mb-8 max-w-sm mx-auto">
							Get started by creating your first form and begin collecting responses
						</p>
						<NuxtLink
							to="/forms/create"
							class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#3D5A80] to-[#98C1D9] text-white font-semibold rounded-2xl hover:from-[#3D5A80]/90 hover:to-[#98C1D9]/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
						>
							<Icon name="material-symbols:add-circle-outline" class="w-5 h-5 mr-2" />
							Create Your First Form
						</NuxtLink>
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

.veil {
	background: radial-gradient(
		66.53% 131.56% at 70.49% 47.56%,
		rgba(61, 90, 128, 0.2) 0%,
		rgba(243, 106, 62, 0.2) 100%
	);
	backdrop-filter: blur(10px);
}

.shadow-md.shadow-sky {
	box-shadow: 2px 4px 10px rgba(152, 193, 217, 0.25);
	backdrop-filter: blur(10px);
}

.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

/* Responsive animations */
@media (prefers-reduced-motion: reduce) {
	.animate-pulse {
		animation: none;
	}

	.hover\:scale-105:hover {
		transform: none;
	}
}

/* Mobile optimizations */
@media (max-width: 640px) {
	.container {
		padding-left: 1rem;
		padding-right: 1rem;
	}
}

/* Enhanced focus states for accessibility */
.focus\:ring-2:focus {
	outline: 2px solid #3d5a80;
	outline-offset: 2px;
}
</style>
