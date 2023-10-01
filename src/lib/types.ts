export type User = {
  _id: string
  name: string
  email: string
  imageUrl?: string
  role: Role
}

export type Specie = {
  _id: string
  name: string
  imageUrl?: string
  description?: string
}

export type Bird = {
  _id: string
  specie: Specie | string
  name: string
  sold: boolean
  type: BirdType
  birth?: Date
  gender: Gender
  sellPrice: number
  breedPrice: number
  description?: string
  imageUrls?: string[]
  parent?: Parent
  achievements?: Achievement[]
}

export type Nest = {
  _id: string
  dad: Bird
  mom: Bird
  name: string
  specie: Specie | string
  sold: boolean
  price: number
  imageUrls?: string[]
  description?: string
}

export type Order = {
  _id: string
  birds: Bird[] | string[]
  nests: Nest[] | string[]
  user: User | string
  receiver: string
  address: string
  phone: string
  createdAt: Date
  totalMoney: number
  status: OrderStatus
  cancelMessage?: string
  rated: boolean
}

export type OrderNest = {
  _id: string
  dad: Bird
  mom: Bird
  childPriceMale: number
  childPriceFemale: number
  numberChildPriceMale: number
  numberChildPriceFemale: number
  user: User | string
  rated: boolean
  createdAt: Date
  status: OrderNestStatus
  specie: Specie
  stages: Stage[]
}

export type Rating = {
  value: number
  content?: string
  imageUrls?: string[]
  user: User | string
  createdAt: Date
}

export function getSpecie(item: Bird | Nest | OrderNest): Specie {
  return item.specie as Specie
}

export function getDad(item: Bird): Bird {
  return item.parent?.dad as Bird
}

export function getMom(item: Bird): Bird {
  return item.parent?.mom as Bird
}

export function getUser(item: Order | Rating | OrderNest): User {
  return item.user as User
}
export function getBirds(item: Order): Bird[] {
  return item.birds as Bird[]
}
export function getNests(item: Order): Nest[] {
  return item.nests as Nest[]
}

export type Stage = {
  name: string
  imageUrl: string
  description: string
}

export type Gender = 'male' | 'female'

export type BirdType = 'sell' | 'breed'

export type Parent = {
  dad?: string | Bird
  mom?: string | Bird
}
export type Achievement = {
  competition: string
  rank: number
  _id: string
}

export type Voucher = {
  _id: string
  discountPercent: number
  maxDiscountValue: number
  conditionPrice: number
  quantity: number
  expiredAt: Date
}

export type Role = 'customer' | 'staff' | 'manager' | 'admin' | 'guest'

export type OrderStatus = 'processing' | 'delivering' | 'success' | 'canceled'

export type OrderNestStatus = 'processing' | 'delivering' | 'success' | 'canceled' | 'breeding'

export type Cart = {
  birds: string[]
  nests: string[]
}

export type Products = {
  birds: Bird[]
  nests: Nest[]
}
