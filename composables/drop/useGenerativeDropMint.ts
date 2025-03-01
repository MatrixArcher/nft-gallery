import { DoResult, DropMintedStatus } from '@/services/waifu'
import { makeScreenshot } from '@/services/capture'
import { pinFileToIPFS } from '@/services/nftStorage'
import { nftToListingCartItem } from '@/components/common/shoppingCart/utils'

export type DropMintedNft = DoResult & {
  id: string
  collectionName: string
  name: string
}

export type UnlockableCollectionById = {
  collectionEntity: {
    meta: { description: string }
    name: string
    max: number
    nftCount: number
  }
  nftEntitiesConnection: { totalCount: number }
}

type GenerativeDropMintParams = {
  mintedDropCount: Ref<number>
  collectionId: Ref<string>
  defaultImage: Ref<string>
  currentAccountMintedToken: Ref<DropMintedStatus | null>
  defaultMax: Ref<number>
  collectionData: Ref<UnlockableCollectionById | undefined | null>
}

export default ({
  collectionData,
  defaultMax,
  currentAccountMintedToken,
  collectionId,
  mintedDropCount,
  defaultImage,
}: GenerativeDropMintParams) => {
  const { toast } = useToast()
  const { $i18n } = useNuxtApp()
  const listingCartStore = useListingCartStore()
  const preferencesStore = usePreferencesStore()

  const mintedNft = ref<DropMintedNft>()
  const mintedNftWithMetadata = ref<NFTWithMetadata>()
  const selectedImage = ref<string>('')

  const maxCount = computed(
    () => collectionData.value?.collectionEntity?.max || defaultMax.value,
  )

  const userMintedNftId = computed(() =>
    currentAccountMintedToken.value
      ? `${collectionId.value}-${currentAccountMintedToken.value.id}`
      : mintedNft.value?.id,
  )

  const mintedCount = computed(() =>
    Math.min(mintedDropCount.value, maxCount.value),
  )

  const mintCountAvailable = computed(() => mintedCount.value < maxCount.value)

  const description = computed(
    () => collectionData.value?.collectionEntity?.meta?.description,
  )
  const collectionName = computed(
    () => collectionData.value?.collectionEntity?.name,
  )

  const nftCount = computed(
    () => collectionData.value?.collectionEntity?.nftCount,
  )

  const canListMintedNft = computed(() => Boolean(mintedNftWithMetadata.value))

  const tryCapture = async () => {
    try {
      const imgFile = await makeScreenshot(
        sanitizeIpfsUrl(selectedImage.value),
        { webgl: false },
      )
      const imageHash = await pinFileToIPFS(imgFile)
      return imageHash
    } catch (error) {
      toast($i18n.t('drops.capture'))
      return defaultImage.value
    }
  }

  const subscribeToMintedNft = (id: string, onReady: (data) => void) => {
    useSubscriptionGraphql({
      query: `nftEntityById(id: "${id}") {
      id
    }`,
      onChange: onReady,
    })
  }

  const listMintedNft = async () => {
    if (!mintedNftWithMetadata.value) {
      return
    }

    if (!listingCartStore.isItemInCart(mintedNftWithMetadata.value?.id)) {
      const floorPrice =
        mintedNftWithMetadata.value?.collection.floorPrice[0]?.price || '0'

      listingCartStore.setItem(
        nftToListingCartItem(mintedNftWithMetadata.value, floorPrice),
      )
    }

    preferencesStore.listingCartModalOpen = true
  }

  onBeforeUnmount(() => {
    preferencesStore.listingCartModalOpen = false
    listingCartStore.removeItem(mintedNftWithMetadata.value?.id)
  })

  return {
    maxCount,
    mintedNft,
    mintedNftWithMetadata,
    userMintedNftId,
    mintedCount,
    mintCountAvailable,
    selectedImage,
    description,
    collectionName,
    canListMintedNft,
    nftCount,
    listMintedNft,
    tryCapture,
    subscribeToMintedNft,
  }
}
