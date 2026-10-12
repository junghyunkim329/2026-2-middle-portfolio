import { MongoClient } from 'mongodb'

export type Experience = {
  id: string
  title: string
  description: string
  image: string
  date: string
  author: string
  sections: { heading: string; body: string }[]
  quote: string
}

const experiences: Experience[] = [
  {
    id: 'hack-in',
    title: 'HACK_IN',
    description:
      'Call out a feature, benefit, or value of your site or product that can stand on its own.',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop-ctcBl8zL1kk2872BYqyxoCmRnIyN2m.png',
    date: 'January 1, 2025',
    author: '김정현',
    sections: [
      {
        heading: '첫 번째 이야기',
        body: '새로운 문제를 발견하고, 작은 실험으로 답을 찾아가는 과정을 기록합니다. 직접 부딪히며 배운 것들을 차분하게 정리했습니다.',
      },
      {
        heading: '배운 점을 나누며',
        body: '완성된 결과보다 그 과정에서 마주한 고민과 선택을 오래 남기고 싶었습니다. 다음 시도에 도움이 될 수 있도록 솔직하게 적었습니다.',
      },
      {
        heading: '마지막으로',
        body: '앞으로도 만들고, 관찰하고, 다시 고치는 일을 반복하며 더 나은 경험을 만들어가겠습니다.',
      },
    ],
    quote: '좋은 기록은 다음 시도의 방향을 만들어준다.',
  },
  {
    id: 'chagoyeongusil',
    title: '차고연구실',
    description:
      'Cards are a great way to organize content in a collection—products, case studies, services, and more.',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop-1-2GztLs0W7VemTjOVdhzMjUwMUKaINM.png',
    date: 'February 14, 2025',
    author: '김정현',
    sections: [
      {
        heading: '차고에서 시작한 실험',
        body: '아이디어를 빠르게 만들고 검증하기 위한 작은 공간입니다. 완벽하지 않아도 괜찮다는 마음으로 매일 새로운 시도를 남깁니다.',
      },
      {
        heading: '작게 만들고 크게 배우기',
        body: '작은 프로토타입과 반복적인 피드백을 통해 문제를 더 정확히 이해했습니다. 실패도 다음 실험을 위한 중요한 데이터가 되었습니다.',
      },
      {
        heading: '계속 이어지는 기록',
        body: '배운 것을 다시 나누는 순간, 개인의 경험은 더 오래 쓰이는 지식이 됩니다.',
      },
    ],
    quote: '만드는 사람의 가장 좋은 도구는 꾸준히 기록하는 습관이다.',
  },
  {
    id: 'vehicle-security',
    title: '차량 보안 솔루션 프로젝트',
    description:
      'Add more cards to this little stack to build out a grid of whatever size and shape you need.',
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Desktop-2-KKbFtMY0NG8EJGCdyo8FdcJ54jEQy5.png',
    date: 'March 20, 2025',
    author: '김정현',
    sections: [
      {
        heading: '안전한 이동을 위한 고민',
        body: '차량과 사용자가 만나는 순간에 어떤 위험이 발생하는지 살펴보고, 일상에서 자연스럽게 작동하는 보안 경험을 고민했습니다.',
      },
      {
        heading: '복잡함을 덜어내기',
        body: '기술은 보이지 않을수록 좋다고 생각합니다. 사용자가 안심하고 이동에 집중할 수 있도록 복잡한 과정을 단순하게 만들었습니다.',
      },
      {
        heading: '다음 단계',
        body: '실제 환경에서 더 많은 데이터를 모으고, 다양한 사용자의 목소리를 반영하며 솔루션을 발전시킬 예정입니다.',
      },
    ],
    quote: '보안은 불안을 보여주는 일이 아니라 안심을 설계하는 일이다.',
  },
]

let clientPromise: Promise<MongoClient> | null = null
function getClient() {
  if (!process.env.MONGODB_URI) return null
  clientPromise ??= new MongoClient(process.env.MONGODB_URI).connect()
  return clientPromise
}

export async function getExperiences() {
  const client = getClient()
  if (!client) return experiences
  try {
    const docs = await (await client)
      .db('today-record')
      .collection<Experience>('experiences')
      .find({})
      .sort({ date: -1 })
      .toArray()
    return docs.length
      ? docs.map(({ _id, ...experience }) => ({
          ...experience,
          id: String(experience.id ?? _id),
        }))
      : experiences
  } catch {
    return experiences
  }
}

export async function getExperience(id: string) {
  const all = await getExperiences()
  return all.find((experience) => experience.id === id)
}
