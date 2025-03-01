<template>
  <div v-if="ready" class="">
    <nuxt-link
      v-for="{ avatar, id, name, updatedAt } in displayedNFTs"
      :key="id"
      :to="`/${urlPrefix}/gallery/${id}`"
      class="flex pt-2 px-5 justify-start is-hoverable-item hoverable-lable-color">
      <div class="mr-5">
        <BasicImage :src="avatar" :alt="name" class="border image-size pt-0" />
      </div>
      <div class="flex flex-col">
        {{ name }}
        <span class="is-size-7 has-text-grey">{{
          timeAgo(new Date(updatedAt).getTime())
        }}</span>
      </div>
    </nuxt-link>
    <div ref="target" />
  </div>
</template>

<script setup lang="ts">
import { sanitizeIpfsUrl } from '@/utils/ipfs'
import { processSingleMetadata } from '@/utils/cachingStrategy'
import { NFTMetadata } from '@/components/rmrk/service/scheme'
import { NFTExcludingEvents } from '@/composables/collectionActivity/types'
import { timeAgo } from '@/components/collection/utils/timeAgo'
import BasicImage from '@/components/shared/view/BasicImage.vue'

const { placeholder } = useTheme()
const props = defineProps<{
  nfts: (NFTExcludingEvents & { avatar?: string })[]
}>()

const nfts = ref(props.nfts)
const ready = ref(false)

const target = ref<HTMLElement | null>(null)
const offset = ref(4)

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    offset.value += 4
  }
})

const { urlPrefix } = usePrefix()

const displayedNFTs = computed(() => nfts.value.slice(0, offset.value))

const processNFTImages = async () => {
  if (props.nfts) {
    const promises = displayedNFTs.value.map(async (nft, i) => {
      let avatar
      if (nft.meta?.image) {
        avatar = sanitizeIpfsUrl(nft.meta.image)
      } else {
        const meta = (await processSingleMetadata(nft.metadata)) as NFTMetadata
        avatar = sanitizeIpfsUrl(meta?.image)
      }

      displayedNFTs.value[i].avatar = avatar || placeholder.value
    })

    await Promise.all(promises)

    ready.value = true
  }
}

watch(
  offset,
  () => {
    processNFTImages()
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.image-size {
  width: 40px !important;
  height: 40px !important;
}

.hoverable-lable-color {
  color: inherit !important;
}
</style>
