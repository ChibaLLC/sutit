<template>
    <Title>Dashboard</Title>
    <Pill />
    <div class="container lg:flex-nowrap flex-wrap">
        <NuxtLink
            class="w-full lg:w-4/12 xl:w-3/12 md:w-3/12 px-4 h-[140px] hover:scale-[1.02] transition-transform duration-300"
            to="/forms">
            <div class="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg h-full">
                <div class="flex-auto p-4 h-full">
                    <div class="flex">
                        <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                            <h5 class="text-blueGray-400 uppercase font-bold">
                                Forms
                            </h5>
                            <span class="font-semibold text-xl text-blueGray-700">
                                {{ formCount }}
                            </span>
                        </div>
                        <div class="relative w-auto pl-4 flex-initial">
                            <div
                                class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-gray-500">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                    </div>
                    <p class="text-sm text-blueGray-400 mt-4">
                        <span class="whitespace-nowrap">
                            You have created
                        </span>
                        <span class="text-orange-500">
                            <i class="fas fa-arrow-down"></i> {{ formCount }}
                        </span>
                        <span class="whitespace-nowrap">
                            forms so far.
                        </span>
                    </p>
                </div>
            </div>
        </NuxtLink>
        <NuxtLink
            class="w-full lg:w-4/12 xl:w-3/12 md:w-3/12 px-4 h-[140px] hover:scale-[1.02] transition-transform duration-300"
            to="/finance">
            <div class="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg h-full">
                <div class="flex-auto p-4 h-full">
                    <div class="flex">
                        <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                            <h5 class="text-blueGray-400 uppercase font-bold">
                                Money
                            </h5>
                            <span class="font-semibold text-xl text-blueGray-700">
                                {{ moneyCount }}
                            </span>
                        </div>
                        <div class="relative w-auto pl-4 flex-initial">
                            <div
                                class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-emerald-500">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                    </div>
                    <p class="text-sm text-blueGray-400 mt-4">
                        <span class="whitespace-nowrap">
                            You have made
                        </span>
                        <span class="text-red-500">
                            <i class="fas fa-arrow-down"></i> {{ moneyCount }}
                        </span>
                        <span class="whitespace-nowrap">
                            KES so far.
                        </span>
                    </p>
                </div>
            </div>
        </NuxtLink>
        <NuxtLink
            class="w-full lg:w-4/12 xl:w-3/12 md:w-3/12 px-4 h-[140px] hover:scale-[1.02] transition-transform duration-300"
            to="/finance">
            <div class="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg h-full">
                <div class="flex-auto p-4 h-full">
                    <div class="flex">
                        <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                            <h5 class="text-blueGray-400 uppercase font-bold">
                                Reach
                            </h5>
                            <span class="font-semibold text-xl text-blueGray-700">
                                {{ reachCount }}
                            </span>
                        </div>
                        <div class="relative w-auto pl-4 flex-initial">
                            <div
                                class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-pink-500">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                    </div>
                    <p class="text-sm text-blueGray-400 mt-4">
                        <span class="whitespace-nowrap">
                            You have reached
                        </span>
                        <span class="text-red-500">
                            <i class="fas fa-arrow-down"></i> {{ reachCount }}
                        </span>
                        <span class="whitespace-nowrap">
                            people so far.
                        </span>
                    </p>
                </div>
            </div>
        </NuxtLink>
    </div>
    <div class="flex flex-col px-4 xl:px-6 mt-8 w-full">
        <h1 class="w-full xl:w-6/12 xl:px-5 lg:px-10 lg:w-full md:w-9/12 m-auto uppercase font-bold mt-1">Recents</h1>
        <ul class="w-full xl:w-6/12 xl:px-5 lg:px-10 lg:w-full md:w-9/12 m-auto recent-list"
            v-if="recents?.forms?.length">
            <li v-for="item in recents?.forms" class="flex align-middle gap-3 m-auto p-2 w-full">
                <div class="w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                        class="w-6 h-6 text-gray-500">
                        <path
                            d="M17 2V4H20.0066C20.5552 4 21 4.44495 21 4.9934V21.0066C21 21.5552 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H7V2H17ZM7 6H5V20H19V6H17V8H7V6ZM9 16V18H7V16H9ZM9 13V15H7V13H9ZM9 10V12H7V10H9ZM15 4H9V6H15V4Z">
                        </path>
                    </svg>
                </div>
                <div class="flex w-full">
                    <div class="inline-flex align-middle">
                        <h2 class="text-[#262626] text-nowrap text-ellipsis overflow-clip h-full uppercase font-semibold mr-2 mt-auto w-[100px]"
                            style="font-size: 0.85rem;">{{ item.formName }}</h2>
                        <span class="text-gray-500 text-nowrap text-ellipsis overflow-clip h-full flex-1 max-w-[200px]"
                            style="font-size: 0.85rem;">{{ item.formDescription }}</span>
                    </div>
                    <div class="inline-flex w-fit ml-auto">
                        <NuxtLink :to="`/forms/${item.ulid}`">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                class="w-6 h-6 hover:text-blue-500 text-gray-500 transition-colors">
                                <path
                                    d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z">
                                </path>
                            </svg>
                        </NuxtLink>
                        <NuxtLink :to="`/forms/${item.ulid}/edit`">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                class="w-6 h-6 hover:text-orange-500 text-gray-500 transition-colors">
                                <path
                                    d="M5 18.89H6.41421L15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89ZM21 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L9.24264 18.89H21V20.89ZM15.7279 6.74785L17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785Z">
                                </path>
                            </svg>
                        </NuxtLink>
                        <NuxtLink :to="`/forms/${item.ulid}/submissions`">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                class="w-6 h-6 hover:text-emerald-500 text-gray-500 transition-colors">
                                <path
                                    d="M13.2 12L16 16H13.6L12 13.7143L10.4 16H8L10.8 12L8 8H10.4L12 10.2857L13.6 8H15V4H5V20H19V8H16L13.2 12ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z">
                                </path>
                            </svg>
                        </NuxtLink>
                    </div>
                </div>
            </li>
        </ul>
        <div v-else class="w-full xl:w-6/12 xl:px-5 lg:px-10 lg:w-full md:w-9/12 m-auto mt-2">
            <p class="text-center text-gray-500">You have not created any forms yet. <NuxtLink to="/forms/create"
                    class="text-blue-500">Create one now</NuxtLink>
            </p>
        </div>
    </div>
    <div class="flex flex-col px-4 xl:px-6 mt-8">
        <h1 class="w-full xl:w-6/12 xl:px-5 lg:px-10 lg:w-full md:w-9/12 m-auto uppercase font-bold mt-1">Actions</h1>
        <ul class="w-full xl:w-6/12 xl:px-5 lg:px-10 lg:w-full md:w-9/12 m-auto mt-2 text-center">
            <li class="py-2 bg-emerald-700 text-white rounded hover:bg-emerald-600 transition-colors w-40 font-semibold uppercase"
                style="font-size: smaller;">
                <NuxtLink to="/forms/create">Create A Form</NuxtLink>
            </li>
        </ul>
    </div>
</template>
<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

const formCount = ref(0);
const moneyCount = ref(0);
const reachCount = ref(0);

const stats = await useFetch<APIResponse<{ forms: number, responses: number, earnings: number }>>("/api/v1/forms/me/stats", {
    headers: {
        Authorization: `Bearer ${getAuthToken()}`,
    },
    onResponseError({ response }) {
        console.error(response)
    },
    onRequestError({ error }) {
        console.error(error)
    }
}).then(({ data }) => data.value?.body).catch(err => { return {} as any; })
formCount.value = stats?.forms || 0;
moneyCount.value = stats?.earnings || 0;
reachCount.value = stats?.responses || 0;
const recents = await useFetch<APIResponse<{ forms: Drizzle.Form.select[] }>>(`/api/v1/forms/me/recents`, {
    headers: {
        "Authorization": `Bearer ${getAuthToken()}`
    },
    onResponseError({ error }) {
        console.error(error);
    },
    onRequestError({ error }) {
        console.error(error);
    }
}).then(({ data }) => data.value?.body).catch(err => {
    return { forms: [] } as { forms: Drizzle.Form.select[] };
})
</script>
<style scoped lang="scss">
.container {
    max-width: 1200px;
    margin: auto;
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 5rem;
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