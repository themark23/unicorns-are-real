export interface MagicPotion {
  id: string;
  name: string;
  effect: string;
  ingredients: string[];
  instructions: string;
  image?: any;
  cardColor: string;
  accentColor: string;
}

export const MAGIC_POTIONS: MagicPotion[] = [
  {
    id: 'p1',
    name: 'Love Potion',
    effect: 'Makes everything around you bloom with love and kindness!',
    ingredients: [
      '3 teaspoons of rose water',
      '1 tablespoon of strawberry juice',
      '5 drops of vanilla essence',
      'A pinch of pink sugar stars',
      '2 tablespoons of sparkling lemonade',
    ],
    instructions:
      "Mix the rose water and strawberry juice gently in your favorite cup. Add the vanilla drops one by one while thinking of someone you love. Stir in the pink sugar stars clockwise three times. Top with sparkling lemonade and watch the magic bubble up!",
    image: require('../assets/images/potion-love.png'),
    cardColor: '#fff0f8',
    accentColor: '#ff9de2',
  },
  {
    id: 'p2',
    name: 'Speed Potion',
    effect: 'Gives you the energy to run as fast as a unicorn!',
    ingredients: [
      '1 cup of blueberry juice',
      '2 tablespoons of honey',
      'A big splash of lemon juice',
      '5 fresh mint leaves',
      '1/2 cup of coconut water',
      'Tiny blue sprinkles for magic',
    ],
    instructions:
      "Muddle the mint leaves at the bottom of your cup. Pour in the blueberry juice and coconut water. Add honey and lemon juice, then stir quickly in a circular motion to build up speed energy. Top with blue sprinkles and drink it up fast — the faster you drink it, the faster you'll go!",
    image: require('../assets/images/potion-speed.png'),
    cardColor: '#f0f4ff',
    accentColor: '#93c5fd',
  },
  {
    id: 'p3',
    name: 'Rainbow Potion',
    effect: 'Fills your whole day with color, joy, and magical surprises!',
    ingredients: [
      'Red layer: 2 tbsp cherry juice',
      'Orange layer: 1 tbsp peach nectar',
      'Yellow layer: 1 tbsp lemonade',
      'Green layer: 1 tbsp lime juice',
      'Blue layer: 1 tbsp blueberry juice',
      'Purple layer: 1 tbsp grape juice',
    ],
    instructions:
      "Very carefully pour each color layer into a tall glass one at a time, starting with purple at the bottom and red at the very top. Do NOT stir — let the beautiful rainbow layers show off their colors! Make a wish before you take your first sip!",
    image: require('../assets/images/potion-rainbow.png'),
    cardColor: '#fff8f0',
    accentColor: '#fda07a',
  },
  {
    id: 'p4',
    name: 'Sunshine Potion',
    effect: 'Brings warmth, happiness, and a bright golden glow to your whole day!',
    ingredients: [
      '1 cup of fresh orange juice',
      '1 tablespoon of golden honey',
      'A tiny pinch of turmeric (the sunshine spice!)',
      '3 drops of fresh lemon juice',
      '1/4 teaspoon of ginger (the little fire spice)',
      'Edible gold stars for topping',
    ],
    instructions:
      "Mix the orange juice, honey, turmeric, lemon, and ginger together while thinking of your happiest memory ever. Pour into your sunniest cup. Top with edible gold stars and stir clockwise three times. Best enjoyed in the morning when the sun is just waking up!",
    image: require('../assets/images/potion-sunshine.png'),
    cardColor: '#fffbf0',
    accentColor: '#fde68a',
  },
  {
    id: 'p5',
    name: 'Dream Potion',
    effect: 'Gives you the most wonderful magical dreams filled with adventures!',
    ingredients: [
      '1 cup of warm milk or oat milk',
      '1 tablespoon of honey',
      '1/4 teaspoon of pure vanilla extract',
      'A tiny pinch of cinnamon',
      'A few drops of lavender syrup (food-grade only!)',
      'Purple sugar sprinkles to seal the magic',
    ],
    instructions:
      "Gently warm the milk with a grown-up's help. Stir in honey and vanilla until the magic begins to wake up. Add cinnamon and lavender syrup, swirling slowly like a dream. Sprinkle purple sugar on top. Drink it 30 minutes before bedtime and the most wonderful sweet dreams will follow!",
    image: require('../assets/images/potion-dream.png'),
    cardColor: '#f5f0ff',
    accentColor: '#c084fc',
  },
  {
    id: 'p6',
    name: 'Invisible Potion',
    effect: 'Makes you feel mysteriously sneaky and full of delightful secrets!',
    ingredients: [
      '1 cup of clear lemon-lime soda',
      '1 tablespoon of white grape juice',
      '2 teaspoons of coconut water',
      'Silver edible glitter',
      '5 drops of clear vanilla extract',
      'Crystal-clear ice cubes',
    ],
    instructions:
      "Fill your cup with crystal-clear ice cubes. Pour in the lemon-lime soda very slowly. Add white grape juice and coconut water. Drop in the clear vanilla extract. Sprinkle silver glitter on top and watch it shimmer like pure magic! The secret: invisible things can still be incredibly beautiful.",
    image: require('../assets/images/potion-invisible.png'),
    cardColor: '#f0f8ff',
    accentColor: '#a5f3fc',
  },
  {
    id: 'p7',
    name: 'Giggle Potion',
    effect: 'Makes everything hilarious and fills you with unstoppable giggles!',
    ingredients: [
      '1 cup of fresh orange juice',
      '2 tablespoons of mango nectar',
      'A handful of gummy worms (the wiggly kind!)',
      'Pop Rocks candy (the tickly kind!)',
      '1 tablespoon of pineapple juice',
      'A really silly straw',
    ],
    instructions:
      "Mix orange juice, mango nectar, and pineapple juice together while making your silliest face. Drop in the gummy worms and watch them wiggle around. RIGHT before drinking, drop in the Pop Rocks and listen to the giggles begin! Use your most ridiculous straw for maximum giggle power!",
    image: require('../assets/images/potion-giggle.png'),
    cardColor: '#fff5f0',
    accentColor: '#fda07a',
  },
  {
    id: 'p8',
    name: 'Friendship Potion',
    effect: 'Helps you make wonderful new friends and keeps old ones close forever!',
    ingredients: [
      '1/2 cup of green apple juice',
      '1/2 cup of white grape juice',
      '2 tablespoons of golden honey',
      'A few fresh mint leaves',
      '1 tablespoon of lime juice',
      'Green sugar crystals and a heart straw',
    ],
    instructions:
      "Mix apple and grape juices together while thinking warm thoughts about your best friends. Add honey and lime juice. Put in fresh mint leaves and gently press them to release their friendly fragrance. Pour into two glasses to share — because a Friendship Potion only truly works when you drink it with a friend!",
    image: require('../assets/images/potion-friendship.png'),
    cardColor: '#f0fff4',
    accentColor: '#86efac',
  },
  {
    id: 'p9',
    name: 'Bravery Potion',
    effect: 'Fills your heart with courage to face anything scary or new!',
    ingredients: [
      '1 cup of cherry or cranberry juice',
      '1 tablespoon of pomegranate juice',
      '1 teaspoon of honey',
      'A tiny pinch of cinnamon (the brave spice!)',
      'Red star-shaped sprinkles',
      '1/4 cup of sparkling water for courage bubbles',
    ],
    instructions:
      "Pour the cherry juice into your bravest cup. Add pomegranate juice and honey, stirring directly toward your fears to face them head on! Sprinkle in cinnamon and stir 5 times saying 'I am brave!' out loud each time. Add sparkling water for extra courage bubbles and top with red stars. You've got this!",
    image: require('../assets/images/potion-bravery.png'),
    cardColor: '#fff0f0',
    accentColor: '#fb7185',
  },
  {
    id: 'p10',
    name: 'Unicorn Sparkle Potion',
    effect: 'Awakens your inner unicorn magic and boundless creativity!',
    ingredients: [
      '1 cup of pink lemonade',
      '1 tablespoon of raspberry syrup',
      '2 tablespoons of coconut cream',
      'Lots of rainbow sprinkles',
      'Pink and gold edible glitter',
      'A spiral straw (just like a unicorn horn!)',
    ],
    instructions:
      "Blend the pink lemonade with raspberry syrup until perfectly rosy pink. Stir in the coconut cream in a swirling spiral motion, just like a unicorn horn spinning! Pour into your most magical cup. Sprinkle rainbow sprinkles and gold glitter on top until it sparkles. Drink through your spiral straw and feel your inner unicorn completely awaken!",
    image: require('../assets/images/potion-sparkle.png'),
    cardColor: '#fef0ff',
    accentColor: '#ff9de2',
  },
];
