<template>
  <div class="min-h-screen bg-background py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Vertical Stepper Navigation -->
        <div class="lg:col-span-1">
          <Card class="sticky top-8">
            <CardContent class="p-6">
              <div class="space-y-6">
                <div class="text-center">
                  <h3 class="font-semibold text-lg">Progress</h3>
                  <p class="text-sm text-muted-foreground">
                    Step {{ currentStep + 1 }} of {{ totalSteps }}
                  </p>
                </div>

                <Progress
                  :value="((currentStep + 1) / totalSteps) * 100"
                  class="h-2"
                />

                <!-- Vertical Step List -->
                <div class="space-y-4">
                  <!-- Form Pages -->
                  <div
                    v-for="(page, index) in form.pages"
                    :key="page.id"
                    class="flex items-center gap-3"
                  >
                    <div
                      class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shrink-0"
                      :class="getStepClasses(index)"
                    >
                      <CheckCircle v-if="index < currentStep" class="w-4 h-4" />
                      <div
                        v-else-if="index === currentStep"
                        class="w-2 h-2 bg-current rounded-full animate-pulse"
                      ></div>
                      <span v-else class="text-xs font-semibold">{{
                        index + 1
                      }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium truncate"
                        :class="
                          index <= currentStep
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        "
                      >
                        {{ page.title }}
                      </p>
                      <p class="text-xs text-muted-foreground">Form Page</p>
                    </div>
                  </div>

                  <!-- Product Selection Step -->
                  <div
                    v-if="form.stores && form.stores.length > 0"
                    class="flex items-center gap-3"
                  >
                    <div
                      class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shrink-0"
                      :class="getProductStepClasses()"
                    >
                      <CheckCircle
                        v-if="currentStep > form.pages.length"
                        class="w-4 h-4"
                      />
                      <ShoppingCart
                        v-else-if="isProductSelectionStep"
                        class="w-4 h-4"
                      />
                      <Package v-else class="w-4 h-4" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium"
                        :class="
                          currentStep >= form.pages.length
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        "
                      >
                        Select Products
                      </p>
                      <p class="text-xs text-muted-foreground">Choose Items</p>
                    </div>
                  </div>

                  <!-- Preview Step -->
                  <div class="flex items-center gap-3">
                    <div
                      class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shrink-0"
                      :class="getPreviewStepClasses()"
                    >
                      <CheckCircle
                        v-if="currentStep > getPreviewStepIndex()"
                        class="w-4 h-4"
                      />
                      <Receipt v-else-if="isPreviewStep" class="w-4 h-4" />
                      <span v-else class="text-xs font-semibold">✓</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium"
                        :class="
                          currentStep >= getPreviewStepIndex()
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        "
                      >
                        Review
                      </p>
                      <p class="text-xs text-muted-foreground">Check Details</p>
                    </div>
                  </div>

                  <!-- Checkout Step -->
                  <div v-if="form.price > 0" class="flex items-center gap-3">
                    <div
                      class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shrink-0"
                      :class="getCheckoutStepClasses()"
                    >
                      <CheckCircle
                        v-if="currentStep > getCheckoutStepIndex()"
                        class="w-4 h-4"
                      />
                      <CreditCard v-else-if="isCheckoutStep" class="w-4 h-4" />
                      <span v-else class="text-xs font-semibold">$</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium"
                        :class="
                          currentStep >= getCheckoutStepIndex()
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        "
                      >
                        M-Pesa Payment
                      </p>
                      <p class="text-xs text-muted-foreground">
                        Complete Payment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Header -->
          <div class="text-center mb-8">
            <Badge v-if="form.price > 0" variant="secondary" class="mb-4">
              <CreditCard class="w-3 h-3 mr-1" />
              Paid Form - KSh {{ (form.price * 1).toFixed(2) }}
            </Badge>
            <h1 class="text-2xl md:text-4xl font-bold text-foreground mb-3">
              {{ form.title }}
            </h1>
            <p
              v-if="form.description"
              class="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
            >
              {{ form.description }}
            </p>
          </div>

          <!-- Form Content -->
          <Card class="shadow-lg border bg-card">
            <CardContent class="p-4 md:p-8">
              <!-- Form Pages -->
              <div v-if="currentStep < form.pages.length" class="space-y-8">
                <!-- Page Header -->
                <div class="text-center space-y-3">
                  <Badge variant="outline" class="mb-2">
                    Page {{ currentStep + 1 }}
                  </Badge>
                  <h2
                    class="text-2xl md:text-3xl font-semibold text-card-foreground"
                  >
                    {{ currentPage.title }}
                  </h2>
                  <p
                    v-if="currentPage.description"
                    class="text-muted-foreground text-base md:text-lg max-w-xl mx-auto"
                  >
                    {{ currentPage.description }}
                  </p>
                </div>

                <Separator />

                <form @submit.prevent="handleNext" class="space-y-8">
                  <!-- Field Grid -->
                  <div class="grid gap-6 grid-cols-1">
                    <div
                      v-for="field in currentPage.fields"
                      :key="field.id"
                      class="group"
                      :class="getFieldClasses(field)"
                    >
                      <!-- Text Input -->
                      <div
                        v-if="
                          field.type === 'text' ||
                          field.type === 'email' ||
                          field.type === 'phone' ||
                          field.type === 'date'
                        "
                        class="space-y-3"
                      >
                        <Label
                          :for="field.id"
                          class="text-sm font-semibold flex items-center gap-2"
                        >
                          {{ field.label }}
                          <Badge
                            v-if="field.required"
                            variant="destructive"
                            class="text-xs px-1.5 py-0.5"
                            >Required</Badge
                          >
                        </Label>
                        <Input
                          :id="field.id"
                          v-model="formData[field.id]"
                          :type="getInputType(field.type)"
                          :placeholder="field.placeholder"
                          :required="field.required"
                          class="h-12 transition-all duration-200"
                        />
                      </div>
                      <!-- File Input -->
                      <div v-else-if="field.type === 'file'" class="space-y-3">
                        <Label
                          :for="field.id"
                          class="text-sm font-semibold flex items-center gap-2"
                        >
                          {{ field.label }}
                          <Badge
                            v-if="field.required"
                            variant="destructive"
                            class="text-xs px-1.5 py-0.5"
                          >
                            Required
                          </Badge>
                        </Label>

                        <div class="space-y-2">
                          <Input
                            :id="field.id"
                            type="file"
                            :multiple="field.multiple || false"
                            :required="field.required"
                            :accept="field.accept || '*/*'"
                            class="h-12 transition-all duration-200 cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            @change="
                              handleFileChange(
                                $event,
                                field.id,
                                field.multiple || false,
                              )
                            "
                          />

                          <!-- File Preview -->
                          <div
                            v-if="getSelectedFiles(field.id).length > 0"
                            class="space-y-2"
                          >
                            <p class="text-sm text-muted-foreground">
                              Selected files:
                            </p>
                            <div class="space-y-1">
                              <div
                                v-for="(file, index) in getSelectedFiles(
                                  field.id,
                                )"
                                :key="index"
                                class="flex items-center justify-between p-2 bg-muted rounded-md"
                              >
                                <div
                                  class="flex items-center gap-2 flex-1 min-w-0"
                                >
                                  <div
                                    class="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center shrink-0"
                                  >
                                    <File class="w-4 h-4 text-primary" />
                                  </div>
                                  <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium truncate">
                                      {{ file.name }}
                                    </p>
                                    <p class="text-xs text-muted-foreground">
                                      {{ formatFileSize(file.size) }}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  @click="
                                    removeFile(
                                      field.id,
                                      index,
                                      field.multiple || false,
                                    )
                                  "
                                  class="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <X class="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <!-- Upload Instructions -->
                          <p class="text-sm text-muted-foreground">
                            {{
                              field.multiple
                                ? "Select one or more files"
                                : "Select a file"
                            }}
                            {{ field.accept ? `(${field.accept})` : "" }}
                          </p>
                        </div>
                      </div>

                      <!-- Textarea -->
                      <div
                        v-else-if="field.type === 'textarea'"
                        class="space-y-3"
                      >
                        <Label
                          :for="field.id"
                          class="text-sm font-semibold flex items-center gap-2"
                        >
                          {{ field.label }}
                          <Badge
                            v-if="field.required"
                            variant="destructive"
                            class="text-xs px-1.5 py-0.5"
                            >Required</Badge
                          >
                        </Label>
                        <Textarea
                          :id="field.id"
                          v-model="formData[field.id]"
                          :placeholder="field.placeholder"
                          :required="field.required"
                          class="min-h-[120px] transition-all duration-200 resize-none"
                        />
                      </div>

                      <!-- Select -->
                      <div
                        v-else-if="field.type === 'select'"
                        class="space-y-3"
                      >
                        <Label
                          :for="field.id"
                          class="text-sm font-semibold flex items-center gap-2"
                        >
                          {{ field.label }}
                          <Badge
                            v-if="field.required"
                            variant="destructive"
                            class="text-xs px-1.5 py-0.5"
                            >Required</Badge
                          >
                        </Label>
                        <Select v-model="formData[field.id]">
                          <SelectTrigger
                            class="h-12 transition-all duration-200"
                          >
                            <SelectValue
                              :placeholder="
                                field.placeholder || 'Select an option'
                              "
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="option in field.options"
                              :key="option"
                              :value="option"
                              class="cursor-pointer"
                            >
                              {{ option }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <!-- Checkbox -->
                      <div
                        v-else-if="field.type === 'checkbox'"
                        class="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          :id="field.id"
                          v-model:checked="formData[field.id]"
                          class="mt-0.5"
                        />
                        <div class="space-y-1">
                          <Label
                            :for="field.id"
                            class="text-sm font-medium cursor-pointer flex items-center gap-2"
                          >
                            {{ field.label }}
                            <Badge
                              v-if="field.required"
                              variant="destructive"
                              class="text-xs px-1.5 py-0.5"
                              >Required</Badge
                            >
                          </Label>
                        </div>
                      </div>
                      <div
                        v-else-if="field.type === 'toggle'"
                        class="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <Label
                          class="text-sm font-semibold flex items-center gap-2"
                        >
                          {{ field.label }}
                          <Badge
                            v-if="field.required"
                            variant="destructive"
                            class="text-xs px-1.5 py-0.5"
                            >Required</Badge
                          >
                        </Label>
                        <Switch v-model="formData[field.id]" class="mt-0" />
                      </div>
                      <!-- Radio Group -->
                      <div v-else-if="field.type === 'radio'" class="space-y-4">
                        <Label
                          class="text-sm font-semibold flex items-center gap-2"
                        >
                          {{ field.label }}
                          <Badge
                            v-if="field.required"
                            variant="destructive"
                            class="text-xs px-1.5 py-0.5"
                            >Required</Badge
                          >
                        </Label>
                        <RadioGroup
                          v-model="formData[field.id]"
                          class="space-y-3"
                        >
                          <div
                            v-for="option in field.options"
                            :key="option"
                            class="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem
                              :id="`${field.id}-${option}`"
                              :value="option"
                            />
                            <Label
                              :for="`${field.id}-${option}`"
                              class="cursor-pointer font-medium"
                              >{{ option }}</Label
                            >
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <!-- Navigation Buttons -->
                  <div
                    class="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4"
                  >
                    <Button
                      v-if="currentStep > 0"
                      type="button"
                      variant="outline"
                      size="lg"
                      @click="handlePrevious"
                      class="w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200"
                    >
                      <ChevronLeft class="w-4 h-4" />
                      Previous
                    </Button>
                    <div v-else class="hidden sm:block"></div>

                    <Button
                      type="submit"
                      size="lg"
                      class="w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200"
                    >
                      {{ getNextButtonText() }}
                      <ChevronRight class="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>

              <!-- Product Selection Page -->
              <div v-else-if="isProductSelectionStep" class="space-y-8">
                <div class="text-center space-y-4">
                  <div
                    class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
                  >
                    <ShoppingCart class="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h2
                      class="text-2xl md:text-3xl font-semibold text-card-foreground mb-2"
                    >
                      Select Products
                    </h2>
                    <p class="text-muted-foreground text-base md:text-lg">
                      Choose products from our available stores
                    </p>
                  </div>
                </div>

                <Separator />

                <!-- Store Products -->
                <div class="space-y-8">
                  <div
                    v-for="store in form.stores"
                    :key="store.id"
                    class="space-y-4"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"
                      >
                        <Package class="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 class="text-xl font-semibold">{{ store.name }}</h3>
                        <p
                          v-if="store.description"
                          class="text-muted-foreground"
                        >
                          {{ store.description }}
                        </p>
                      </div>
                    </div>

                    <div
                      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      <Card
                        v-for="product in store.items"
                        :key="product.id"
                        class="group hover:shadow-lg transition-all duration-300"
                      >
                        <CardContent class="p-4">
                          <div
                            class="aspect-square bg-muted rounded-lg mb-3 overflow-hidden"
                          >
                            <img
                              v-if="product.images && product.images.length > 0"
                              :src="product.images[0]"
                              :alt="product.name"
                              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div
                              v-else
                              class="w-full h-full flex items-center justify-center"
                            >
                              <Package
                                class="w-12 h-12 text-muted-foreground"
                              />
                            </div>
                          </div>

                          <div class="space-y-2">
                            <h4 class="font-semibold text-sm">
                              {{ product.name }}
                            </h4>
                            <p
                              v-if="product.description"
                              class="text-xs text-muted-foreground line-clamp-2"
                            >
                              {{ product.description }}
                            </p>

                            <div class="flex items-center justify-between">
                              <Badge variant="secondary" class="text-sm">
                                KSh {{ (product.price * 1).toFixed(2) }}
                              </Badge>

                              <div class="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  @click="
                                    updateProductQuantity(
                                      product.id,
                                      store.id.toString(),
                                      -1,
                                    )
                                  "
                                  :disabled="
                                    getProductQuantity(product.id) === 0
                                  "
                                  class="h-8 w-8 p-0"
                                >
                                  <Minus class="w-3 h-3" />
                                </Button>

                                <span
                                  class="text-sm font-medium min-w-[2rem] text-center"
                                >
                                  {{ getProductQuantity(product.id) }}
                                </span>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  @click="
                                    updateProductQuantity(
                                      product.id,
                                      store.id.toString(),
                                      1,
                                    )
                                  "
                                  class="h-8 w-8 p-0"
                                >
                                  <Plus class="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                <!-- Selected Products Summary -->
                <div v-if="getTotalSelectedProducts > 0" class="mt-8">
                  <Card class="bg-primary/5 border-primary/20">
                    <CardContent class="p-4">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <ShoppingCart class="w-5 h-5 text-primary" />
                          <span class="font-semibold">Selected Products</span>
                        </div>
                        <Badge variant="secondary" class="text-lg px-3 py-1">
                          {{ getTotalSelectedProducts }} items
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <!-- Navigation Buttons -->
                <div
                  class="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    @click="handlePrevious"
                    class="w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200"
                  >
                    <ChevronLeft class="w-4 h-4" />
                    Previous
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    @click="handleNext"
                    class="w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200"
                  >
                    {{ getNextButtonText() }}
                    <ChevronRight class="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <!-- Preview Page -->
              <div v-else-if="isPreviewStep" class="space-y-8">
                <div class="text-center space-y-4">
                  <div
                    class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Receipt class="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h2
                      class="text-2xl md:text-3xl font-semibold text-card-foreground mb-2"
                    >
                      Review Your Submission
                    </h2>
                    <p class="text-muted-foreground text-base md:text-lg">
                      Please review your information before submitting
                    </p>
                  </div>
                </div>

                <Separator />

                <!-- Form Data Review -->
                <div class="space-y-6">
                  <div
                    v-for="(page, pageIndex) in form.pages"
                    :key="page.id"
                    class="space-y-4"
                  >
                    <div class="flex items-center gap-3">
                      <Badge variant="outline" class="text-sm"
                        >Page {{ pageIndex + 1 }}</Badge
                      >
                      <h3 class="text-xl font-semibold">{{ page.title }}</h3>
                    </div>

                    <Card class="bg-muted/30">
                      <CardContent class="p-4">
                        <div class="grid gap-4">
                          <div
                            v-for="field in page.fields"
                            :key="field.id"
                            class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2"
                          >
                            <div class="space-y-1 flex-1">
                              <Label
                                class="text-sm font-medium text-muted-foreground"
                                >{{ field.label }}</Label
                              >
                              <div class="text-sm">
                                <span
                                  v-if="formData[field.id]"
                                  class="font-medium break-words"
                                >
                                  {{ formData[field.id] }}
                                </span>
                                <span
                                  v-else
                                  class="text-muted-foreground italic"
                                  >Not provided</span
                                >
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <!-- Selected Products Review -->
                  <div v-if="getTotalSelectedProducts > 0" class="space-y-4">
                    <div class="flex items-center gap-3">
                      <Badge variant="outline" class="text-sm">Products</Badge>
                      <h3 class="text-xl font-semibold">Selected Items</h3>
                    </div>

                    <Card class="bg-muted/30">
                      <CardContent class="p-4">
                        <div class="space-y-3">
                          <div
                            v-for="(productData, productId) in selectedProducts"
                            :key="productId"
                            class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                          >
                            <div class="space-y-1">
                              <div class="font-medium">
                                {{ getProductName(productId) }}
                              </div>
                              <div class="text-sm text-muted-foreground">
                                Quantity: {{ productData.quantity }}
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              class="self-start sm:self-center"
                            >
                              KSh
                              {{
                                (
                                  getProductPrice(productId) *
                                  productData.quantity *
                                  1
                                ).toFixed(2)
                              }}
                            </Badge>
                          </div>
                          <Separator />
                          <div
                            class="flex justify-between items-center text-lg font-semibold"
                          >
                            <span>Total Amount</span>
                            <span class="text-primary"
                              >KSh {{ (getTotalAmount * 1).toFixed(2) }}</span
                            >
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <!-- M-Pesa Payment Form -->
                    <form
                      v-if="form.price"
                      @submit.prevent="handleSubmit()"
                      class="space-y-6"
                    >
                      <div class="space-y-4">
                        <div class="space-y-3">
                          <Label
                            for="phoneNumber"
                            class="text-sm font-semibold flex items-center gap-2"
                          >
                            <div
                              class="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center"
                            >
                              <span class="text-white text-xs font-bold"
                                >M</span
                              >
                            </div>
                            M-Pesa Phone Number
                          </Label>
                          <Input
                            id="phoneNumber"
                            v-model="paymentData.phoneNumber"
                            placeholder="254712345678"
                            required
                            class="h-12 text-lg transition-all duration-200"
                          />
                          <p class="text-sm text-muted-foreground">
                            Enter your M-Pesa registered phone number
                          </p>
                        </div>

                        <Card class="bg-green-50 border-green-200">
                          <CardContent class="p-4">
                            <div class="flex items-start gap-3">
                              <div
                                class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0"
                              >
                                <span class="text-green-600 text-sm">ℹ</span>
                              </div>
                              <div class="space-y-2">
                                <h4 class="font-semibold text-green-800">
                                  Payment Instructions
                                </h4>
                                <ol
                                  class="text-sm text-green-700 space-y-1 list-decimal list-inside"
                                >
                                  <li>Click "Pay with M-Pesa" below</li>
                                  <li>
                                    You'll receive an STK push notification on
                                    your phone
                                  </li>
                                  <li>
                                    Enter your M-Pesa PIN to complete the
                                    payment
                                  </li>
                                  <li>Wait for payment confirmation</li>
                                </ol>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Separator />

                      <div
                        class="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          @click="handlePrevious"
                          class="w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200"
                        >
                          <ChevronLeft class="w-4 h-4" />
                          Back to Review
                        </Button>

                        <Button
                          type="submit"
                          size="lg"
                          :disabled="isProcessing"
                          class="w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          <Loader2
                            v-if="isProcessing"
                            class="w-5 h-5 animate-spin"
                          />
                          <div
                            v-else
                            class="w-5 h-5 bg-white rounded-full flex items-center justify-center"
                          >
                            <span class="text-green-600 text-xs font-bold"
                              >M</span
                            >
                          </div>
                          {{
                            isProcessing
                              ? "Processing Payment..."
                              : `Pay KSh ${getTotalAmount}`
                          }}
                        </Button>
                      </div>
                    </form>
                  </div>

                  <!-- Success Page -->
                  <div v-else class="text-center space-y-8">
                    <!-- <div class="space-y-4"> -->
                    <!--   <div -->
                    <!--     class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto" -->
                    <!--   > -->
                    <!--     <CheckCircle class="w-12 h-12 text-green-600" /> -->
                    <!--   </div> -->
                    <!--   <div class="space-y-2"> -->
                    <!--     <h2 -->
                    <!--       class="text-2xl md:text-3xl font-semibold text-card-foreground" -->
                    <!--     > -->
                    <!--       {{ -->
                    <!--         form.price > 0 -->
                    <!--           ? "Payment Successful!" -->
                    <!--           : "Form Submitted!" -->
                    <!--       }} -->
                    <!--     </h2> -->
                    <!--     <p -->
                    <!--       class="text-muted-foreground text-base md:text-lg max-w-md mx-auto" -->
                    <!--     > -->
                    <!--       {{ -->
                    <!--         form.price > 0 -->
                    <!--           ? "Your payment has been processed successfully and your form has been submitted." -->
                    <!--           : "Thank you for your submission. We'll get back to you soon." -->
                    <!--       }} -->
                    <!--     </p> -->
                    <!--   </div> -->
                    <!-- </div> -->

                    <Separator class="max-w-xs mx-auto" />

                    <Button
                      @click="handleSubmit()"
                      variant="outline"
                      size="lg"
                      class="hover:scale-105 transition-all duration-200"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  CreditCard,
  Receipt,
  Loader2,
  ShoppingCart,
  Package,
  Plus,
  Minus,
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import type { FormSchema, FormField } from "~~/shared/types";

interface Props {
  form: FormSchema;
}

interface Emits {
  (
    e: "submit",
    data: {
      schema: FormSchema;
      formData: Record<string, any>;
      paymentData: Record<string, any>;
      selectedProducts: Record<string, { quantity: number; storeId: string }>;
    },
  ): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const currentStep = ref(0);
const formData = reactive<Record<string, any>>({});
const paymentData = reactive({
  phoneNumber: "",
});
const selectedProducts = reactive<
  Record<string, { quantity: number; storeId: string }>
>({});
const isProcessing = ref(false);

const totalSteps = computed(() => {
  let steps = props.form.pages.length;
  if (props.form.stores && props.form.stores.length > 0) steps += 1; // Product selection step
  steps += 1; // Preview step (always show)
  if (props.form.price > 0) steps += 1; // Checkout step
  return steps;
});

const currentPage = computed(() => {
  return props.form.pages[currentStep.value];
});

const isProductSelectionStep = computed(() => {
  return (
    props.form.stores &&
    props.form.stores.length > 0 &&
    currentStep.value === props.form.pages.length
  );
});

const getPreviewStepIndex = () => {
  let index = props.form.pages.length;
  if (props.form.stores && props.form.stores.length > 0) index += 1;
  return index;
};

const getCheckoutStepIndex = () => {
  let index = props.form.pages.length;
  if (props.form.stores && props.form.stores.length > 0) index += 1;
  index += 1; // Preview step
  return index;
};

const isPreviewStep = computed(() => {
  return currentStep.value === getPreviewStepIndex();
});

const isCheckoutStep = computed(() => {
  return props.form.price > 0 && currentStep.value === getCheckoutStepIndex();
});

const getStepClasses = (index: number) => {
  if (index < currentStep.value) {
    return "bg-primary border-primary text-primary-foreground";
  } else if (index === currentStep.value) {
    return "bg-accent border-accent text-accent-foreground";
  } else {
    return "bg-background border-border text-muted-foreground";
  }
};

const getProductStepClasses = () => {
  const productStepIndex = props.form.pages.length;
  if (currentStep.value > productStepIndex) {
    return "bg-primary border-primary text-primary-foreground";
  } else if (currentStep.value === productStepIndex) {
    return "bg-accent border-accent text-accent-foreground";
  } else {
    return "bg-background border-border text-muted-foreground";
  }
};

const getPreviewStepClasses = () => {
  const previewStepIndex = getPreviewStepIndex();
  if (currentStep.value > previewStepIndex) {
    return "bg-primary border-primary text-primary-foreground";
  } else if (currentStep.value === previewStepIndex) {
    return "bg-accent border-accent text-accent-foreground";
  } else {
    return "bg-background border-border text-muted-foreground";
  }
};

const getCheckoutStepClasses = () => {
  const checkoutStepIndex = getCheckoutStepIndex();
  if (currentStep.value > checkoutStepIndex) {
    return "bg-primary border-primary text-primary-foreground";
  } else if (currentStep.value === checkoutStepIndex) {
    return "bg-accent border-accent text-accent-foreground";
  } else {
    return "bg-background border-border text-muted-foreground";
  }
};

const getFieldClasses = (field: FormField) => {
  // You can add field-specific classes here if needed
  return "";
};

const getInputType = (fieldType: string) => {
  switch (fieldType) {
    case "email":
      return "email";
    case "phone":
      return "tel";
    case "file":
      return "file";
    case "date":
      return "date";
    default:
      return "text";
  }
};

const getNextButtonText = () => {
  if (currentStep.value < props.form.pages.length - 1) {
    return "Continue";
  } else if (isProductSelectionStep.value) {
    return "Review Order";
  } else if (isPreviewStep.value) {
    return props.form.price > 0 ? "Proceed to Payment" : "Submit Form";
  } else if (isCheckoutStep.value) {
    return `Pay KSh ${(getTotalAmount.value * 1).toFixed(2)}`;
  } else {
    return "Review Order";
  }
};

const handleNext = () => {
  if (currentStep.value < props.form.pages.length - 1) {
    // Move to next form page
    currentStep.value++;
  } else if (currentStep.value === props.form.pages.length - 1) {
    // Last form page - move to products or preview or checkout
    if (props.form.stores && props.form.stores.length > 0) {
      currentStep.value++; // Move to product selection
    } else {
      currentStep.value = getPreviewStepIndex(); // Move to preview
    }
  } else if (isProductSelectionStep.value) {
    // Product selection - move to preview
    currentStep.value = getPreviewStepIndex();
  } else if (isPreviewStep.value) {
    // Preview - move to checkout or submit
    if (props.form.price > 0) {
      currentStep.value = getCheckoutStepIndex();
    } else {
      handleSubmit();
    }
  } else {
    handleSubmit();
  }
};
const handleFileChange = async (
  event: Event,
  fieldId: string,
  multiple = false,
) => {
  try {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      delete formData[fieldId];
      return;
    }
    const formDataUpload = createFormData({
      file: files[0],
    });
    const { data } = await $fetch(`/api/uploads`, {
      method: "POST",
      body: formDataUpload,
    });
    formData[fieldId] = data?.path;
  } catch (e: any) {
    toast.error("An error occurred!!");
  }
};
const getSelectedFiles = (fieldId: string): File[] => {
  const value = formData[fieldId];
  if (!value) return [];

  if (value instanceof FileList) {
    return Array.from(value);
  } else if (value instanceof File) {
    return [value];
  } else if (
    Array.isArray(value) &&
    value.every((item) => item instanceof File)
  ) {
    return value;
  }

  return [];
};

const removeFile = (fieldId: string, index: number, multiple: boolean) => {
  const files = getSelectedFiles(fieldId);

  if (multiple) {
    const newFiles = files.filter((_, i) => i !== index);
    if (newFiles.length === 0) {
      delete formData[fieldId];
    } else {
      // Create a new FileList-like structure
      const dt = new DataTransfer();
      newFiles.forEach((file) => dt.items.add(file));
      formData[fieldId] = dt.files;
    }
  } else {
    delete formData[fieldId];
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
const handlePrevious = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const handleSubmit = () => {
  emit("submit", {
    schema: props.form,
    formData,
    selectedProducts,
    paymentData,
  });
  currentStep.value = totalSteps.value;
};

const resetForm = () => {
  currentStep.value = 0;
  Object.keys(formData).forEach((key) => delete formData[key]);
  Object.keys(selectedProducts).forEach((key) => delete selectedProducts[key]);
  paymentData.phoneNumber = "";
};

const updateProductQuantity = (
  productId: string,
  storeId: string,
  change: number,
) => {
  if (!selectedProducts[productId]) {
    selectedProducts[productId] = { quantity: 0, storeId };
  }

  const newQuantity = selectedProducts[productId].quantity + change;
  if (newQuantity <= 0) {
    delete selectedProducts[productId];
  } else {
    selectedProducts[productId].quantity = newQuantity;
  }
};

const getProductQuantity = (productId: string) => {
  return selectedProducts[productId]?.quantity || 0;
};

const getTotalSelectedProducts = computed(() => {
  return Object.values(selectedProducts).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
});

const getProductName = (productId: string) => {
  for (const store of props.form.stores || []) {
    const product = store.items.find((p) => p.id === productId);
    if (product) return product.name;
  }
  return "Unknown Product";
};

const getProductPrice = (productId: string) => {
  for (const store of props.form.stores || []) {
    const product = store.items.find((p) => p.id === productId);
    if (product) return product.price;
  }
  return 0;
};

const getTotalProductsPrice = computed(() => {
  return Object.entries(selectedProducts).reduce((total, [productId, data]) => {
    return total + getProductPrice(productId) * data.quantity;
  }, 0);
});

const getTotalAmount = computed(() => {
  return (
    parseInt(props.form.price.toString()) +
    parseInt(getTotalProductsPrice.value.toString())
  );
});
</script>
