import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const skills = readdirSync('.', { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'scripts' && d.name !== 'node_modules')
  .filter(d => existsSync(join(d.name, 'SKILL.md')))
  .map(d => {
    const content = readFileSync(join(d.name, 'SKILL.md'), 'utf8')
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1] || ''
    const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim()
    // Handle multi-line >- descriptions by capturing everything until the next top-level key or end of frontmatter
    const descMatch = frontmatter.match(/^description:\s*>-\n([\s\S]*?)(?=\n\w|\n$)/m)
    const description = descMatch
      ? descMatch[1].split('\n').map(l => l.trim()).filter(Boolean).join(' ')
      : frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim()
    return { name, description, path: `${d.name}/SKILL.md` }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const marketplace = {
  name: 'claude-ansible-skills',
  description: 'Production-grade Claude Code Ansible skills following Red Hat CoP good practices',
  version: '1.0.0',
  skills
}

writeFileSync('.claude-plugin/marketplace.json', JSON.stringify(marketplace, null, 2) + '\n')
console.log(`Generated marketplace.json with ${skills.length} skills:`)
skills.forEach(s => console.log(`  - ${s.name}`))
