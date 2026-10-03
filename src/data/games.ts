import { Game } from '../types';

export const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export const INITIAL_GAMES: Game[] = [
  // 0. TURBO EXPRESS 3D: 60-Second Real-Time Rapid Live Draw (3D Draw, 50x)
  {
    id: 'turbo-express-60s',
    name: 'Turbo Express 3D (60s)',
    category: 'turbo',
    digits: 3,
    period: 'TE-' + Math.floor(Date.now() / 60000),
    result: '777',
    lastDrawTime: Date.now(),
    durationMs: 60 * 1000,
    iconColor: '#F59E0B',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    badge: '⚡ 60s Live Draw',
    status: 'active',
    payoutMultiplier: 50,
    description: 'Instant 60-Second Real-time 3D Draw with 50x Payout. Draw happens every 60 seconds!',
    scheduleLabel: '60s Rapid Draw',
  },

  // 1. MORNING EXPRESS 3D: 09:00 AM - 01:00 PM (3D Draw, 50x)
  {
    id: 'morning-express-3d',
    name: 'Morning Express 3D',
    category: 'turbo',
    digits: 3,
    period: 'ME-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '482',
    lastDrawTime: Date.now(),
    durationMs: FOUR_HOURS_MS,
    iconColor: '#F59E0B',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    badge: '9:00 AM - 1:00 PM',
    status: 'active',
    payoutMultiplier: 50,
    description: 'Daily Morning Real-time 3D Draw running 9:00 AM to 1:00 PM with 50x Payout',
    startHour: 9,  // 09:00 AM
    endHour: 13,   // 01:00 PM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '9:00 AM - 1:00 PM',
  },

  // 2. KERALA WIN-WIN 3D: 10:00 AM - 02:00 PM (3D Draw, 50x)
  {
    id: 'kerala-win-win-3d',
    name: 'Kerala Win-Win 3D',
    category: 'kerala',
    digits: 3,
    period: 'KW-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '539',
    lastDrawTime: Date.now() - 1800000,
    durationMs: FOUR_HOURS_MS,
    iconColor: '#059669',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80',
    badge: '10:00 AM - 2:00 PM',
    status: 'active',
    payoutMultiplier: 50,
    description: 'Official Kerala State Series 3-Digit draw running 10:00 AM to 2:00 PM with 50x Payout',
    startHour: 10, // 10:00 AM
    endHour: 14,   // 02:00 PM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '10:00 AM - 2:00 PM',
  },

  // 3. NAGALAND DEAR DWARKA 3D: 11:00 AM - 03:00 PM (3D Draw, 50x)
  {
    id: 'nagaland-dear-dwarka-3d',
    name: 'Nagaland Dear Dwarka 3D',
    category: 'nagaland',
    digits: 3,
    period: 'ND-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '185',
    lastDrawTime: Date.now() - 2700000,
    durationMs: FOUR_HOURS_MS,
    iconColor: '#E11D48',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
    badge: '11:00 AM - 3:00 PM',
    status: 'active',
    payoutMultiplier: 50,
    description: 'Nagaland State Dear Dwarka 3-Digit draw running 11:00 AM to 3:00 PM with 50x Payout',
    startHour: 11, // 11:00 AM
    endHour: 15,   // 03:00 PM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '11:00 AM - 3:00 PM',
  },

  // 4. AFTERNOON GOLDEN 3D: 01:00 PM - 05:00 PM (3D Draw, 50x)
  {
    id: 'afternoon-golden-3d',
    name: 'Afternoon Golden 3D',
    category: 'turbo',
    digits: 3,
    period: 'AG-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '777',
    lastDrawTime: Date.now(),
    durationMs: FOUR_HOURS_MS,
    iconColor: '#F59E0B',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    badge: '1:00 PM - 5:00 PM',
    status: 'active',
    payoutMultiplier: 50,
    description: 'Afternoon Prime Real-time 3D Draw running 1:00 PM to 5:00 PM with 50x Payout',
    startHour: 13, // 01:00 PM
    endHour: 17,   // 05:00 PM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '1:00 PM - 5:00 PM',
  },

  // 5. ROYAL JACKPOT 4D: 02:00 PM - 06:00 PM (4D Draw, 100x)
  {
    id: 'royal-jackpot-4d',
    name: 'Royal Jackpot 4D',
    category: 'turbo',
    digits: 4,
    period: 'RJ-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '7777',
    lastDrawTime: Date.now(),
    durationMs: FOUR_HOURS_MS,
    iconColor: '#8B5CF6',
    imageUrl: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=300&auto=format&fit=crop&q=80',
    badge: '2:00 PM - 6:00 PM',
    status: 'active',
    payoutMultiplier: 100,
    description: 'Daily Synchronized 2:00 PM to 6:00 PM 4D Mega Jackpot Draw with 100x Payout',
    startHour: 14, // 02:00 PM
    endHour: 18,   // 06:00 PM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '2:00 PM - 6:00 PM',
  },

  // 6. KERALA MONSOON BUMPER 4D: 03:00 PM - 07:00 PM (4D Draw, 100x)
  {
    id: 'kerala-monsoon-bumper-4d',
    name: 'Kerala Monsoon Bumper 4D',
    category: 'kerala',
    digits: 4,
    period: 'KM-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '7391',
    lastDrawTime: Date.now() - 5400000,
    durationMs: FOUR_HOURS_MS,
    iconColor: '#3B82F6',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=300&auto=format&fit=crop&q=80',
    badge: '3:00 PM - 7:00 PM',
    status: 'active',
    payoutMultiplier: 100,
    description: 'Kerala Mega Bumper 4-Digit jackpot running 3:00 PM to 7:00 PM with 100x Payout',
    startHour: 15, // 03:00 PM
    endHour: 19,   // 07:00 PM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '3:00 PM - 7:00 PM',
  },

  // 7. NAGALAND DEAR BLITZEN 4D: 04:00 PM - 08:00 PM (4D Draw, 100x)
  {
    id: 'nagaland-dear-blitzen-4d',
    name: 'Nagaland Dear Blitzen 4D',
    category: 'nagaland',
    digits: 4,
    period: 'NB-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '6031',
    lastDrawTime: Date.now() - 6300000,
    durationMs: FOUR_HOURS_MS,
    iconColor: '#7C3AED',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80',
    badge: '4:00 PM - 8:00 PM',
    status: 'active',
    payoutMultiplier: 100,
    description: 'Nagaland Dear Blitzen 4-digit bumper draw running 4:00 PM to 8:00 PM with 100x Payout',
    startHour: 16, // 04:00 PM
    endHour: 20,   // 08:00 PM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '4:00 PM - 8:00 PM',
  },

  // 8. EVENING DELIGHT 3D: 05:00 PM - 09:00 PM (3D Draw, 50x)
  {
    id: 'evening-delight-3d',
    name: 'Evening Delight 3D',
    category: 'turbo',
    digits: 3,
    period: 'ED-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '924',
    lastDrawTime: Date.now(),
    durationMs: FOUR_HOURS_MS,
    iconColor: '#EC4899',
    imageUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=300&auto=format&fit=crop&q=80',
    badge: '5:00 PM - 9:00 PM',
    status: 'active',
    payoutMultiplier: 50,
    description: 'Evening Prime 3D Live Draw running 5:00 PM to 9:00 PM with 50x Payout',
    startHour: 17, // 05:00 PM
    endHour: 21,   // 09:00 PM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '5:00 PM - 9:00 PM',
  },

  // 9. NIGHT STAR 4D JACKPOT: 06:00 PM - 10:00 PM (4D Draw, 100x)
  {
    id: 'night-star-4d',
    name: 'Night Star 4D Jackpot',
    category: 'turbo',
    digits: 4,
    period: 'NS-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '8024',
    lastDrawTime: Date.now(),
    durationMs: FOUR_HOURS_MS,
    iconColor: '#06B6D4',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&auto=format&fit=crop&q=80',
    badge: '6:00 PM - 10:00 PM',
    status: 'active',
    payoutMultiplier: 100,
    description: 'Night Star High Stakes 4D Jackpot running 6:00 PM to 10:00 PM with 100x Payout',
    startHour: 18, // 06:00 PM
    endHour: 22,   // 10:00 PM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '6:00 PM - 10:00 PM',
  },

  // 10. MIDNIGHT DHAMAKA 3D: 08:00 PM - 12:00 AM (3D Draw, 50x)
  {
    id: 'midnight-dhamaka-3d',
    name: 'Midnight Dhamaka 3D',
    category: 'turbo',
    digits: 3,
    period: 'MD-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '369',
    lastDrawTime: Date.now(),
    durationMs: FOUR_HOURS_MS,
    iconColor: '#10B981',
    imageUrl: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=300&auto=format&fit=crop&q=80',
    badge: '8:00 PM - 12:00 AM',
    status: 'active',
    payoutMultiplier: 50,
    description: 'Grand Midnight 3D Finale Draw running 8:00 PM to 12:00 Midnight with 50x Payout',
    startHour: 20, // 08:00 PM
    endHour: 24,   // 12:00 AM Midnight
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '8:00 PM - 12:00 AM',
  },

  // 11. TAIWAN BINGO 3D: 07:00 AM - 11:00 AM (3D Draw, 50x)
  {
    id: 'taiwan-bingo',
    name: 'Taiwan Bingo 3D',
    category: 'international',
    digits: 3,
    period: 'TB-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '888',
    lastDrawTime: Date.now() - 4500000,
    durationMs: FOUR_HOURS_MS,
    iconColor: '#EF4444',
    imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=300&auto=format&fit=crop&q=80',
    badge: '7:00 AM - 11:00 AM',
    status: 'active',
    payoutMultiplier: 50,
    description: 'Taiwan official bingo 3-digit live draw running 7:00 AM to 11:00 AM with 50x Payout',
    startHour: 7,  // 07:00 AM
    endHour: 11,   // 11:00 AM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '7:00 AM - 11:00 AM',
  },

  // 12. CANADA WCLC 4D: 12:00 PM - 04:00 PM (4D Draw, 100x)
  {
    id: 'canada-wclc-4d',
    name: 'Canada WCLC 4D',
    category: 'international',
    digits: 4,
    period: 'CW-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '4190',
    lastDrawTime: Date.now() - 8100000,
    durationMs: FOUR_HOURS_MS,
    iconColor: '#DC2626',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
    badge: '12:00 PM - 4:00 PM',
    status: 'active',
    payoutMultiplier: 100,
    description: 'Western Canada Lottery Corporation 4D draw running 12:00 PM to 4:00 PM with 100x Payout',
    startHour: 12, // 12:00 PM
    endHour: 16,   // 04:00 PM
    startMinute: 0,
    endMinute: 0,
    scheduleLabel: '12:00 PM - 4:00 PM',
  },
];
