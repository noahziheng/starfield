# Commit Message Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

```
<type>: <description>
```

- **Single line only** - No multi-line commit messages
- **English only** - All commit messages must be in English
- **Lowercase** - Description should start with lowercase letter
- **No period** - Do not end with a period
- **Imperative mood** - Use "add" not "added" or "adds"

## Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding missing tests or correcting existing tests |
| `chore` | Changes to the build process or auxiliary tools |

## Examples

✅ Good:
- `feat: add parallax effect to starfield`
- `fix: resolve canvas resize issue`
- `docs: add online demo link`
- `chore: initial commit`

❌ Bad:
- `feat: 添加视差效果` (not English)
- `Added new feature` (not conventional format)
- `feat: Add parallax effect.` (has period, capitalized)
- `feat: add parallax effect\n\nThis adds a new parallax effect` (multi-line)
