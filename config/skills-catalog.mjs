#!/usr/bin/env node

import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

const ROOTS = [
  { harness: "agents", root: ".agents/skills" },
  { harness: "cursor", root: ".cursor/skills" },
  { harness: "claude", root: ".claude/skills" },
  { harness: "codex", root: ".codex/skills" },
  { harness: "opencode", root: ".opencode/skills" },
]

const AUDIT_RULES = [
  {
    id: "workspace-path",
    severity: "medium",
    rationale: "Workspace-coupled paths make a skill less portable and can reveal local research layout.",
    literals: [
      "/workspace/content",
      "/workspace/quartz",
      "/workspace/.agents",
      "/workspace/.claude",
      "/workspace/.cursor",
      "/workspace/.codex",
      "/workspace/.opencode",
    ],
  },
  {
    id: "research-context",
    severity: "high",
    rationale: "Research-specific language can reveal private product exploration workflows.",
    literals: [
      "product research",
      "market research",
      "startup",
      "roadmap",
      "go-to-market",
      "benchmarking",
      "experiments tied to product discovery",
      "user-transcript-log",
      "verbatim user transcript",
    ],
  },
  {
    id: "internal-context",
    severity: "high",
    rationale: "Internal-only terms are a common sign that a skill is not ready for public promotion.",
    literals: ["confidential", "internal notes", "private systems", "customer names"],
  },
  {
    id: "personal-identifiers",
    severity: "high",
    rationale: "This template includes the author's common personal-research identifiers as a conservative default.",
    literals: ["sushant", "harper", "y combinator", "yc company"],
  },
  {
    id: "email-address",
    severity: "high",
    rationale: "Email-like strings can indicate PII or private contact details.",
    patterns: [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi],
  },
]

function usage() {
  console.error("usage:")
  console.error("  skills-catalog.mjs index <workspace-root> [json|text]")
  console.error("  skills-catalog.mjs export <workspace-root> <output-root> (--all | <selector> [...])")
  console.error("  skills-catalog.mjs audit <workspace-root> [ignore-file]")
  process.exit(1)
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function walkFiles(rootPath) {
  const results = []
  const entries = await fs.readdir(rootPath, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name)

    if (entry.isDirectory()) {
      results.push(...(await walkFiles(entryPath)))
      continue
    }

    if (entry.isFile()) {
      results.push(entryPath)
    }
  }

  return results
}

async function skillTitle(skillFile) {
  const content = await fs.readFile(skillFile, "utf8")
  const lines = content.split(/\r?\n/)
  let fallbackName = ""
  let startIndex = 0

  if (lines[0]?.trim() === "---") {
    startIndex = 1
    for (; startIndex < lines.length; startIndex += 1) {
      const trimmed = lines[startIndex].trim()
      if (!fallbackName) {
        const nameMatch = trimmed.match(/^name:\s*(.+)$/)
        if (nameMatch) {
          fallbackName = nameMatch[1].trim().replace(/^['"]|['"]$/g, "")
        }
      }

      if (trimmed === "---" || trimmed === "...") {
        startIndex += 1
        break
      }
    }
  }

  for (const line of lines.slice(startIndex)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith("# ")) return trimmed.slice(2).trim()
    return trimmed
  }

  return fallbackName || "Untitled Skill"
}

async function skillHash(files, skillDir) {
  const hash = crypto.createHash("sha256")

  for (const filePath of files) {
    const relativePath = path.relative(skillDir, filePath).replaceAll(path.sep, "/")
    hash.update(relativePath)
    hash.update("\0")
    hash.update(await fs.readFile(filePath))
    hash.update("\0")
  }

  return hash.digest("hex")
}

async function scanWorkspace(workspaceRoot) {
  const skills = []

  for (const { harness, root } of ROOTS) {
    const rootDir = path.join(workspaceRoot, root)
    if (!(await pathExists(rootDir))) continue

    const entries = await fs.readdir(rootDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const skillDir = path.join(rootDir, entry.name)
      const skillFile = path.join(skillDir, "SKILL.md")
      if (!(await pathExists(skillFile))) continue

      const files = (await walkFiles(skillDir)).sort((left, right) => left.localeCompare(right))
      const workspaceRelativeDir = path.relative(workspaceRoot, skillDir).replaceAll(path.sep, "/")
      const workspaceRelativeFiles = files.map((filePath) =>
        path.relative(workspaceRoot, filePath).replaceAll(path.sep, "/"),
      )

      skills.push({
        harness,
        skill: entry.name,
        id: `${harness}:${entry.name}`,
        title: await skillTitle(skillFile),
        path: workspaceRelativeDir,
        files: workspaceRelativeFiles,
        fileCount: files.length,
        hash: await skillHash(files, skillDir),
      })
    }
  }

  skills.sort((left, right) => left.id.localeCompare(right.id))
  return skills
}

async function loadIgnoreKeywords(ignoreFile) {
  if (!ignoreFile || !(await pathExists(ignoreFile))) {
    return []
  }

  const content = await fs.readFile(ignoreFile, "utf8")
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.toLowerCase())
}

