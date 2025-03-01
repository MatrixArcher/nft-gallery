<template>
  <div>
    <ModalIdentityItem />
  </div>

  <p class="py-5 capitalize">
    {{ $t('drops.subscribe') }}
  </p>

  <div class="mb-5">
    <div class="capitalize flex items-center voucher-container">
      <span>{{ $t('drops.plusGetA') }}</span>

      <div class="flex items-center">
        <img width="58" :src="signUpVoucherIcon" alt="shop voucher" />
      </div>

      <span>{{ $t('drops.voucherToOurShop') }}</span>
    </div>

    <p class="text-k-grey capitalize mt-3 is-size-7">
      ({{ $t('drops.justConfirmSubscriptionViaEmail') }})
    </p>
  </div>

  <form @submit.prevent="confirm">
    <NeoInput
      ref="emailInput"
      v-model="email"
      type="email"
      required
      :placeholder="$t('mint.nft.email.placeholder')" />

    <div class="pt-5">
      <NeoCheckbox v-model="agree" class="capitalize">
        {{ $t('drops.consent') }}
      </NeoCheckbox>
    </div>

    <div class="flex justify-between pt-4">
      <NeoButton
        class="flex flex-1 h-14 capitalize shine"
        :disabled="disabled"
        :loading="loading"
        no-shadow
        variant="k-accent"
        loading-with-label
        native-type="submit">
        {{ submitButtonText }}
      </NeoButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { NeoButton, NeoCheckbox, NeoInput } from '@kodadot1/brick'
import ModalIdentityItem from '@/components/shared/ModalIdentityItem.vue'

const emit = defineEmits(['confirm'])
const props = defineProps<{
  subscribing: boolean
}>()

const { $i18n } = useNuxtApp()
const { signUpVoucherIcon } = useIcon()

const emailInput = ref()
const email = ref()
const agree = ref(false)

const invalidEmail = computed(() => !emailInput.value?.checkHtml5Validity())

const disabled = computed(
  () =>
    invalidEmail.value ||
    email.value === '' ||
    !agree.value ||
    props.subscribing,
)

const loading = computed(() => props.subscribing)

const submitButtonText = computed(() => {
  if (invalidEmail.value) {
    return $i18n.t('drops.enterValidEmail')
  }

  if (props.subscribing) {
    return $i18n.t('general.subscribing')
  }

  if (!agree.value) {
    return $i18n.t('drops.agreeToProceed')
  }

  return $i18n.t('drops.subscribeAndClaim')
})

const confirm = () => {
  emit('confirm', email.value)
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/abstracts/variables';
@import '@/assets/styles/abstracts/animations';

.modal-width {
  width: 25rem;
}

.shine:not(:hover):not(:disabled) {
  @include shineEffect(var(--k-accent-light-3), lightgrey, false);

  &:hover {
    color: var(--k-accent2) !important;
  }
}

.voucher-container {
  gap: 0.5rem;

  @include mobile {
    flex-direction: column !important;
    align-items: flex-start !important;
  }
}
</style>
