/** Experiences shown on the home page scroller and /experiences. Copy is intentionally generic and honest. */
import { photos } from './photos';

export type Experience = {
  slug: string;
  title: string;
  kicker: string;
  short: string;
  long: string;
  image: string;
  notes: string[];
};

export const experiences: Experience[] = [
  {
    slug: 'jeep-safari',
    title: 'Jeep Safari',
    kicker: 'Jim Corbett National Park',
    short: 'Early-morning drives into the reserve, where tigers are famously found. Sightings are never promised, wonder usually is.',
    long: 'Jim Corbett is one of India\'s most celebrated wildlife reserves, known for its tigers, elephants and extraordinary birdlife. Safaris run in open jeeps with trained guides, through grassland, riverbed and Sal forest. Zones, timings and permits are set by the park, so please speak to us before you travel and we will help you plan.',
    image: photos.experiences['jeep-safari'],
    notes: ['Permits and zones are managed by the park authorities', 'Sightings depend on nature and are never guaranteed', 'Ask us to help plan your safari'],
  },
  {
    slug: 'nature-walk',
    title: 'Guided Nature Walk',
    kicker: 'Slow down, look closer',
    short: 'A gentle walk along forest edges and village paths, reading tracks, trees and the small details most people miss.',
    long: 'Walk at a comfortable pace along the fringes of the forest with someone who knows the land. Learn to spot pug marks, identify Sal and teak, and listen for the calls that tell you who is nearby. Suitable for most ages and fitness levels.',
    image: photos.experiences['nature-walk'],
    notes: ['Best in the cooler hours of morning and late afternoon', 'Comfortable shoes recommended', 'Please call to confirm timings'],
  },
  {
    slug: 'birdwatching',
    title: 'Birdwatching',
    kicker: 'Wake up to the chorus',
    short: 'The Corbett region is a haven for birds. Bring binoculars, or simply bring patience and a warm cup of tea.',
    long: 'The forest, grassland and river around Corbett support a remarkable variety of birds. Dawn is the golden hour, when the canopy comes alive. Whether you are a seasoned birder or simply curious, we can arrange a guide to help you look and listen.',
    image: photos.experiences.birdwatching,
    notes: ['Dawn and dusk are the most rewarding hours', 'Binoculars help; a guide helps more', 'Species seen vary by season'],
  },
  {
    slug: 'river-picnic',
    title: 'Riverside Picnic',
    kicker: 'Kosi river air',
    short: 'A relaxed afternoon by the water with a packed lunch, shade and nothing on the schedule.',
    long: 'Spend an unhurried afternoon beside the river: skim stones, read, nap, or watch the light move across the water. We can pack a picnic from Vedant Kitchen. Access and timings depend on the season and river conditions, so please ask us first.',
    image: photos.experiences['river-picnic'],
    notes: ['Subject to season and river conditions', 'Picnic can be packed from the kitchen', 'Please enquire in advance'],
  },
  {
    slug: 'bonfire',
    title: 'Bonfire Evenings',
    kicker: 'After the light fades',
    short: 'Gather around the fire under a wide sky, with warm food, quiet conversation and the sound of the forest.',
    long: 'When the evening cools, the fire is lit and the night belongs to the forest. Enjoy warm drinks, good company and stargazing away from city glare. Bonfire evenings are arranged on request and may be subject to weather and safety guidance.',
    image: photos.experiences.bonfire,
    notes: ['Arranged on request', 'Subject to weather and forest guidelines', 'Perfect for families and groups'],
  },
  {
    slug: 'yoga',
    title: 'Yoga & Wellness',
    kicker: 'Breathe with the forest',
    short: 'Start the day with stretching and breath on the lawn, or wind down with a quiet moment before dinner.',
    long: 'A calm start to the day among Sal trees. Sessions are relaxed and open to all levels. Please ask about availability of an instructor and wellness options during your stay.',
    image: photos.experiences.yoga,
    notes: ['Open to all levels', 'Availability to be confirmed with the front desk', 'Bring comfortable clothes'],
  },
];