function ignoredByKeyword(text, ignoreKeywords) {
  const lower = text.toLowerCase()
  return ignoreKeywords.some((keyword) => lower.includes(keyword))
}

async function auditWorkspace(workspaceRoot, ignoreFile) {
  const skills = await scanWorkspace(workspaceRoot)
  const ignoreKeywords = await loadIgnoreKeywords(ignoreFile)
  const findings = []

  for (const skill of skills) {
    for (const relativeFile of skill.files) {
      const absoluteFile = path.join(workspaceRoot, relativeFile)
      let content

      try {
        content = await fs.readFile(absoluteFile, "utf8")
      } catch {
        continue
      }

      const lines = content.split(/\r?\n/)
      for (const rule of AUDIT_RULES) {
        if (rule.literals) {
          for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index]
            const lower = line.toLowerCase()

            for (const literal of rule.literals) {
              if (!lower.includes(literal.toLowerCase())) continue
              if (ignoredByKeyword(line, ignoreKeywords)) continue

              findings.push({
                skillID: skill.id,
                title: skill.title,
                rule: rule.id,
                severity: rule.severity,
                rationale: rule.rationale,
                file: relativeFile,
                line: index + 1,
                match: literal,
                text: line.trim(),
              })
            }
          }
        }

        if (rule.patterns) {
          for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index]
            for (const pattern of rule.patterns) {
              pattern.lastIndex = 0
              const matches = [...line.matchAll(pattern)]
              for (const match of matches) {
                const text = match[0]
                if (ignoredByKeyword(line, ignoreKeywords) || ignoredByKeyword(text, ignoreKeywords)) continue

                findings.push({
                  skillID: skill.id,
                  title: skill.title,
                  rule: rule.id,
                  severity: rule.severity,
                  rationale: rule.rationale,
                  file: relativeFile,
                  line: index + 1,
                  match: text,
                  text: line.trim(),
                })
              }
            }
          }
        }
      }
    }
  }

  findings.sort((left, right) => {
    return (
      left.skillID.localeCompare(right.skillID) ||
      left.file.localeCompare(right.file) ||
      left.line - right.line ||
      left.rule.localeCompare(right.rule)
    )
  })

  return { skills, findings, ignoreFile, ignoreKeywords }
}

function printAudit(audit, workspaceRoot) {
  const { skills, findings, ignoreFile, ignoreKeywords } = audit

  console.log(`Audited ${skills.length} harness-agnostic skill${skills.length === 1 ? "" : "s"} under ${workspaceRoot}`)
  console.log("This is a conservative PII and personal-research leakage check for this template repo.")
  console.log(`Optional ignore file: ${ignoreFile}`)
  console.log(`Loaded ignore keywords: ${ignoreKeywords.length}`)

  if (findings.length === 0) {
    console.log("\nNo audit findings.")
    return
  }

  const counts = findings.reduce((result, finding) => {
    result[finding.severity] = (result[finding.severity] ?? 0) + 1
    return result
  }, {})

  console.log(`\nFindings: ${findings.length} total (${counts.high ?? 0} high, ${counts.medium ?? 0} medium, ${counts.low ?? 0} low)`)

  let currentSkill = ""
  for (const finding of findings) {
    if (finding.skillID !== currentSkill) {
      currentSkill = finding.skillID
      console.log("")
      console.log(`${finding.skillID} (${finding.title})`)
    }

    console.log(`  [${finding.severity}] ${finding.rule} ${finding.file}:${finding.line}`)
    console.log(`    match: ${finding.match}`)
    console.log(`    text: ${finding.text}`)
  }
}

