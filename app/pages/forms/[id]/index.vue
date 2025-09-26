<script setup lang="ts">
import { toast } from "vue-sonner";
import { Users, User, ArrowRight, Clock, DollarSign } from "lucide-vue-next";
import { authHeaders } from "~/lib/auth-client";
import { useFormSEO } from "~/composables/seo/useFormSeo";

const route = useRoute();
const router = useRouter();

const { data } = await useFetch(`/api/forms/${route.params.id}`, {
  key: `form-${route.params.id}`,
});
const { generateSEO } = useFormSEO(data.value);
generateSEO();
const hasToken = computed(() => !!route.query.token);

const showGroupSelection = computed(
  () => data.value?.allowGroups && !hasToken.value,
);
const showSelection = ref(showGroupSelection.value);

const submit = async (form: object) => {
  try {
    const { data: submitData, message } = await $fetch(
      `/api/forms/${route.params.id}/submit`,
      {
        method: "post",
        body: form,
        headers: {
          ...(await authHeaders()),
        },
      },
    );
    if (submitData) {
      toast.success(message);
      if (!submitData.payment) {
        await navigateTo(`/forms/${route.params.id}/submitted`);
        return;
      }
      try {
        const result = await checkPayment(submitData.payment.checkoutId);
        toast.success("Payment completed!");

        await navigateTo(`/forms/${route.params.id}/submitted`);
      } catch (e) {
        toast.error(e.message ?? "An error occurred");
      }
    }
  } catch (e) {}
};

const checkPayment = async (
  checkoutId: string,
  maxRetries = 10,
  interval = 3000,
) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const res = await $fetch(`/api/payments/${checkoutId}`);
      if (res.success && res.data && res.data.status == "completed") {
        return res;
      }
    } catch (err) {
      console.error("Check payment error:", err);
    }
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("Payment not completed in time. Please try again later.");
};

const handleGroupInvite = () => {
  navigateTo(`/forms/${route.params.id}/group/invite`);
};

const handleIndividualFill = () => {
  showSelection.value = false;
};
</script>

<template>
  <div>
    <!-- Group Selection Interface -->
    <div
      v-if="showSelection"
      class="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div class="w-full max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-foreground mb-4">
            {{ data?.title }}
          </h1>
          <p
            v-if="data?.description"
            class="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {{ data.description }}
          </p>
        </div>

        <!-- Selection Cards -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Individual Registration Card -->
          <Card
            class="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
          >
            <CardContent class="p-8">
              <div class="flex items-center gap-4 mb-6">
                <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <User class="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-foreground">
                    Fill for Yourself
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    Individual registration
                  </p>
                </div>
              </div>

              <div class="space-y-4 mb-8">
                <div
                  class="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <Clock class="w-4 h-4" />
                  <span>Quick and simple process</span>
                </div>
                <div
                  class="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <DollarSign class="w-4 h-4" />
                  <span
                    >Pay:
                    {{
                      data?.price
                        ? `Kes ${data.price.toLocaleString()}`
                        : "Free"
                    }}</span
                  >
                </div>
              </div>

              <Button
                @click="handleIndividualFill"
                class="w-full group"
                size="lg"
              >
                <span>Start Registration</span>
                <ArrowRight
                  class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </CardContent>
          </Card>

          <!-- Group Registration Card -->
          <Card
            class="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
          >
            <CardContent class="p-8">
              <div class="flex items-center gap-4 mb-6">
                <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                  <Users class="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-foreground">
                    Create Group
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    Register multiple people
                  </p>
                </div>
              </div>

              <div class="space-y-4 mb-8">
                <div
                  class="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <Users class="w-4 h-4" />
                  <span
                    >Up to
                    {{ data?.groupMemberLimit || "unlimited" }} members</span
                  >
                </div>
                <div
                  class="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <DollarSign class="w-4 h-4" />
                  <span>
                    Group rate:
                    {{
                      data?.groupAmountPayable
                        ? `Kes ${data.groupAmountPayable.toLocaleString()}`
                        : "Contact us"
                    }}
                  </span>
                </div>
              </div>

              <Button
                @click="handleGroupInvite"
                variant="outline"
                class="w-full group border-2"
                size="lg"
              >
                <span>Create Group</span>
                <ArrowRight
                  class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </CardContent>
          </Card>
        </div>

        <!-- Info Message -->
        <!-- <div v-if="data?.infoPromptMessage" class="mt-8"> -->
        <!--   <Alert class="max-w-2xl mx-auto"> -->
        <!--     <AlertDescription class="text-center"> -->
        <!--       {{ data.infoPromptMessage }} -->
        <!--     </AlertDescription> -->
        <!--   </Alert> -->
        <!-- </div> -->

        <!-- Additional Info -->
        <div class="mt-12 text-center">
          <div
            class="flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap"
          >
            <div v-if="data?.submissionLimit" class="flex items-center gap-2">
              <Clock class="w-4 h-4" />
              <span>Limited to {{ data.submissionLimit }} submissions</span>
            </div>
            <div v-if="data?.requiresLogin" class="flex items-center gap-2">
              <User class="w-4 h-4" />
              <span>Login required</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Regular Form Renderer -->
    <div v-else>
      <!-- Show indicator for individual registration (both token and manual selection) -->
      <div
        v-if="hasToken"
        class="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800"
      >
        <div class="container mx-auto px-4 py-3">
          <div class="flex items-center justify-between">
            <div
              class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300"
            >
              <User class="w-4 h-4" />
              <span class="font-medium">Individual Registration</span>
              <span class="text-blue-600 dark:text-blue-400">
                •
                {{
                  hasToken ? "Filling for yourself" : "Personal registration"
                }}
              </span>
            </div>
            <!-- Back button for manual selection (not for token users) -->
            <Button
              v-if="!hasToken && data?.allowGroups"
              @click="showSelection = true"
              variant="ghost"
              size="sm"
              class="text-blue-700 dark:text-blue-300"
            >
              ← Back to options
            </Button>
          </div>
        </div>
      </div>

      <BuilderRendererFormRenderer :form="data" @submit="submit" />
    </div>
  </div>
</template>
