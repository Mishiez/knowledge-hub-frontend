import type { Post } from '../types/post';

const mockPosts: Post[] = [
  {
    id: 1,
    title: 'Why Do We Remember Some Things and Forget Others?',
    slug: 'why-do-we-remember-some-things-and-forget-others',
    content:
      'Memory is not a perfect recording of everything we experience. Our brains constantly decide what information is worth keeping, which is why emotional and meaningful experiences often stay with us longer.',
    author: 'Michelle Gathoni',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'The Surprisingly Short History of the Internet',
    slug: 'the-surprisingly-short-history-of-the-internet',
    content:
      'The internet feels like it has always existed, but the technology behind the modern web is surprisingly young. What started as a way for computers to communicate eventually became the infrastructure behind much of modern life.',
    author: 'Daniel Mwangi',
    created_at: '2026-08-03T14:30:00Z',
  },
  {
    id: 3,
    title: 'Why Do We Procrastinate Even When We Know Better?',
    slug: 'why-do-we-procrastinate-even-when-we-know-better',
    content:
      'Procrastination is not always about laziness. Sometimes we avoid tasks because they feel difficult, uncertain, boring, or emotionally uncomfortable, even when we understand the consequences of delaying them.',
    author: 'Aisha Hassan',
    created_at: '2026-08-05T09:15:00Z',
  },
  {
    id: 4,
    title: 'What Would Happen If the Moon Disappeared?',
    slug: 'what-would-happen-if-the-moon-disappeared',
    content:
      'The Moon does much more than light up the night sky. Its gravitational pull influences ocean tides and plays an important role in the long-term stability of Earth’s rotation.',
    author: 'Brian Otieno',
    created_at: '2026-08-07T11:20:00Z',
  },
  {
    id: 5,
    title: 'Why Some Ideas Spread Faster Than Others',
    slug: 'why-some-ideas-spread-faster-than-others',
    content:
      'Some ideas seem to travel through communities almost effortlessly. Simplicity, emotion, usefulness, and the social environments in which an idea appears can all influence how quickly it spreads.',
    author: 'Michelle Gathoni',
    created_at: '2026-08-09T16:45:00Z',
  },
  {
    id: 6,
    title: 'How Supermarkets Influence What You Buy',
    slug: 'how-supermarkets-influence-what-you-buy',
    content:
      'Where products are placed, how prices are displayed, and even the path you take through a store can influence purchasing decisions. Much of the experience is designed long before you reach the checkout.',
    author: 'Kevin Kamau',
    created_at: '2026-08-12T08:00:00Z',
  },
  {
    id: 7,
    title: 'Why Is the Ocean Blue?',
    slug: 'why-is-the-ocean-blue',
    content:
      'Sunlight contains many different wavelengths of light. Water absorbs some wavelengths more strongly than others, leaving blue light more visible and giving large bodies of water their familiar color.',
    author: 'Grace Wanjiku',
    created_at: '2026-08-15T13:10:00Z',
  },
  {
    id: 8,
    title: 'The Strange Way Your Brain Handles Time',
    slug: 'the-strange-way-your-brain-handles-time',
    content:
      'Five minutes can feel incredibly long when you are waiting for something and disappear almost instantly when you are having fun. Our perception of time changes depending on attention, emotion, and experience.',
    author: 'Samuel Kariuki',
    created_at: '2026-08-17T10:30:00Z',
  },
  {
    id: 9,
    title: 'Why Do We Get Goosebumps?',
    slug: 'why-do-we-get-goosebumps',
    content:
      'Goosebumps are a leftover response from our evolutionary past. They once helped animals make their fur or hair stand upright, making them appear larger and helping with temperature regulation.',
    author: 'Njeri Kamau',
    created_at: '2026-08-19T09:00:00Z',
  },
  {
    id: 10,
    title: 'Can Money Actually Buy Happiness?',
    slug: 'can-money-actually-buy-happiness',
    content:
      'Money can improve wellbeing by providing security and reducing financial stress, but its relationship with happiness is more complicated than simply having more of it. How money is spent can matter just as much as how much is earned.',
    author: 'David Ochieng',
    created_at: '2026-08-21T15:00:00Z',
  },
];

export type Scenario = 'success' | 'empty' | 'error';

const DELAY_MS = 250;

export function getPosts(scenario: Scenario = 'success'): Promise<Post[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (scenario) {
        case 'success':
          resolve(mockPosts);
          break;
        case 'empty':
          resolve([]);
          break;
        case 'error':
          reject(new Error('Failed to fetch posts'));
          break;
      }
    }, DELAY_MS);
  });
}