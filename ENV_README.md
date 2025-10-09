This repository uses environment files for local development and deployment.

Purpose
- Keep real secrets out of the repository.
- Provide example templates so new developers know which variables to set.

Files
- `./.env.example` - Frontend (Vite) example. Copy to `./.env.local` or `./.env` and replace placeholders.
- `./Backend/.env.example` - Backend example. Copy to `./Backend/.env` and replace placeholders.

Quick setup (PowerShell)
- Frontend:
  Copy-Item .\.env.example .\.env.local
  notepad .\.env.local

- Backend:
  Copy-Item .\Backend\.env.example .\Backend\.env
  notepad .\Backend\.env

Security
- Never commit files with real secrets. Add `.env` and other sensitive files to `.gitignore`.
- Use a secrets manager (GitHub Secrets, AWS Secrets Manager, etc.) for CI/CD deployments.
- If a secret was accidentally committed, rotate it immediately and purge the secret from git history.

If you want, I can:
- Add `.env` entries to `.gitignore` (if not already),
- Remove the real `Backend/.env` from the repo and help rotate those credentials,
- Or provide a script to bootstrap example env files for teammates.
