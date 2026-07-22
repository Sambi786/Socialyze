const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import for Filters and Wand2 icon if missing
if (!content.includes('SocialyzeFilters')) {
  content = content.replace(
    "import { SocialyzeGames } from './components/SocialyzeGames';",
    "import { SocialyzeGames } from './components/SocialyzeGames';\nimport { SocialyzeFilters } from './components/SocialyzeFilters';"
  );
}
if (!content.includes('Wand2')) {
  content = content.replace(
    'Gamepad2, Layers, MessageSquare, PlaySquare, UserCircle, Bot',
    'Gamepad2, Layers, MessageSquare, PlaySquare, UserCircle, Bot, Wand2'
  );
}

// Update tabs array
content = content.replace(
  /    \{ id: "games", icon: <Gamepad2 className="w-6 h-6" \/>, label: "Games" \},/,
  '    { id: "games", icon: <Gamepad2 className="w-6 h-6" />, label: "Games" },\n    { id: "filters", icon: <Wand2 className="w-6 h-6" />, label: "Filters" },'
);

// Update Tab type
content = content.replace(
  /type Tab = "feed" \| "social" \| "watch" \| "ai" \| "games" \| "profile";/,
  'type Tab = "feed" | "social" | "watch" | "ai" | "games" | "filters" | "profile";'
);

// Update renderContent switch
content = content.replace(
  /      case "games": return <SocialyzeGames onExit=\{\(\) => setCurrentTab\('feed'\)\} \/>;/,
  "      case \"games\": return <SocialyzeGames onExit={() => setCurrentTab('feed')} />;\n      case \"filters\": return <SocialyzeFilters />;"
);

fs.writeFileSync(file, content);
console.log("Updated App.tsx");
