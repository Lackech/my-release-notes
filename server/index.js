const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const matter = require('gray-matter');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3001;

// Paths
const DAILY_DIR = path.join(__dirname, '../daily');
const LEARNINGS_DIR = path.join(__dirname, '../learnings');
const TEMPLATES_DIR = path.join(__dirname, '../templates');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(DAILY_DIR, { recursive: true });
  await fs.mkdir(LEARNINGS_DIR, { recursive: true });
}

// Get all daily entries
app.get('/api/daily', async (req, res) => {
  try {
    const files = await fs.readdir(DAILY_DIR);
    const entries = await Promise.all(
      files
        .filter(f => f.endsWith('.md'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(DAILY_DIR, file), 'utf-8');
          const { data, content: markdown } = matter(content);
          const date = file.replace('.md', '');

          // Extract tags
          const tagMatch = markdown.match(/##\s*Tags\s*\n(.*?)(?=\n##|\n$|$)/s);
          const tags = tagMatch ? tagMatch[1].match(/#[\w-]+/g) || [] : [];

          return {
            date,
            file,
            tags,
            preview: markdown.substring(0, 200).replace(/#/g, '').trim(),
            content: markdown,
            ...data
          };
        })
    );

    res.json(entries.sort((a, b) => b.date.localeCompare(a.date)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single daily entry
app.get('/api/daily/:date', async (req, res) => {
  try {
    const filePath = path.join(DAILY_DIR, `${req.params.date}.md`);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content, date: req.params.date });
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Return template if file doesn't exist
      const template = await fs.readFile(path.join(TEMPLATES_DIR, 'daily-log.md'), 'utf-8');
      const content = template.replace('[DATE]', req.params.date);
      res.json({ content, date: req.params.date, isNew: true });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Save daily entry
app.post('/api/daily/:date', async (req, res) => {
  try {
    const filePath = path.join(DAILY_DIR, `${req.params.date}.md`);
    await fs.writeFile(filePath, req.body.content, 'utf-8');
    res.json({ success: true, date: req.params.date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all learnings
app.get('/api/learnings', async (req, res) => {
  try {
    const files = await fs.readdir(LEARNINGS_DIR);
    const learnings = await Promise.all(
      files
        .filter(f => f.endsWith('.md'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(LEARNINGS_DIR, file), 'utf-8');
          const { data, content: markdown } = matter(content);

          // Extract title and tags
          const titleMatch = markdown.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : file.replace('.md', '');

          const tagMatch = markdown.match(/##\s*Tags\s*\n(.*?)(?=\n##|\n$|$)/s);
          const tags = tagMatch ? tagMatch[1].match(/#[\w-]+/g) || [] : [];

          const summaryMatch = markdown.match(/##\s*Quick Summary\s*\n(.*?)(?=\n##)/s);
          const summary = summaryMatch ? summaryMatch[1].trim() : '';

          return {
            file,
            slug: file.replace('.md', ''),
            title,
            tags,
            summary,
            ...data
          };
        })
    );

    res.json(learnings.sort((a, b) => a.title.localeCompare(b.title)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single learning
app.get('/api/learnings/:slug', async (req, res) => {
  try {
    const filePath = path.join(LEARNINGS_DIR, `${req.params.slug}.md`);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content, slug: req.params.slug });
  } catch (error) {
    if (error.code === 'ENOENT') {
      const template = await fs.readFile(path.join(TEMPLATES_DIR, 'learning.md'), 'utf-8');
      res.json({ content: template, slug: req.params.slug, isNew: true });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Save learning
app.post('/api/learnings/:slug', async (req, res) => {
  try {
    const filePath = path.join(LEARNINGS_DIR, `${req.params.slug}.md`);
    await fs.writeFile(filePath, req.body.content, 'utf-8');
    res.json({ success: true, slug: req.params.slug });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const dailyFiles = await fs.readdir(DAILY_DIR);
    const learningFiles = await fs.readdir(LEARNINGS_DIR);

    // Get all tags
    const allTags = new Set();
    const dailyMd = dailyFiles.filter(f => f.endsWith('.md'));

    for (const file of dailyMd) {
      const content = await fs.readFile(path.join(DAILY_DIR, file), 'utf-8');
      const tags = content.match(/#[\w-]+/g) || [];
      tags.forEach(tag => allTags.add(tag));
    }

    res.json({
      totalDays: dailyMd.length,
      totalLearnings: learningFiles.filter(f => f.endsWith('.md')).length,
      tags: Array.from(allTags)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start server
ensureDirectories().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
