<template>
  <nuxt-link
    :to="`/${urlPrefix}/gallery/${event.nft.id}`"
    class="flex py-3 px-6 notify-item">
    <img
      v-if="avatar"
      :src="avatar"
      :alt="displayName"
      class="border image is-48x48" />
    <img
      v-else
      :src="placeholder"
      :alt="displayName"
      class="border image is-48x48" />
    <div class="notify-content ml-5 flex flex-col">
      <div class="flex justify-between">
        <NeoTooltip :label="displayName" :delay="1000" class="nft-name mr-4">
          <div class="is-ellipsis max-width has-text-weight-bold">
            {{ displayName }}
          </div>
        </NeoTooltip>
        <div class="nft-price is-ellipsis">
          <Money :value="event.meta" />
        </div>
      </div>
      <div class="flex justify-between">
        <div>
          <div class="height-50px flex items-center">
            <div
              class="event-type mr-4 border is-size-7 justify-center py-1 flex items-center"
              :class="[
                getInteractionColor(event.interaction),
                event.interaction === Interaction.ACCEPTED_OFFER
                  ? 'px-2'
                  : 'px-4',
              ]">
              {{ getInteractionName(event.interaction) }}
            </div>
          </div>
        </div>
        <div class="is-ellipsis">
          {{ formatToNow(new Date(event.timestamp), false) }}
        </div>
      </div>
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
import { Event } from './types'
import { NeoTooltip } from '@kodadot1/brick'
import {
  Interaction,
  getInteractionColor,
  getInteractionName,
} from './useNotification'
import { InteractionWithNFT } from '@/composables/collectionActivity/types'
import Money from '@/components/shared/format/ChainMoney.vue'
import { formatToNow } from '@/utils/format/time'
import { getNFTAvatar } from '@/components/collection/activity/events/eventRow/common'

const { urlPrefix } = usePrefix()
const { placeholder } = useTheme()
const props = defineProps<{
  event: Event
}>()
const avatar = ref<string>()
onMounted(() => {
  getAvatar()
})
const getAvatar = async () => {
  if (props.event) {
    avatar.value = await getNFTAvatar(
      props.event as unknown as InteractionWithNFT,
    )
  }
}
const displayName = computed(
  () => props.event.nft.meta.name || props.event.nft.id,
)
</script>

<style scoped lang="scss">
@import '@/assets/styles/abstracts/variables';

.max-width {
  max-width: 8rem;
}
.notify-item {
  &:hover {
    @include ktheme() {
      color: theme('text-color');
      background-color: theme('k-accentlight2');
    }
  }
  img {
    object-fit: cover;
  }
}
.notify-content {
  flex: 1;
  overflow: visible;
}
.nft-price {
  overflow: auto;
}
.nft-name {
  width: 0;
  flex: 1;
}
.event-type {
  line-height: 0.75rem;
  border-radius: 2rem;
  white-space: nowrap;
}
</style>
