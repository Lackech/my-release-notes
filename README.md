# My Daily Coding Progress

Quick and easy documentation system for tracking daily coding work, learning, and deliverables with a beautiful web interface.

## 🚀 Quick Start

### Using the Web App (Recommended)

1. **Install dependencies**:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Start the app**:
   ```bash
   npm start
   ```

3. **Open in browser**: http://localhost:3001

The app features:
- 📅 **Calendar view** - See all your entries at a glance
- ✍️ **Live markdown editor** - Preview as you type
- 🏷️ **Tag filtering** - Filter by #terraform, #aws, #nestjs, etc.
- 📊 **Dashboard stats** - Track your progress
- 📚 **Knowledge base** - Browse all your learnings

### Manual Entry (Terminal)

You can still create entries manually:

```bash
# Copy today's template
cp templates/daily-log.md daily/$(date +%Y-%m-%d).md

# Document a learning
cp templates/learning.md learnings/nestjs-pipeline-setup.md
```

## Structure

```
my-release-notes/
├── daily/                  # Quick daily logs
├── learnings/              # Detailed how-to docs
├── diagrams/               # Excalidraw files
├── reports/                # Auto-generated summaries
└── templates/              # Copy these to start
```

## 📱 How to Use the App

### Calendar View
- **Green dates** = Days with entries
- **Click any date** to view or create an entry
- See **recent entries** and stats at a glance

### Creating Entries
1. Click a date on the calendar
2. Click "Edit" to start writing
3. Use the **split view** - markdown on left, preview on right
4. Click "Save" when done

### Learnings (Knowledge Base)
- Click "Learnings" in the header
- Browse all your detailed documentation
- **Filter by tags** (#terraform, #aws, etc.)
- Click any card to view the full document
- Click "+ New Learning" to create one

### Tags
Add tags at the bottom of any entry:
```markdown
## Tags
#terraform #aws #nestjs #pipeline
```

Then filter by clicking tags in the app!

## For Different Audiences

- **Technical folks**: Share specific learnings or daily logs
- **Non-technical**: Daily logs are written in plain language
- **Stakeholders**: Use calendar view to show consistent progress
- **Excalidraw diagrams**: Export as SVG and drop in `diagrams/`, reference in docs

## Tips

1. **Daily habit**: Spend 5 minutes at end of day logging your work
2. **Be consistent**: Even small entries show progress
3. **Use tags**: Makes finding related work super easy
4. **Detailed learnings**: When you solve something hard, document it
5. **Diagrams**: Visual > text for architecture and flows
