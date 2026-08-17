<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Responsive: no es opcional

Toda UI de este repositorio se entrega con su versión responsive **en el mismo
cambio**. Una pantalla o componente que solo funciona en escritorio está a
medias, no terminado.

Antes de escribir o modificar cualquier pantalla, componente, tabla, formulario,
tarjeta, modal o layout, lee
`.claude/skills/responsive-financiero/SKILL.md`: contiene los breakpoints, las
reglas propias de UI financiera (cifras que nunca se ocultan, totales que
sobreviven al scroll, áreas táctiles de 44px en acciones con consecuencia), los
patrones por tipo de componente y los antipatrones.

Verificación obligatoria antes de dar algo por terminado:

```
npm run dev
npm run responsive        # móvil 375, tablet 768, escritorio 1280
```

Debe salir `RESULTADO: limpio`, además de `npx tsc --noEmit` y
`npx eslint src --max-warnings=0`.
