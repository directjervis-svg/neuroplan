This is a STRUCTURED REPOSITORY MATERIALIZATION task.

## Core objective
Use the code I provide in this conversation as the primary source of truth and save it into the repository, while also creating the standard supporting project structure required for organization, maintenance, and future development.

## Source-of-truth rule
- The code I provide is the base implementation
- Preserve that code as faithfully as possible
- Do not redesign the artifact unless explicitly instructed
- Do not replace the provided implementation with your own preferred version

## Required behavior
1. Read the code I provide
2. Identify the correct file(s) for that code
3. Create a clean and standard project structure around it
4. Add only the necessary support/config/documentation files
5. Save everything into the repository
6. Commit the final result

## Structural goal
The repository must not contain only the raw artifact file.
It must contain a minimal professional structure so that the project is organized and maintainable.

## Allowed project structure
Create the minimum appropriate structure such as:
- src/
- public/
- assets/ (if needed)
- README.md
- PROMPT.md
- package.json
- tsconfig.json
- vite.config.ts
- .gitignore

If the provided artifact is simple, keep the structure minimal.
If the provided artifact clearly requires React + TypeScript + Vite, structure it accordingly.

## Critical rules
- Do NOT rebuild the project from scratch
- Do NOT rewrite working code unnecessarily
- Do NOT add extra abstractions unless required
- Do NOT create unnecessary folders or files
- Do NOT split the provided code into many files unless that is necessary for execution or explicitly requested
- Do NOT degrade the visual or functional fidelity of the provided code

## Minimal support files policy
You MAY create support files only when they are necessary for:
- running the project
- versioning it properly
- documenting it
- keeping the repository organized

Examples:
- package.json
- tsconfig.json
- vite.config.ts
- README.md
- PROMPT.md
- .gitignore

## Documentation rules
Create:
- README.md with a concise project description, setup, run, build, and structure notes
- PROMPT.md storing the original prompt/context used to generate the artifact, when available

## File handling rules
- If I specify a file path, use it exactly
- If I do not specify a path, infer the most appropriate path
- If a file already exists, update it instead of duplicating it
- Never create duplicate variants like final_v2, final_final, component_new, etc.

## Decision rule
When there is tension between preserving my provided code and improving structure:
- preserve my code first
- improve structure second
- expand scope never, unless explicitly asked

## Output format
Return only:
1. project/repository name
2. files created
3. files updated
4. support/config/docs files added
5. final status

Do NOT print the full code back to me unless I explicitly ask.

## Execution mode
This is a code-preserving repository structuring task.

I will now provide the code and, when possible, the intended file paths.