function printText(skills, workspaceRoot) {
  if (skills.length === 0) {
    console.log(`No harness-agnostic skills found under ${workspaceRoot}`)
    return
  }

  console.log(`Found ${skills.length} harness-agnostic skill${skills.length === 1 ? "" : "s"} under ${workspaceRoot}`)
  for (const skill of skills) {
    console.log("")
    console.log(skill.id)
    console.log(`  title: ${skill.title}`)
    console.log(`  path: ${skill.path}`)
    console.log(`  files: ${skill.fileCount}`)
    console.log(`  hash: ${skill.hash}`)
  }
}

function selectSkills(skills, selectors) {
  if (selectors.length === 1 && selectors[0] === "--all") {
    return skills
  }

  const selected = []
  const seen = new Set()

  for (const selector of selectors) {
    const idMatches = skills.filter((skill) => skill.id === selector)
    const pathMatches = skills.filter((skill) => skill.path === selector)
    const nameMatches = skills.filter((skill) => skill.skill === selector)
    const matches = [...new Map([...idMatches, ...pathMatches, ...nameMatches].map((skill) => [skill.id, skill])).values()]

    if (matches.length === 0) {
      throw new Error(`No skills matched selector: ${selector}`)
    }

    if (matches.length > 1) {
      throw new Error(`Selector is ambiguous: ${selector} -> ${matches.map((skill) => skill.id).join(", ")}`)
    }

    const [match] = matches
    if (seen.has(match.id)) continue
    seen.add(match.id)
    selected.push(match)
  }

  return selected.sort((left, right) => left.id.localeCompare(right.id))
}

async function writeReviewNote(outputRoot) {
  const note = [
    "Review required before promoting any exported skill into tracked repo paths.",
    "",
    "Promotion checklist:",
    "- Remove product research details, customer names, and internal-only context.",
    "- Remove startup strategy, roadmap, market, or workspace-specific notes.",
    "- Keep only generic environment, workflow, tooling, or agent-platform guidance.",
    "- Do not promote directly from the live workspace without a host-side review pass.",
  ].join("\n")

  await fs.writeFile(path.join(outputRoot, "REVIEW_REQUIRED.txt"), `${note}\n`)
}

async function exportSkills(workspaceRoot, outputRoot, selectors) {
  const skills = await scanWorkspace(workspaceRoot)
  const selected = selectSkills(skills, selectors)

  if (selected.length === 0) {
    throw new Error("No skills selected for export")
  }

  await fs.mkdir(path.join(outputRoot, "skills"), { recursive: true })

  for (const skill of selected) {
    const sourceDir = path.join(workspaceRoot, skill.path)
    const targetDir = path.join(outputRoot, "skills", skill.harness, skill.skill)
    await fs.mkdir(path.dirname(targetDir), { recursive: true })
    await fs.cp(sourceDir, targetDir, { recursive: true })
  }

  const manifest = selected.map((skill) => ({
    ...skill,
    exportedPath: path.posix.join("skills", skill.harness, skill.skill),
  }))

  await fs.writeFile(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)

  const text = manifest
    .map((skill) => [skill.id, `  title: ${skill.title}`, `  path: ${skill.path}`, `  exported: ${skill.exportedPath}`].join("\n"))
    .join("\n\n")
  await fs.writeFile(path.join(outputRoot, "manifest.txt"), `${text}\n`)
  await writeReviewNote(outputRoot)

  console.log(`Exported ${manifest.length} skill${manifest.length === 1 ? "" : "s"} to ${outputRoot}`)
  console.log(`Review manifest: ${path.join(outputRoot, "manifest.txt")}`)
}

async function main() {
  const [, , command, ...args] = process.argv

  if (command === "index") {
    const [workspaceRoot, format = "text"] = args
    if (!workspaceRoot) usage()

    const skills = await scanWorkspace(workspaceRoot)
    if (format === "json") {
      console.log(JSON.stringify(skills, null, 2))
      return
    }

    if (format === "text") {
      printText(skills, workspaceRoot)
      return
    }

    throw new Error(`Unsupported format: ${format}`)
  }

  if (command === "export") {
    const [workspaceRoot, outputRoot, ...selectors] = args
    if (!workspaceRoot || !outputRoot || selectors.length === 0) usage()
    await exportSkills(workspaceRoot, outputRoot, selectors)
    return
  }

  if (command === "audit") {
    const [workspaceRoot, ignoreFile = "/repo/config/skills-audit-ignore.txt"] = args
    if (!workspaceRoot) usage()
    const audit = await auditWorkspace(workspaceRoot, ignoreFile)
    printAudit(audit, workspaceRoot)
    if (audit.findings.length > 0) {
      process.exitCode = 2
    }
    return
  }

  usage()
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
