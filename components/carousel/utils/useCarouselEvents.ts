import type { CarouselNFT } from '@/components/base/types'
import type { NFTWithMetadata } from '@/composables/useNft'
import { isBeta, isProduction } from '@/utils/chain'
import { formatNFT } from '@/utils/carousel'

import latestEvents from '@/queries/subsquid/general/latestEvents.graphql'
import latestEventsRmrkv2 from '@/queries/subsquid/ksm/latestEvents.graphql'
import unionBy from 'lodash/unionBy'

interface Types {
  type: 'latestSales' | 'newestList'
}

const limit = isProduction ? 15 : 8

const nftEventVariables = {
  latestSales: { interaction_eq: 'BUY' },
  newestList: { interaction_eq: 'LIST' },
}

const disableChainsOnBeta = ['ahr']

const fetchLatestEvents = async (chain, type, where = {}, limit = 5) => {
  const query = chain === 'ksm' ? latestEventsRmrkv2 : latestEvents

  return await useAsyncQuery({
    query,
    clientId: chain,
    variables: {
      // limit: limit, TODO: use limit
      limit,
      orderBy: 'timestamp_DESC',
      where: {
        ...nftEventVariables[type],
        ...where,
      },
    },
  })
}

const createEventQuery = (
  type,
  excludeNftId,
  collectionIds,
  excludeCollectionId,
) => ({
  nft: {
    ...(type === 'newestList' && { price_gt: 0 }),
    id_not_in: [...new Set(excludeNftId.value)],
    collection: {
      ...(collectionIds && { id_in: collectionIds }),
      id_not_in: [...new Set(excludeCollectionId.value)],
    },
  },
})

const useChainEvents = async (
  chain,
  type,
  eventQueryLimit,
  collectionIds,
  withLastestSale = true,
) => {
  const nfts = ref<
    { nft: NFTWithMetadata; timestamp: string; latestSalePrice?: string }[]
  >([])
  const uniqueNftId = ref<string[]>([])
  const totalCollection = reactive({})
  const excludeCollectionId = ref<string[]>([])
  const excludeNftId = ref<string[]>([])

  if ((isBeta || isProduction) && disableChainsOnBeta.includes(chain)) {
    return {
      data: ref(undefined),
    }
  }

  const pushNft = (nft) => {
    if (!uniqueNftId.value.includes(nft.nft.id) && nfts.value.length < limit) {
      uniqueNftId.value.push(nft.nft.id)
      if (type === 'latestSales' && withLastestSale) {
        nft.latestSalePrice = nft.meta
      }
      nfts.value.push(nft)
    }
  }

  const limitCollection = (nft) => {
    excludeNftId.value.push(nft.nft.id)

    if (totalCollection[nft.nft.collection.id]) {
      totalCollection[nft.nft.collection.id] += 1

      // limit nft in same collection by 3
      if (!collectionIds && totalCollection[nft.nft.collection.id] > 3) {
        return excludeCollectionId.value.push(nft.nft.collection.id)
      }

      return pushNft(nft)
    }

    totalCollection[nft.nft.collection.id] = 1
    pushNft(nft)
  }
  const query = createEventQuery(
    type,
    excludeNftId,
    collectionIds,
    excludeCollectionId,
  )

  const { data } = await fetchLatestEvents(chain, type, query, eventQueryLimit)
  data.value?.events?.forEach((nft) => limitCollection(nft))

  return {
    data: nfts,
  }
}

export const flattenNFT = (data, chain) => {
  if (!data?.length) {
    return []
  }

  const flatNfts = data.map((nft) => {
    return {
      ...nft.nft,
      timestamp: nft.timestamp,
      latestSalePrice: nft.latestSalePrice,
    }
  })

  return formatNFT(flatNfts, chain)
}

const sortNftByTime = (data) => data.sort((a, b) => b.unixTime - a.unixTime)

const limitDisplayNfts = (data) => {
  const nfts = ref<CarouselNFT[]>([])

  // show 30 nfts in carousel
  const sortedNfts = sortNftByTime(data).slice(0, 30)

  nfts.value = sortedNfts

  return {
    nfts,
    ids: computed(() => nfts.value.map((nft) => nft.id).join()),
  }
}

export const useCarouselNftEvents = ({ type }: Types) => {
  const nfts = ref<CarouselNFT[]>([])
  const items = computed(() => limitDisplayNfts(nfts.value))
  const chains = ['ahk', 'ahp', 'rmrk', 'ksm']

  onMounted(async () => {
    for (const chain of chains) {
      useChainEvents(chain, type, limit, null).then(({ data }) =>
        nfts.value.push(...flattenNFT(data.value, chain)),
      )
    }
  })

  return computed(() => items.value.nfts)
}

const generativeLimit = 10
export const useCarouselGenerativeNftEvents = (
  ahkCollectionIds: string[],
  ahpCollectionIds: string[],
) => {
  const nfts = ref<CarouselNFT[]>([])

  const eventType = ['latestSales', 'newestList']

  onMounted(() => {
    eventType.forEach((type) => {
      useChainEvents('ahk', type, generativeLimit, ahkCollectionIds).then(
        ({ data }) => nfts.value.push(...flattenNFT(data.value, 'ahk')),
      )
      useChainEvents('ahp', type, generativeLimit, ahpCollectionIds).then(
        ({ data }) => nfts.value.push(...flattenNFT(data.value, 'ahp')),
      )
    })
  })

  return computed(() => limitDisplayNfts(unionBy(nfts.value, 'id')).nfts)
}
