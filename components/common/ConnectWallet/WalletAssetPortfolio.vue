<template>
  <div class="flex items-center justify-between">
    <!-- <div>
      <NeoButton
        v-if="isAssetHub"
        v-safe-href="`/${urlPrefix}/assets`"
        no-shadow
        rounded
        tag="a"
        size="small"
        icon="arrow-right-long">
        Portfolio View
      </NeoButton>
    </div> -->

    <a class="has-text-grey is-size-7" @click="rampActive = true"
      >+ {{ $t('addFunds') }}</a
    >

    <OnRampModal :value="rampActive" @close="rampActive = false" />
  </div>
</template>

<script setup lang="ts">
// import { NeoButton } from '@kodadot1/brick'
import OnRampModal from '@/components/shared/OnRampModal.vue'

// TODO: implement isAssetHub for assets
// const { urlPrefix } = usePrefix()
// const { isAssetHub } = useIsChain(urlPrefix)
const rampActive = ref(false)
</script>

<style scoped></style>
