<template>
  <div class="flex flex-col flex-grow justify-start mt-5">
    <!-- price -->
    <GalleryItemPriceBuy v-if="!isOwner && nft" :nft="nft" />

    <!-- highest offer -->
    <!-- <GalleryItemPriceOffer
      v-if="!offersDisabled && !isOwner && nft?.id && nft.currentOwner"
      :nft-id="nft.id"
      :collection-id="nft.collection.id"
      :current-owner="nft.currentOwner"
      :account="nft.currentOwner"
      class="mt-2" /> -->

    <!-- change price as an owner -->
    <GalleryItemPriceRelist
      v-if="isOwner && nft?.id && nft?.price && nft?.collection.id"
      :nft="nft"
      class="mt-2" />

    <!-- transfer item as an owner -->
    <GalleryItemPriceTransfer
      v-if="isOwner && nft?.id"
      :nft="nft"
      class="mt-2" />
  </div>
</template>

<script lang="ts" setup>
import GalleryItemPriceBuy from './GalleryItemActionType/GalleryItemBuy.vue'
import GalleryItemPriceRelist from './GalleryItemActionType/GalleryItemRelist.vue'
import GalleryItemPriceTransfer from './GalleryItemActionType/GalleryItemTransfer.vue'

import { NFT } from '@/components/rmrk/service/scheme'
const props = defineProps<{
  nft: NFT | undefined
}>()

const { isCurrentOwner } = useAuth()
const isOwner = computed(() => isCurrentOwner(props.nft?.currentOwner))
</script>

<style scoped></style>
