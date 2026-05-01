export type StoryCategory = 'magical adventure' | 'friendship' | 'teamwork' | 'mystery' | 'silly and funny';

export interface UnicornStory {
  id: string;
  title: string;
  text: string;
  category: StoryCategory;
}

export const STORY_CATEGORIES: { id: StoryCategory; label: string }[] = [
  { id: 'magical adventure', label: 'Magical Adventure' },
  { id: 'friendship', label: 'Friendship' },
  { id: 'teamwork', label: 'Teamwork' },
  { id: 'mystery', label: 'Mystery' },
  { id: 'silly and funny', label: 'Silly & Funny' },
];

export const UNICORN_STORIES: UnicornStory[] = [
  {
    id: 's1',
    title: 'The Lost Rainbow Bridge',
    category: 'magical adventure',
    text: "Starlight the unicorn discovered that the rainbow bridge connecting Sparkle Forest to the Cloud Kingdom had gone missing! Using her glowing golden horn, she followed a trail of rainbow sparkles high into the clouds. She found the bridge had floated to the moon while it was sleeping. With a gentle magical nudge from her horn, Starlight guided the bridge back into place, and the whole forest erupted in colors and happy cheers!",
  },
  {
    id: 's2',
    title: 'The Crystal Mountain Quest',
    category: 'magical adventure',
    text: "Moonbeam the unicorn needed to reach the top of Crystal Mountain to retrieve the Golden Star for the princess's birthday. The path was slippery with ice and swirling snowflakes. But Moonbeam discovered that her hooves could sparkle with warm light, melting the ice safely with every step. She reached the glittering summit, collected the star, and delivered it just in time for the most magical birthday celebration ever!",
  },
  {
    id: 's3',
    title: 'The Secret Waterfall',
    category: 'magical adventure',
    text: "Nova the young unicorn heard whispers of a hidden waterfall that could grant one wish to any creature brave enough to find it. She journeyed through the Whispering Woods, past the Giggling Mushroom Field, and over the Twinkling Stones. When she found the waterfall shimmering with every color of the rainbow, she made her wish — not for herself, but for all her friends to always be happy. The waterfall sparkled and the wish was granted!",
  },
  {
    id: 's4',
    title: 'A Friend for Flutter',
    category: 'friendship',
    text: "Flutter the tiny fairy had no one to play with — she was too small for the giants and too sparkly for the shadows. One afternoon, Rosepetal the unicorn pranced over and said, 'I love your sparkles! Want to make magic together?' They spent all day decorating clouds with glitter and turning raindrops into tiny prisms. They became the very best of friends, and neither was ever lonely again.",
  },
  {
    id: 's5',
    title: 'The Shy Little Dragon',
    category: 'friendship',
    text: "Prism the unicorn found a tiny dragon hiding behind a boulder, afraid that no one would like her because she accidentally sneezed fire. 'I think your fire sneezes are wonderful!' said Prism with a smile. 'They make the best campfire in the whole forest!' The little dragon smiled for the first time in weeks. Together they roasted marshmallows and laughed, and the dragon discovered that being different was actually quite magical.",
  },
  {
    id: 's6',
    title: 'Two Moons in the Sky',
    category: 'friendship',
    text: "Silver and Gold were two unicorns who never spoke — Silver thought Gold was too shiny, and Gold thought Silver was too cool. One stormy night, they both sheltered under the same ancient oak tree. As lightning flashed, they realized they made the most beautiful light together — silver and gold combined into something extraordinary. From that night on, they were inseparable, and everyone in the kingdom called them the Moon Twins.",
  },
  {
    id: 's7',
    title: 'The Stuck Rainbow',
    category: 'teamwork',
    text: "One morning, the rainbow got stuck halfway across the sky and just stopped right in the middle! Princess the unicorn, Comet the pegasus, and Glimmer the fairy each tried alone to fix it and failed. But when they worked together — Princess pulling the bottom with her horn, Comet pushing the top with her wings, and Glimmer sprinkling color dust — the rainbow slid beautifully into place. The whole kingdom cheered their amazing teamwork!",
  },
  {
    id: 's8',
    title: 'Building the Dream Castle',
    category: 'teamwork',
    text: "The woodland animals wanted to build a cozy magical castle, but the task was far too big for any one creature. The beavers built the strong walls, the bluebirds added the towers, the squirrels gathered the magic sparkle stones, and Crystal the unicorn used her horn to make everything shimmer and glow. When it was finished, they all stood back and gasped — it was the most beautiful castle in the entire Enchanted Valley!",
  },
  {
    id: 's9',
    title: 'The Great Ice Festival',
    category: 'teamwork',
    text: "The Ice Festival was nearly ruined when a warm wind melted all the beautiful snow sculptures! The polar bears, snow fairies, and Winter the alicorn had only one hour to remake everything before the guests arrived. The polar bears carved quickly, the fairies painted delicate frost patterns, and Winter flew in wide circles to keep everything frozen with her icy wings. They finished just as the first guest walked in, and the festival was more magical than ever before!",
  },
  {
    id: 's10',
    title: 'The Missing Moonstone',
    category: 'mystery',
    text: "The moonstone that lit up Sparkle Valley every night had completely vanished! Detective unicorn Indigo sniffed out tiny glittery hoofprints leading all the way to the old Sleeping Willow tree. There, tucked inside the hollow trunk, she found the moonstone — being used as a nightlight by a family of frightened baby fireflies who had lost their glow. Indigo smiled warmly, let them borrow it for the winter, and found a bright new star to light the valley.",
  },
  {
    id: 's11',
    title: 'The Purple Fog Mystery',
    category: 'mystery',
    text: "Every morning, a mysterious purple fog covered the flower meadow, and the flowers couldn't get any sunlight. Violet the unicorn followed the fog all the way back to its source — a sad little cloud who was crying purple tears because he had no friends. Violet kindly introduced him to the rainbow and the warm sunshine. The little cloud was so happy that he turned his tears into the most beautiful purple rain the meadow had ever seen!",
  },
  {
    id: 's12',
    title: 'Who Painted the Clouds?',
    category: 'mystery',
    text: "Someone had been secretly painting beautiful pink swirls on the clouds every night, and absolutely no one knew who! Aurora the unicorn stayed up very late to catch the mysterious artist at work. To her pure delight, she discovered it was the Northern Lights themselves — they had been secretly decorating the sky as a gift for all the sleeping creatures below. Aurora joyfully joined in, and together they painted the most spectacular sky the world had ever seen!",
  },
  {
    id: 's13',
    title: 'The Hiccupping Unicorn',
    category: 'silly and funny',
    text: "Sprinkle the unicorn had a terrible case of hiccups — but every single time she hiccupped, a rainbow shot out of her horn! HIC! A rainbow landed on the bakery. HIC! Another one decorated the entire school. By the end of the day, the whole village was covered in beautiful colorful arches. The mayor laughed so hard he fell off his chair and declared it Hiccup Holiday. Everyone agreed it was the very best accidental celebration ever!",
  },
  {
    id: 's14',
    title: 'Too Many Wishes',
    category: 'silly and funny',
    text: "Fizzy the unicorn accidentally granted seventeen wishes all at once — including one that made all the fish fly through the air and all the birds swim underwater! The flying fish were quite pleased with the new arrangement. The swimming birds, however, were definitely not happy about it. Fizzy spent all day blushing and sorting everything out. But the flying fish loved their wings so much that they asked politely if they could keep them on weekends.",
  },
  {
    id: 's15',
    title: 'The Backwards Day',
    category: 'silly and funny',
    text: "One very strange morning, Twirl the unicorn woke up and everything was completely backwards — she walked backwards, neighed backwards, and her rainbow came out upside-down! The whole village giggled non-stop, especially when her upside-down rainbow led to a pot of gold at the TOP instead of the bottom! Nobody had ever thought to look up there before. Twirl decided backwards days were her absolute favorite, so she officially declared one every month!",
  },
];
