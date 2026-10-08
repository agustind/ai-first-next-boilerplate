/** Conventional Commits. See .agents/skills/conventional-commits/SKILL.md */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
}
