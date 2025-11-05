# My Daily Coding Progress

Quick and easy documentation system for tracking daily coding work, learning, and deliverables.

## Quick Start

### Daily Entry (5 minutes)
```bash
# Copy today's template
cp templates/daily-log.md daily/$(date +%Y-%m-%d).md

# Edit and add your work
# That's it!
```

### Document a Learning/Feature
```bash
# Copy the learning template
cp templates/learning.md learnings/nestjs-pipeline-setup.md

# Fill it in - technical details, diagrams, code snippets
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

## For Different Audiences

- **Technical folks**: Share `learnings/` or specific daily logs
- **Non-technical**: Run `npm run summary` to generate high-level progress report
- **Stakeholders**: Weekly summaries in `reports/`

## Tips

1. **Keep it simple**: Don't overthink - just capture what you did
2. **Diagrams**: Export Excalidraw as SVG and drop in `diagrams/`
3. **Code snippets**: Include them inline - makes docs searchable
4. **Tags**: Use `#terraform`, `#aws`, `#nestjs` for easy filtering
