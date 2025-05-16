<script setup lang="ts">
// SEO metadata configuration
const seoMeta = ref({
	title: "About | Sutit.org",
	description: "Sutit.org is a platform that helps you automate your business processes",
	image: "/favico.jpeg",
});

// Use Nuxt's built-in SEO utilities
useSeoMeta({
	title: seoMeta.value.title,
	description: seoMeta.value.description,
	ogTitle: seoMeta.value.title,
	ogDescription: seoMeta.value.description,
	ogImage: seoMeta.value.image,
	ogUrl: "[og:url]",
	twitterTitle: seoMeta.value.title,
	twitterDescription: seoMeta.value.description,
	twitterImage: seoMeta.value.image,
	twitterCard: "summary",
});

// Dynamic content for feature cards
const featureCards = [
	{
		id: 1,
		icon: "mdi:award",
		iconBgColor: "bg-red-400",
		title: "How It Started",
		description:
			"We identified the need for end to end efficiency for small business and the whole supply chain. For example Whatsapp business among other local tertiary businesses.",
	},
	{
		id: 2,
		icon: "mdi:twitter-retweet",
		iconBgColor: "bg-blue-400",
		title: "How It's Going",
		description:
			"Innovation, collaboration, sustainability and Business Intelligence at its core. All Inclusive, seamless and easy to use.",
	},
	{
		id: 3,
		icon: "mdi:fingerprint",
		iconBgColor: "bg-green-400",
		title: "The Vision",
		description:
			"Futuristic ubiquitous unified platform where supply chains operate with unparalleled efficiency through the use of cutting-edge technology",
	},
];

// Feature list for growing company section
const featuresList = [
	{
		id: 1,
		icon: "mdi:language-html5",
		text: "WhatsApp Business Integration ❎",
		status: false,
	},
	{
		id: 2,
		icon: "mdi:paper-airplane",
		text: "Mpesa Paybill/Till Number Integration ❎",
		status: false,
	},
	{
		id: 3,
		icon: "mdi:paper-airplane",
		text: "Tracking turn around time after payment",
		status: null,
	},
	{
		id: 4,
		icon: "mdi:fingerprint",
		text: "Mpesa Paybill Automated Reconciliations ✅",
		status: true,
	},
];

// Team members data
const teamMembers = [
	{
		id: 1,
		name: "Saxo Munene",
		role: "Founding Partner",
		image: "/images/profile_placeholder.webp",
		socials: [
			{ platform: "twitter", icon: "mdi:twitter", bgColor: "bg-blue-400" },
			{ platform: "facebook", icon: "mdi:facebook", bgColor: "bg-blue-600" },
			{ platform: "instagram", icon: "mdi:instagram", bgColor: "bg-gray-800" },
		],
	},
	{
		id: 2,
		name: "Allen",
		role: "Compliance Specialist",
		image: "/images/profile_placeholder.webp",
		socials: [
			{ platform: "twitter", icon: "mdi:twitter", bgColor: "bg-blue-400" },
			{ platform: "facebook", icon: "mdi:facebook", bgColor: "bg-blue-600" },
			{ platform: "instagram", icon: "mdi:instagram", bgColor: "bg-gray-800" },
		],
	},
	{
		id: 3,
		name: "Bosire Allan",
		role: "Software Engineer",
		image: "/images/profile_placeholder.webp",
		socials: [
			{ platform: "twitter", icon: "mdi:twitter", bgColor: "bg-blue-400" },
			{ platform: "facebook", icon: "mdi:facebook", bgColor: "bg-blue-600" },
			{ platform: "instagram", icon: "mdi:instagram", bgColor: "bg-gray-800" },
		],
	},
	{
		id: 4,
		name: "Kemboi Elvis",
		role: "Software Engineer",
		image: "/images/profile_placeholder.webp",
		socials: [
			{ platform: "twitter", icon: "mdi:twitter", bgColor: "bg-blue-400" },
			{ platform: "facebook", icon: "mdi:facebook", bgColor: "bg-blue-600" },
			{ platform: "instagram", icon: "mdi:instagram", bgColor: "bg-gray-800" },
		],
	},
	{
		id: 4,
		name: "Antoney Sydney",
		role: "Founding Partner",
		image: "/images/profile_placeholder.webp",
		socials: [
			{ platform: "twitter", icon: "mdi:twitter", bgColor: "bg-blue-400" },
			{ platform: "facebook", icon: "mdi:facebook", bgColor: "bg-blue-600" },
			{ platform: "instagram", icon: "mdi:instagram", bgColor: "bg-gray-800" },
		],
	},
];
</script>

