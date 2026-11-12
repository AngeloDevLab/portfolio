export const en = {
  'meta.title': 'Angelo Pietsch | Frontend Developer',
  'meta.description': 'Portfolio of Angelo Pietsch, frontend developer from Saxony, with projects built in Angular, TypeScript and three.js.',

  'lang.switch': 'Switch language to German',
  'logo.home': 'Angelo Pietsch, home',
  'nav.label': 'Main',
  'nav.about': 'About me',
  'nav.skills': 'Skills',
  'nav.projects': 'Projects',
  'menu.open': 'Open menu',
  'menu.label': 'Menu',
  'menu.nav': 'Mobile',

  'hero.work': 'Check my work',
  'hero.contact': 'Contact me',
  'hero.scroll': 'Scroll to about me',
  'social.email': 'Email',

  'ring.role': 'Frontend Developer',
  'ring.openToWork': 'Open to work',
  'ring.location': 'Based in Saxony',
  'ring.remote': 'Available for remote work',

  'about.label': 'Who I Am',
  'about.title': 'About me',
  'about.intro':
    "Hey there, I'm Angelo! I build for the web with HTML, SCSS, TypeScript and Angular. I also have a passion for game development: I love bringing my own ideas to life and iterating on them, which is how the 3D elements on this page came about.",
  'about.location': 'Based in Saxony, Germany, and open to remote work.',
  'about.learning':
    "Always learning, always iterating. I'm finishing the frontend part of my training at Developer Akademie, and backend comes next. For this portfolio I taught myself three.js.",
  'about.approach':
    'I solve problems step by step: build, test, improve, repeat. My projects go beyond the browser too: they use services like Supabase and n8n, and some run on my own server.',

  'skills.label': 'Technologies',
  'skills.intro':
    'These are the technologies I build with, from the first layout to the deployed project. My focus is on Angular and TypeScript, backed by services like Supabase and Firebase for data and n8n for automation.',
  'skills.subtitle': 'You need <span class="skills__highlight">another skill?</span>',
  'skills.note': 'Feel free to contact me. I enjoy picking up new tools and look forward to expanding my knowledge.',
  'skills.talk': "Let's Talk",
  'skills.growth': 'Growth mindset',
  'skills.bubble': 'I have a special interest in learning',

  'projects.title': 'Featured Projects',
  'projects.intro': 'Explore a selection of my work here. Interact with the projects to see my skills in action.',
  'dialog.close': 'Close',
  'dialog.question': 'What is this project about?',
  'dialog.live': 'Live Test',
  'dialog.next': 'Next project',
  'project.join.alt': 'Screenshot of Join',
  'project.join.text':
    'Task manager inspired by the Kanban system. Create and organize tasks with drag and drop, and assign contacts and categories. Started as a group project, then extended on my own with an n8n issue collector that turns incoming emails into tickets using AI.',
  'project.chromatic.alt': 'Screenshot of CHROMATIC',
  'project.chromatic.text':
    '2D platformer built to learn and practice object-oriented programming in JavaScript. Fight your way through the level and defeat all enemies. Along the way I designed the maps in Tiled and took a deep dive into pixel art.',
  'project.poll.alt': 'Screenshot of the Poll App',
  'project.poll.text':
    'My first Angular app: create polls, vote and watch the results update live. It showed me how much a good framework takes off your hands, and was my first step into routing, custom pipes and Supabase as a database.',
  'project.cuisine.alt': 'Screenshot of Code à Cuisine',
  'project.cuisine.text':
    'Recipe generator built with Angular. Enter the ingredients you have at home and an AI suggests three matching recipes, which are saved to a shared cookbook. n8n connects to Google Gemini with daily limits to keep costs under control, and Supabase stores the recipes.',

  'references.title': 'What my colleagues say about me',
  'references.quote1':
    'Angelo stands out through his initiative, creativity and eagerness to learn. He questions things and dives into new topics with real commitment, aiming not just to find solutions but to truly understand them.',
  'references.author1': 'ChatGPT - AI Assistant',
  'references.quote2':
    'Angelo knows what he wants and says it clearly. He asks for honest answers instead of sugarcoated ones, and his Unity and C# background shows in his strong sense for structure and game logic.',
  'references.author2': 'Claude - AI Pair Programmer',
  'references.quote3':
    'Placeholder: Angelo has proven to be a reliable group partner. His technical skills and proactive approach were crucial to the success of our project.',
  'references.quote4':
    'Placeholder: Working with Angelo was a great experience. He always kept the bigger picture in mind and helped the team whenever someone got stuck.',
  'references.quote5':
    'Placeholder: Angelo stayed calm under pressure, communicated clearly and delivered clean code on time. I would happily work with him again.',
  'references.authorTeam': 'Name - Team Partner',
  'references.authorDev': 'Name - Frontend Developer',
  'references.prev': 'Previous reference',
  'references.next': 'Next reference',
  'references.dot': 'Show reference',

  'contact.label': 'Contact me',
  'contact.title': "Let's work together",
  'contact.subtitle': 'Got a problem to solve?',
  'contact.intro':
    "Have an idea for a website or app, or are you looking for support for your team? Tell me what you are working on, and let's find out how I can help bring it to life.",
  'contact.cta': 'Need a frontend developer? <span class="contact__highlight">Let\'s talk!</span>',
  'contact.name.label': "What's your name?",
  'contact.name.placeholder': 'Your name goes here',
  'contact.name.error': 'Oops! It seems your name is missing',
  'contact.email.label': "What's your email?",
  'contact.email.placeholder': 'youremail@email.com',
  'contact.email.error': 'Whoops! Your email is required',
  'contact.message.label': 'How can I help you?',
  'contact.message.placeholder': 'Hello Angelo, I am interested in...',
  'contact.message.error': 'What do you need to develop?',
  'contact.privacy':
    'I\'ve read the <a class="contact__link" href="privacy.html">privacy policy</a> and agree to the processing of my data as outlined.',
  'contact.privacy.error': 'Please accept the privacy policy',
  'contact.submit': 'Say Hello ;)',
  'contact.success': "Thanks! I'll get back to you soon.",
  'contact.failed': 'Sending failed. Please try again later.',

  'imprint.title': 'Legal Notice | Angelo Pietsch',
  'privacy.title': 'Privacy Policy | Angelo Pietsch',

  'footer.info': 'Frontend Developer<br />Löbau, Germany',
  'footer.legal': 'Legal Notice',
  'footer.privacy': 'Privacy Policy',
};

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
