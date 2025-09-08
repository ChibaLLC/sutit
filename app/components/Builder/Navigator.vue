<script setup lang="ts"></script>
<template>
  <div class="justify-center px-6 py-4">
    <Tabs default-value="pages">
      <TabsList>
        <TabsTrigger value="pages"> Pages </TabsTrigger>
        <TabsTrigger value="stores"> Stores </TabsTrigger>
        <TabsTrigger value="settings"> Settings </TabsTrigger>
      </TabsList>
      <TabsContent value="pages">
        <slot name="pages" />
      </TabsContent>
      <TabsContent value="stores">
        <slot name="stores" />
      </TabsContent>
      <TabsContent value="settings">
        <slot name="settings" />
      </TabsContent>
    </Tabs>
  </div>
</template>
