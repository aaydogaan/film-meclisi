const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('/Users/selmanaydogan/Downloads/movie-tracking-website/app', (file) => {
  if (file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('<AppHeader')) {
      const newContent = content.replace(
        /<AppHeader([^>]+)\/>/g,
        (match, p1) => {
          if (p1.includes('avatarUrl=')) return match;
          return `<AppHeader${p1}avatarUrl={user.user_metadata?.avatar_url} />`;
        }
      );
      if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
});
