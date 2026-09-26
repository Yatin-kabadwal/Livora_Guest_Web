import { Leaf, HeartHandshake, Home, Sprout } from 'lucide-react';
import { PageHero } from '@/components/ui/Section';
import { Reveal, ParallaxImage, MaskText } from '@/components/ui/Motion';
import { Btn } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';
import { pageMeta } from '@/lib/seo';
import { photos } from '@/config/photos';

export const metadata = pageMeta('Our Story', 'A forest sanctuary at the edge of Jim Corbett National Park: ten rooms, sustainability-minded hospitality, hosted by Livora.', '/about');

const values = [
  { Icon: Home, t: 'Small on purpose', d: 'Ten rooms and no more. It keeps the property quiet and lets us know every guest.' },
  { Icon: Sprout, t: 'Gentle on the forest', d: 'We try to tread lightly, respecting the wildlife, the water and the trees that surround us.' },
  { Icon: HeartHandshake, t: 'Warm, unhurried hosting', d: 'Hospitality that feels like being looked after by people who are glad you came.' },
  { Icon: Leaf, t: 'Rooted in place', d: 'Local flavours, local guides and a deep respect for the landscape of Corbett.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Our story" title="A sanctuary at the forest's edge" italicWords={['sanctuary']} sub="Corbett The Vedant By Livora is a small forest resort on the edge of Jim Corbett National Park, Uttarakhand." image={photos.resort.exterior} />
      <section className="container-x grid items-center gap-16 py-20 lg:grid-cols-2">
        <div className="space-y-6 text-lg leading-relaxed text-cream/75">
          <Reveal><p>Jim Corbett is one of India's oldest and best-loved national parks: a landscape of Sal forest, grassland and river, home to tigers, elephants and a remarkable range of birds. We wanted to offer a place to stay that feels like it belongs to that landscape.</p></Reveal>
          <Reveal delay={0.1}><p>The Vedant is intentionally small. With only ten rooms, mornings begin with birdsong instead of crowds, and the team has time to plan your safari, pack a picnic or simply pour you a cup of tea while the mist lifts.</p></Reveal>
          <Reveal delay={0.2}><p>We think good hospitality is quiet, attentive and honest. That is how we intend to host you: warmly, simply, and with respect for the forest that makes this place special.</p></Reveal>
        </div>
        <ParallaxImage src={photos.resort.about1} alt="The resort among the trees" className="aspect-[4/5] rounded-[2.5rem]" />
      </section>
      <section className="border-y border-white/10 bg-forest-900/50 py-24">
        <div className="container-x"><h2 className="h-display mb-14 text-5xl sm:text-6xl"><MaskText text="What we hold dear" italicWords={['dear']} /></h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{values.map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 0.08}><div className="glass h-full rounded-3xl p-7"><span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gold/10 text-gold"><Icon size={22} /></span><h3 className="font-display text-2xl">{t}</h3><p className="mt-2 text-sm leading-relaxed text-cream/65">{d}</p></div></Reveal>))}</div></div>
      </section>
      <section className="container-x grid items-center gap-14 py-24 lg:grid-cols-[1fr_1.2fr]">
        <Reveal><div className="glass grid place-items-center rounded-[2.5rem] p-14"><LogoMark className="h-40 w-40 drop-shadow-[0_0_30px_rgba(217,183,106,.35)]" /></div></Reveal>
        <div>
          <Reveal><p className="eyebrow mb-4">By Livora</p></Reveal>
          <h2 className="h-display text-5xl sm:text-6xl"><MaskText text="A Livora hospitality home" italicWords={['Livora']} /></h2>
          <Reveal delay={0.1}><p className="mt-6 leading-relaxed text-cream/75">Livora is the hospitality brand behind The Vedant. The name stands for a simple idea: places that make people feel welcome, well cared for and a little more at ease than when they arrived.</p></Reveal>
          <Reveal delay={0.2}><p className="mt-4 leading-relaxed text-cream/65">Every detail, from how we greet you to how we cook your dinner, is guided by that idea.</p></Reveal>
          <Reveal delay={0.3}><div className="mt-8 flex flex-wrap gap-4"><Btn href="/rooms">See the rooms</Btn><Btn href="/contact" variant="ghost">Talk to us</Btn></div></Reveal>
        </div>
      </section>
    </>
  );
}
