# Security

## Snyk High Risk Rating

`caveman-compress` receives a Snyk High Risk rating due to static analysis heuristics. This document explains what the skill does and does not do.

### What triggers the rating

1. **subprocess usage**: On the CLI route, the skill invokes the model CLI named in `CAVEMAN_CLI` via `subprocess.run()`. The subprocess call uses a fixed argument list — no shell interpolation occurs (`shell=True` is never used). User file content is passed via stdin, not as a shell argument.

2. **File read/write**: The skill reads the file the user explicitly points it at, compresses it, and writes the result back to the same path. A `.original.md` backup is saved alongside it. No files outside the user-specified path are read or written.

### What the skill does NOT do

- Does not execute user file content as code
- Does not make network requests except to the model API you configure (via SDK or CLI)
- Does not access files outside the path the user provides
- Does not use `shell=True` or string interpolation in subprocess calls
- Does not collect or transmit any data beyond the file being compressed

### Model configuration

The model provider is not hardcoded — it is read from the environment:

- **SDK route**: set `CAVEMAN_API_KEY` and `CAVEMAN_SDK` (the import name of a Python SDK exposing `messages.create`). Optionally `CAVEMAN_SDK_CLASS` (default `Client`) and `CAVEMAN_MODEL`.
- **CLI route** (fallback): set `CAVEMAN_CLI` to a CLI that reads a prompt on stdin and prints the completion on stdout, with optional `CAVEMAN_CLI_ARGS`. The CLI handles its own authentication.

If neither route is configured, the skill fails loudly before any file is touched.

### File size limit

Files larger than 500KB are rejected before any API call is made. Filenames that look like they hold secrets or PII (`.env`, `credentials*`, keys, `.ssh`/`.aws` paths, etc.) are refused before read.

### Reporting a vulnerability

If you believe you've found a genuine security issue, please open an issue with the label `security`.
