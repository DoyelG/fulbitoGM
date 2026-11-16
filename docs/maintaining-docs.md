# Cómo mantener la documentación

Reglas para personas y para Claude. Son pocas y no tienen excepciones.

## Estructura

```
docs/
├── README.md            entrada: panorama general, entorno, flujo de trabajo, glosario
├── maintaining-docs.md  estas reglas
├── <área>/README.md     un documento por área: web, mobile, mcp
└── migrations/          una guía por migración de datos
```

## Reglas

1. **Un archivo por área.** Todo lo de web va en `web/README.md`, agregando o editando secciones. No se crean archivos nuevos.
2. **Área nueva** (app o paquete nuevo): carpeta con su `README.md` y una fila en la tabla de `docs/README.md`.
3. **Lo común a todas las apps** va en `docs/README.md`.
4. **Solo se parte un archivo** si una sección pasa las ~100 líneas: se mueve a `<área>/<tema>.md` (kebab-case) y se deja un enlace en su lugar.
5. **Mismo orden de secciones en todas las áreas:** En una mirada → Levantarla → Variables de entorno → Mapa de la app → Dónde está cada cosa → Para tener en cuenta. Las que no apliquen se omiten.
6. **Se actualiza en el mismo PR** que cambia el código.

## Cómo escribir

- Verificá cada dato en el código. Si no podés, marcalo "(a verificar)".
- Vista general, no detalle: dónde está cada cosa y cómo se conecta.
- Tablas para datos, viñetas cortas para avisos, bloques `bash` para comandos.
- Nunca valores reales de secretos: solo nombres de variables.
- Al terminar: `npx prettier --write "docs/**/*.md"`.
