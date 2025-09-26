// composables/useFormSEO.ts

import type { FormSchema } from "~~/shared/types";

interface SEOOptions {
	siteName?: string;
	baseUrl?: string;
	defaultImage?: string;
	twitterHandle?: string;
	locale?: string;
	type?: "website" | "article" | "product";
}

export const useFormSEO = (
	form: FormSchema | null,
	options: SEOOptions = {},
) => {
	const runtime = useRuntimeConfig();
	const {
		siteName = "Sutit",
		baseUrl = runtime.public.publicUrl,
		defaultImage = "/form.png",
		twitterHandle = "@sutit",
		locale = "en_US",
		type = "website",
	} = options;

	const generateSEO = () => {
		if (!form) return;

		// Generate dynamic title and description
		const title = form.title ? `${form.title} - ${siteName}` : siteName;
		const description =
			form.description ||
			`Register for ${form.title}. ${form.price > 0 ? `Starting at Kes ${form.price.toLocaleString()}` : "Free registration"}. ${form.allowGroups ? "Individual and group options available." : ""}`;

		// Generate keywords from form data
		const keywords = [
			form.title,
			...(form.tags || []),
			"registration",
			"form",
			"event",
			form.allowGroups ? "group registration" : "individual registration",
			form.price > 0 ? "paid event" : "free event",
			...(form.stores?.map((store) => store.name) || []),
		]
			.filter(Boolean)
			.join(", ");

		// Canonical URL
		const canonicalUrl = `${baseUrl}/forms/${form.slug || form.id}`;

		// Open Graph image with fallback
		const ogImage = form.featuredImage
			? form.featuredImage.startsWith("http")
				? form.featuredImage
				: `${baseUrl}${form.featuredImage}`
			: `${baseUrl}${defaultImage}`;

		// Use useSeoMeta for better social media support
		useSeoMeta({
			// Basic meta tags
			title,
			description,
			keywords,
			author: siteName,
			robots: form.isPublic
				? "index,follow,max-image-preview:large"
				: "noindex,nofollow",

			// Open Graph tags for Facebook, LinkedIn, etc.
			ogType: form.price > 0 ? "event" : type,
			ogTitle: title,
			ogDescription: description,
			ogUrl: canonicalUrl,
			ogImage: ogImage,
			ogImageAlt: `${form.title} - Registration Form`,
			ogSiteName: siteName,
			ogLocale: locale,

			// Twitter Card tags
			twitterCard: "summary_large_image",
			twitterSite: twitterHandle,
			twitterCreator: twitterHandle,
			twitterTitle: title,
			twitterDescription: description,
			twitterImage: ogImage,
			twitterImageAlt: `${form.title} - Registration Form`,

			// Additional meta tags for better SEO
			themeColor: "#2563eb",
			colorScheme: "light dark",
			viewport: "width=device-width, initial-scale=1",

			// Schema.org structured data
			schema: [
				{
					"@context": "https://schema.org",
					"@type": form.price > 0 ? "Event" : "WebPage",
					name: form.title,
					description: form.description,
					url: canonicalUrl,
					image: ogImage,
					...(form.price > 0 && {
						offers: {
							"@type": "Offer",
							price: form.price,
							priceCurrency: "KES",
							availability:
								form.status === "published"
									? "https://schema.org/InStock"
									: "https://schema.org/OutOfStock",
							validFrom: form.publishedAt,
						},
					}),
					...(form.allowGroups && {
						additionalType: "https://schema.org/SocialEvent",
						maximumAttendeeCapacity: form.groupMemberLimit,
					}),
					organizer: {
						"@type": "Organization",
						name: siteName,
						url: baseUrl,
					},
					...(form.publishedAt && {
						startDate: form.publishedAt,
						eventStatus: "https://schema.org/EventScheduled",
					}),
					...(form.stores?.length && {
						location: form.stores.map((store) => ({
							"@type": "Place",
							name: store.name,
							address: store.address,
						})),
					}),
					keywords: form.tags?.join(", "),
					isAccessibleForFree: form.price === 0,
				},
				// BreadcrumbList schema
				{
					"@context": "https://schema.org",
					"@type": "BreadcrumbList",
					itemListElement: [
						{
							"@type": "ListItem",
							position: 1,
							name: "Home",
							item: baseUrl,
						},
						{
							"@type": "ListItem",
							position: 2,
							name: "Forms",
							item: `${baseUrl}/forms`,
						},
						{
							"@type": "ListItem",
							position: 3,
							name: form.title,
							item: canonicalUrl,
						},
					],
				},
			],
		});

		// Set link tags
		useHead({
			htmlAttrs: {
				lang: "en",
			},
			link: [
				{ rel: "canonical", href: canonicalUrl },
				{
					rel: "alternate",
					type: "application/rss+xml",
					href: `${baseUrl}/feeds/forms.xml`,
				},
				{
					rel: "icon",
					type: "image/png",
					href: "/form.png",
				},
			],
		});

		return {
			title,
			description,
			canonicalUrl,
			ogImage,
			keywords,
		};
	};

	// Server-side SEO for even better performance
	const generateServerSEO = () => {
		if (!form) return;

		const title = form.title ? `${form.title} - ${siteName}` : siteName;
		const description =
			form.description ||
			`Register for ${form.title}. ${form.price > 0 ? `Starting at Kes ${form.price.toLocaleString()}` : "Free registration"}.`;

		const canonicalUrl = `${baseUrl}/forms/${form.slug || form.id}`;
		const ogImage = form.featuredImage
			? form.featuredImage.startsWith("http")
				? form.featuredImage
				: `${baseUrl}${form.featuredImage}`
			: `${baseUrl}${defaultImage}`;

		// Use useServerSeoMeta for server-side rendering
		useServerSeoMeta({
			title,
			description,
			ogTitle: title,
			ogDescription: description,
			ogImage: ogImage,
			ogUrl: canonicalUrl,
			twitterCard: "summary_large_image",
			twitterTitle: title,
			twitterDescription: description,
			twitterImage: ogImage,
		});

		return { title, description, canonicalUrl, ogImage };
	};

	return {
		generateSEO,
		generateServerSEO,
	};
};
