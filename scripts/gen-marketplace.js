import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const owner = {
  name: 'Leo Gallego',
  email: 'leogallego@gmail.com'
}

const plugins = readdirSync('.', { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'scripts' && d.name !== 'node_modules' && d.name !== 'resources')
  .filter(d => existsSync(join(d.name, 'skills')))
  .map(d => {
    // Find the first SKILL.md inside skills/<name>/SKILL.md
    const skillDirs = readdirSync(join(d.name, 'skills'), { withFileTypes: true })
      .filter(sd => sd.isDirectory() && existsSync(join(d.name, 'skills', sd.name, 'SKILL.md')))
    if (skillDirs.length === 0) return null

    const firstSkill = skillDirs[0]
    const content = readFileSync(join(d.name, 'skills', firstSkill.name, 'SKILL.md'), 'utf8')
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1] || ''
    const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim() || d.name
    const descMatch = frontmatter.match(/^description:\s*>-\n([\s\S]*?)(?=\n\w|\n$)/m)
    const description = descMatch
      ? descMatch[1].split('\n').map(l => l.trim()).filter(Boolean).join(' ')
      : frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim()

    // Generate plugin.json for each plugin
    const pluginDir = join(d.name, '.claude-plugin')
    if (!existsSync(pluginDir)) mkdirSync(pluginDir, { recursive: true })
    const pluginJson = { name, version: '1.0.0', description }
    writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(pluginJson, null, 2) + '\n')

    return {
      name,
      source: `./${d.name}`,
      description,
      version: '1.0.0',
      author: owner,
      repository: 'https://github.com/leogallego/claude-ansible-skills',
      license: 'GPL-3.0-or-later',
      tags: ['ansible']
    }
  })
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name))

const marketplace = {
  $schema: 'https://anthropic.com/claude-code/marketplace.schema.json',
  name: 'claude-ansible-skills',
  description: 'Production-grade Claude Code Ansible skills following Red Hat CoP good practices',
  owner,
  plugins
}

writeFileSync('.claude-plugin/marketplace.json', JSON.stringify(marketplace, null, 2) + '\n')
console.log(`Generated marketplace.json with ${plugins.length} plugins:`)
plugins.forEach(p => console.log(`  - ${p.name}`))
console.log('\nAlso generated plugin.json for each skill directory.')