<template>
	<div>
		<!-- Hero Background -->
		<div class="bg-sky w-full h-fit absolute top-0 -z-10">
			<img
				src="/images/bg.jpg"
				alt="Background"
				class="w-full aspect-video object-cover mix-blend-multiply blur"
			/>
		</div>

		<!-- Features Section -->
		<section class="pb-20 mt-24 w-10/12 max-sm:w-11/12 mx-auto">
			<div class="container mx-auto px-4">
				<div class="flex flex-wrap">
					<!-- Feature Cards (Dynamically rendered) -->
					<div
						v-for="card in featureCards"
						:key="card.id"
						:class="['lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center', card.id === 2 ? '' : 'lg:pt-12']"
					>
						<div
							class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg transition-shadow duration-300 hover:shadow-xl"
						>
							<div class="px-4 py-5 flex-auto">
								<div
									:class="[
										'text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full',
										card.iconBgColor,
									]"
								>
									<Icon :name="card.icon" class="text-xl text-black" />
								</div>
								<h6 class="text-xl font-semibold">{{ card.title }}</h6>
								<p class="mt-2 mb-4 text-gray-600">
									{{ card.description }}
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Work With Us Section -->
				<div class="flex flex-wrap items-center mt-32">
					<div
						class="w-full md:w-5/12 p-6 mr-auto ml-auto bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
					>
						<div
							class="text-gray-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-gray-100"
						>
							<Icon name="mdi:users" class="text-2xl" />
						</div>
						<h3 class="text-3xl mb-2 font-semibold leading-normal">Working with us is a pleasure</h3>
						<p class="text-lg font-light leading-relaxed mt-4 mb-4 text-gray-700">
							We are here to Co-elevate. We are a team of dedicated and passionate individuals who are
							ready to learn and work together for a competitive edge to our businesses. Ultimate goal is
							to eliminate inefficiencies, lower costs, and enhance overall supply chain performance.
						</p>
					</div>

					<div class="w-full md:w-4/12 px-4 mr-auto ml-auto">
						<div
							class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-pink-600"
						>
							<img
								alt="Team Collaboration"
								src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=1051&amp;q=80"
								class="w-full align-middle rounded-t-lg"
							/>
							<blockquote class="relative p-8 mb-4">
								<svg
									preserveAspectRatio="none"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 583 95"
									class="absolute left-0 w-full block"
									style="height: 95px; top: -94px"
								>
									<polygon points="-30,95 583,95 583,65" class="text-pink-600 fill-current"></polygon>
								</svg>
								<h4 class="text-xl font-bold text-white">Top Notch Services</h4>
								<p class="text-md font-light mt-2 text-white">
									The Arctic Ocean freezes every winter and much of the sea-ice then thaws every
									summer, and that process will continue whatever happens.
								</p>
								<p class="text-md font-light mt-2 text-white">
									We are inevitable, just like the seasons. Robust Business Intelligence (BI)
									platform.
								</p>
							</blockquote>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Growing Company Section -->
		<section class="relative py-20">
			<!-- Wave SVG Divider -->
			<div
				class="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20"
				style="height: 80px"
			>
				<svg
					class="absolute bottom-0 overflow-hidden"
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="none"
					version="1.1"
					viewBox="0 0 2560 100"
					x="0"
					y="0"
				>
					<polygon class="text-white fill-current" points="2560 0 2560 100 0 100"></polygon>
				</svg>
			</div>

			<div class="container mx-auto px-4">
				<div class="items-center flex flex-wrap">
					<div class="w-full md:w-4/12 ml-auto mr-auto px-4">
						<img
							alt="Business Growth"
							class="max-w-full rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
							src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=634&amp;q=80"
						/>
					</div>
					<div class="w-full md:w-5/12 ml-auto mr-auto px-4">
						<div class="md:pr-12">
							<div class="flex w-full justify-start sm:justify-center md:justify-start sm:mt-6">
								<div
									class="text-pink-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-pink-300 sm:mx-auto md:mx-0"
								>
									<Icon name="mdi:rocket" class="text-2xl" />
								</div>
							</div>
							<h3 class="text-3xl font-semibold">A growing company</h3>
							<p class="mt-4 text-lg leading-relaxed text-gray-600">
								We are currently working on a lot of capabilities and functionalities. Stay tuned!
							</p>
							<ul class="list-none mt-6">
								<!-- Feature List Items (Dynamically rendered) -->
								<li v-for="feature in featuresList" :key="feature.id" class="py-2">
									<div class="flex items-center">
										<div>
											<span
												class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3"
											>
												<Icon :name="feature.icon" class="text-xl text-black" />
											</span>
										</div>
										<div>
											<h4 class="text-gray-600">{{ feature.text }}</h4>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Team Section -->
		<section class="pt-20 pb-48">
			<div class="container mx-auto px-4">
				<div class="flex flex-wrap justify-center text-center mb-24">
					<div class="w-full lg:w-6/12 px-4">
						<h2 class="text-4xl font-semibold">This is some of us</h2>
						<p class="text-lg leading-relaxed m-4 text-gray-600">SUTIT.ORG</p>
					</div>
				</div>

				<!-- Team Members Grid (Dynamically rendered) -->
				<div class="flex flex-wrap">
					<div v-for="member in teamMembers" :key="member.id" class="w-6/12 lg:w-3/12 lg:mb-0 mb-12 px-4">
						<div class="px-6">
							<img
								:alt="member.name"
								:src="member.image"
								class="shadow-lg rounded-full max-w-full mx-auto transition-transform duration-300 hover:scale-110"
								style="max-width: 120px"
							/>
							<div class="pt-6 text-center">
								<h5 class="text-xl font-bold">{{ member.name }}</h5>
								<p class="mt-1 text-sm text-gray-500 uppercase font-semibold">{{ member.role }}</p>
								<div class="mt-6">
									<!-- Social Media Buttons (Dynamically rendered) -->
									<button
										v-for="(social, index) in member.socials"
										:key="index"
										:class="[
											social.bgColor,
											'text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1 transition-transform duration-300 hover:scale-125',
										]"
										type="button"
										:aria-label="social.platform"
									>
										<Icon :name="social.icon" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Service Section -->
		<section class="pb-20 relative block bg-gray-900">
			<!-- Wave SVG Divider -->
			<div
				class="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20"
				style="height: 80px"
			>
				<svg
					class="absolute bottom-0 overflow-hidden"
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="none"
					version="1.1"
					viewBox="0 0 2560 100"
					x="0"
					y="0"
				>
					<polygon class="text-gray-900 fill-current" points="2560 0 2560 100 0 100"></polygon>
				</svg>
			</div>

			<div class="container mx-auto px-4 lg:pt-24 lg:pb-64">
				<div class="flex flex-wrap justify-center">
					<div class="w-full lg:w-6/12 px-4">
						<h2 class="text-4xl font-semibold text-white">Build something</h2>
						<p class="text-lg leading-relaxed mb-8 text-gray-300 max-w-3xl mx-auto">
							Be among the first and get early access to our platform.
						</p>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
							<div class="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
								<h3 class="text-xl font-semibold mb-3 text-white">Payment Integration</h3>
								<p class="text-gray-300">
									Use our API to integrate payments into your platform and collect payments from your
									clients.
								</p>
							</div>

							<div class="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
								<h3 class="text-xl font-semibold mb-3 text-white">Form Builder</h3>
								<p class="text-gray-300">
									Use our Forms to collect payments and data from your clients with ease.
								</p>
							</div>

							<div class="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
								<h3 class="text-xl font-semibold mb-3 text-white">WhatsApp Business</h3>
								<p class="text-gray-300">
									Use our WhatsApp Business Integration to collect payments from your clients.
								</p>
							</div>

							<div class="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
								<h3 class="text-xl font-semibold mb-3 text-white">Analytics Dashboard</h3>
								<p class="text-gray-300">
									Use our Dashboard to view and manage your transactions, trends and reports.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Contact Form Section -->
		<section class="relative block py-24 lg:pt-0 bg-gray-900">
			<div class="container mx-auto px-4">
				<div class="flex flex-wrap justify-center lg:-mt-64 -mt-32">
					<div class="w-full lg:w-6/12 px-4">
						<div
							class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300"
						>
							<div class="flex-auto p-5 lg:p-10">
								<h4 class="text-2xl font-semibold">Want to work with us?</h4>
								<p class="leading-relaxed mt-1 mb-4 text-gray-600">
									Complete this form and we will get back to you in 24 hours.
								</p>

								<form>
									<div class="relative w-full mb-3 mt-8">
										<label
											class="block uppercase text-gray-700 text-xs font-bold mb-2"
											for="full-name"
										>
											Full Name
										</label>
										<input
											type="text"
											id="full-name"
											class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full transition-all duration-300"
											placeholder="Full Name"
										/>
									</div>

									<div class="relative w-full mb-3">
										<label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="email">
											Email
										</label>
										<input
											type="email"
											id="email"
											class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full transition-all duration-300"
											placeholder="Email"
										/>
									</div>

									<div class="relative w-full mb-3">
										<label
											class="block uppercase text-gray-700 text-xs font-bold mb-2"
											for="message"
										>
											About you
										</label>
										<textarea
											id="message"
											rows="4"
											cols="80"
											class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full transition-all duration-300"
											placeholder="Tell us about yourself..."
										></textarea>
									</div>

									<div class="text-center mt-6">
										<button
											class="bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 transition-all duration-300 hover:bg-gray-800"
											type="submit"
										>
											Send Message
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
