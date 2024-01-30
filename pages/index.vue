<template>
    <Title>Home</Title>
    <h1>Home</h1>
    <ClientOnly>
        <pre>{{ response }}</pre>
    </ClientOnly>
</template>
<script setup lang="ts">
const response = await useFetch("/api/v1").catch((err) => {
    console.error(err);
});

if(process.client) console.log(response);
</script>