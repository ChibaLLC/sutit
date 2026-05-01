<template>
  <div class="bg-background min-h-screen">
    <div class="container mx-auto max-w-4xl p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
        <p class="text-muted-foreground mt-2">Manage your account settings and preferences</p>
      </div>

      <div class="grid gap-6">
        <!-- Profile Settings -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <User class="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="name">Full Name</Label>
                <Input id="name" v-model="profile.name" placeholder="Enter your name" />
              </div>
              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  v-model="profile.email"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="phone">Phone Number</Label>
              <Input id="phone" v-model="profile.phone" placeholder="+1 (555) 123-4567" />
            </div>
          </CardContent>
          <CardFooter>
            <Button @click="saveProfile">Save Changes</Button>
          </CardFooter>
        </Card>

        <!-- Notifications -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Bell class="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label class="text-base">Email Notifications</Label>
                <p class="text-muted-foreground text-sm">Receive notifications via email</p>
              </div>
              <Switch v-model:checked="notifications.email" />
            </div>
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label class="text-base">Push Notifications</Label>
                <p class="text-muted-foreground text-sm">Receive push notifications in browser</p>
              </div>
              <Switch v-model:checked="notifications.push" />
            </div>
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label class="text-base">Form Responses</Label>
                <p class="text-muted-foreground text-sm">
                  Get notified when someone submits a form
                </p>
              </div>
              <Switch v-model:checked="notifications.formResponses" />
            </div>
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label class="text-base">Weekly Reports</Label>
                <p class="text-muted-foreground text-sm">Receive weekly analytics reports</p>
              </div>
              <Switch v-model:checked="notifications.weeklyReports" />
            </div>
          </CardContent>
        </Card>

        <!-- Payment Settings -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <CreditCard class="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription
              >Configure your payment methods and billing information</CardDescription
            >
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="paymentPhone">Payment Phone Number</Label>
                <Input id="paymentPhone" v-model="payment.phoneNumber" placeholder="254712345678" />
              </div>
              <div class="space-y-2">
                <Label for="tillNumber">Till Number</Label>
                <Input id="tillNumber" v-model="payment.tillNumber" placeholder="123456" />
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="paybill">Paybill Number</Label>
                <Input id="paybill" v-model="payment.paybill" placeholder="400200" />
              </div>
              <div class="space-y-2">
                <Label for="accountNumber">Account Number</Label>
                <Input id="accountNumber" v-model="payment.accountNumber" placeholder="ACC123456" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button @click="savePayment">Update Payment Info</Button>
          </CardFooter>
        </Card>

        <!-- Connected Accounts -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Link class="h-5 w-5" />
              Connected Accounts
            </CardTitle>
            <CardDescription>Manage your OAuth connections and integrations</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-for="account in connectedAccounts"
              :key="account.name"
              class="flex items-center justify-between rounded-lg border p-4"
            >
              <div class="flex items-center gap-3">
                <div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <component :is="account.icon" class="h-5 w-5" />
                </div>
                <div>
                  <p class="font-medium">{{ account.name }}</p>
                  <p class="text-muted-foreground text-sm">
                    {{ account.description }}
                  </p>
                </div>
              </div>
              <Button
                :variant="account.connected ? 'outline' : 'default'"
                @click="toggleConnection(account)"
              >
                {{ account.connected ? "Disconnect" : "Connect" }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Form Integrations -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <FileText class="h-5 w-5" />
              Form Integrations
            </CardTitle>
            <CardDescription>Connect with external form platforms and services</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-for="integration in formIntegrations"
              :key="integration.name"
              class="flex items-center justify-between rounded-lg border p-4"
            >
              <div class="flex items-center gap-3">
                <div class="bg-secondary flex h-10 w-10 items-center justify-center rounded-full">
                  <component :is="integration.icon" class="h-5 w-5" />
                </div>
                <div>
                  <p class="font-medium">{{ integration.name }}</p>
                  <p class="text-muted-foreground text-sm">
                    {{ integration.description }}
                  </p>
                </div>
              </div>
              <Button
                :variant="integration.connected ? 'outline' : 'default'"
                @click="toggleIntegration(integration)"
              >
                {{ integration.connected ? "Disconnect" : "Connect" }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Security Settings -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield class="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription
              >Manage your account security and two-factor authentication</CardDescription
            >
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label class="text-base">Two-Factor Authentication</Label>
                <p class="text-muted-foreground text-sm">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch v-model:checked="security.twoFactor" />
            </div>
            <div v-if="security.twoFactor" class="border-primary/20 space-y-4 border-l-2 pl-4">
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label class="text-sm">SMS Authentication</Label>
                  <p class="text-muted-foreground text-xs">Receive codes via SMS</p>
                </div>
                <Switch v-model:checked="security.sms" />
              </div>
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label class="text-sm">Authenticator App</Label>
                  <p class="text-muted-foreground text-xs">Use Google Authenticator or similar</p>
                </div>
                <Switch v-model:checked="security.authenticator" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button @click="saveSecurity">Update Security Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    User,
    Bell,
    CreditCard,
    Link,
    FileText,
    Shield,
    Github,
    Chrome,
    Zap,
    Database,
  } from "lucide-vue-next";
  import { ref, reactive } from "vue";

  import { Button } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Switch } from "@/components/ui/switch";

  // Profile data
  const profile = reactive({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
  });

  // Notification settings
  const notifications = reactive({
    email: true,
    push: false,
    formResponses: true,
    weeklyReports: true,
  });

  // Payment settings
  const payment = reactive({
    phoneNumber: "254712345678",
    tillNumber: "123456",
    paybill: "400200",
    accountNumber: "ACC123456",
  });

  // Security settings
  const security = reactive({
    twoFactor: false,
    sms: false,
    authenticator: false,
  });

  // Connected accounts
  const connectedAccounts = ref([
    {
      name: "Google",
      description: "Connect with Google services",
      icon: Chrome,
      connected: false,
    },
    {
      name: "GitHub",
      description: "Connect with GitHub for authentication",
      icon: Github,
      connected: true,
    },
    {
      name: "Microsoft",
      description: "Connect with Microsoft services",
      icon: User,
      connected: false,
    },
  ]);

  // Form integrations
  const formIntegrations = ref([
    {
      name: "Google Forms",
      description: "Import and sync with Google Forms",
      icon: Chrome,
      connected: false,
    },
    {
      name: "Typeform",
      description: "Connect with Typeform platform",
      icon: FileText,
      connected: false,
    },
    {
      name: "Airtable",
      description: "Sync form responses to Airtable",
      icon: Database,
      connected: true,
    },
    {
      name: "Zapier",
      description: "Automate workflows with Zapier",
      icon: Zap,
      connected: false,
    },
  ]);

  // Methods
  const saveProfile = () => {
    console.log("Saving profile:", profile);
    // Add save logic here
  };

  const savePayment = () => {
    console.log("Saving payment info:", payment);
    // Add save logic here
  };

  const saveSecurity = () => {
    console.log("Saving security settings:", security);
    // Add save logic here
  };

  const toggleConnection = (account: any) => {
    account.connected = !account.connected;
    console.log(`${account.name} ${account.connected ? "connected" : "disconnected"}`);
    // Add OAuth connection logic here
  };

  const toggleIntegration = (integration: any) => {
    integration.connected = !integration.connected;
    console.log(`${integration.name} ${integration.connected ? "connected" : "disconnected"}`);
    // Add integration logic here
  };
</script>
