import { Wifi, Snowflake, Tv, Droplets, Sunrise, Coffee, Wine, Lock, Car, ConciergeBell, Bath, Flame, Briefcase, Shirt, Wind, Check, Trees, Mountain, Bed, ShowerHead, Utensils } from 'lucide-react';

const MAP: Array<[RegExp, typeof Wifi]> = [
  [/wi-?fi|internet/i, Wifi], [/\bac\b|air.?con|cooling/i, Snowflake], [/tv|television/i, Tv], [/geyser|hot water/i, Droplets],
  [/balcony|terrace|sit.?out/i, Sunrise], [/tea|coffee|kettle/i, Coffee], [/mini.?bar|fridge/i, Wine], [/safe|locker/i, Lock], [/park/i, Car],
  [/room service|concierge/i, ConciergeBell], [/bath ?tub|tub/i, Bath], [/shower/i, ShowerHead], [/heater|fire/i, Flame], [/desk|work/i, Briefcase],
  [/wardrobe|closet/i, Shirt], [/hair ?dryer|dryer/i, Wind], [/garden|forest|view/i, Trees], [/mountain|hill/i, Mountain], [/bed/i, Bed], [/breakfast|dining|kitchen/i, Utensils],
];
export function AmenityIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = MAP.find(([re]) => re.test(name))?.[1] || Check;
  return <Icon size={size} />;
}
