# AGENTS.md

## Repository overview

- Stack principal:
  - Angular 21 con componentes standalone.
  - `provideZonelessChangeDetection`.
  - PrimeNG 21 con tema propio en `src/theme/`.
  - Tailwind CSS 4 para layout y composición visual.
- Estructura base del repo:
  - `src/app/core/`: configuración global, providers y servicios transversales.
  - `src/app/features/`: páginas y casos de uso por dominio.
  - `src/app/shared/`: piezas reutilizables y agnósticas del dominio.
  - `src/theme/`: tokens y overrides globales de PrimeNG.
  - `src/styles.css`: entrypoint global de estilos y base cross-app.

## How to work in this repo

- Antes de cambiar código, inspecciona la estructura existente y sigue los patrones ya presentes.
- No inventes nuevas convenciones de carpetas, nombres o composición si ya existe una convención equivalente en el proyecto.
- Mantén los cambios alineados con la arquitectura actual antes de introducir nuevas abstracciones.
- Si una regla no está clara, prioriza consistencia con el código existente y con este archivo.
- Si algo está deprecado o experimental no lo uses y cambia de estrategia para lograr el objetivo sin depender de eso.

## Run, lint, test, build

- Usa `package.json` como fuente de verdad para scripts disponibles.
- No inventes comandos. Verifica primero qué scripts existen.
- Antes de dar una tarea por terminada:
  1. corre lint si el proyecto lo tiene;
  2. corre tests relevantes si tocaste comportamiento;
  3. corre build si el cambio afecta compilación, templates, estilos, rutas o integración.
- Mínimo esperado antes de cerrar trabajo significativo:
  - `npm run build`
  - `npm run test -- --watch=false`
- Si el repo expone estos scripts, úsalos también cuando aplique:
  - `npm run lint`

## Architecture rules

- No meter llamadas HTTP directamente dentro de componentes de página.
- La orquestación de dominio debe ir en servicios por feature, no en templates ni en componentes visuales.
- Define contratos tipados para request/response cuando entren integraciones reales.
- Mantén separación clara entre:
  - estado de UI;
  - estado de negocio;
  - capa de presentación;
  - capa de dominio.
- `shared/components/` es solo para piezas reutilizables y agnósticas del dominio.
- `features/<feature>/components/` es para piezas reutilizables solo dentro de una feature.
- Si aparecen shells, sections, cards o wrappers reutilizables a nivel app, evalúa moverlos a `shared/ui/` o `shared/layout/`.

## Angular rules

- Preferir APIs modernas de Angular y patrones compatibles con zoneless.
- Evitar patrones heredados que dependan implícitamente de Zone.js.
- Mantener side effects localizados y explícitos.
- Preferir estado derivado claro sobre mutaciones imperativas dispersas.
- Si entra una librería externa, validar que no dependa de Zone.js antes de adoptarla como patrón.

## Component and template rules

- Templates inline están bien para:
  - componentes pequeños;
  - wrappers o headless components;
  - componentes con markup corto y estable.
- Usa `templateUrl` para:
  - páginas;
  - formularios completos;
  - componentes con mucho Tailwind;
  - vistas que diseño/frontend va a iterar con frecuencia.
- Si un componente mezcla demasiado markup, layout y reglas visuales, dividirlo.
- Si un bloque de clases Tailwind aparece dos veces con la misma intención, evaluarlo para extracción.
- Si un patrón visual ya comunica identidad del producto, no dejarlo encerrado en una sola pantalla.

## PrimeNG 21 Rules

- **Sintaxis Moderna**: Prohibido el uso de `styleClass`, `maskStyleClass`, `contentStyleClass`, etc. en favor de **Pass Through (PT)**.
- **Pass Through (PT)**: Utilizar la propiedad `[pt]` para inyectar clases de Tailwind o estilos personalizados en los elementos internos. Ejemplo: `[pt]="{ root: { class: '...' }, content: { class: '...' } }"`.
- **Componentes**: Verificar siempre el nombre exacto de los componentes (ej. `p-progressbar` en minúsculas y sin guion).
- **Atributos Booleano**: Preferir atributos directos (`rounded`, `text`, `outlined`) o bindings modernos.
- **Variantes**: Utilizar `variant="text"` o `variant="outlined"` en componentes compatibles (como `p-button`) según la documentación de la v21.

## Styling ownership

- `src/theme/cemedip-preset.ts`
  - tokens semánticos;
  - color;
  - superficie;
  - semántica global del tema.
- `src/theme/cemedip-pt.ts`
  - apariencia base de componentes PrimeNG.
- `src/styles.css`
  - imports globales;
  - base cross-app;
  - composición compartida entre múltiples features.
- CSS específico de una feature
  - debe vivir cerca de la feature cuando no tenga valor real como primitive global;
  - puede importarse desde `src/styles.css` si debe participar del pipeline global de Tailwind.
- Templates
  - decisiones locales o específicas de la pantalla.
- No usar `src/styles.css` como contenedor de estilos de una sola feature si esa feature puede ser dueña de sus propios patrones.
- Preferir tokens semánticos (`primary`, `surface`, etc.) antes que colores hardcodeados.
- Si un override de PrimeNG se repite cross-app, moverlo a `pt` global o a un wrapper compartido.
- Mantener y extender la convención de clases semánticas `app-*` cuando ya exista un patrón compartido.

## Shared UI conventions

- Mantener reutilizable la base visual ya existente.
- Reusar primitives compartidas antes de crear variantes ad hoc.
- Cuando una pantalla repita estructura o intención visual, extraer a:
  - `shared/components/`, o
  - primitive global en `src/styles.css`
- El componente `auth-shell` debe seguir siendo la referencia para páginas auth con estructura repetida.

## Forms and validation

- Mover validadores reutilizables a `shared/validators/`.
- Mantener una única convención para renderizar errores de formulario.
- No dejar `console.log` como solución final en flujos de formulario o autenticación.
- Preparar los formularios para:
  - validaciones reutilizadas;
  - errores de backend;
  - mensajes consistentes;
  - posible crecimiento a internacionalización.
- Si un patrón de mensajes o ayudas de formulario se repite, extraer helper, wrapper o primitive.

## Accessibility

- Usar jerarquía de headings consistente por página.
- Asegurar asociaciones explícitas entre:
  - label;
  - ayuda;
  - error;
  - control.
- Mantener foco visible homogéneo en inputs, botones y controles interactivos.
- Los modales y flujos con teclado deben ser accesibles.
- No introducir componentes visualmente correctos pero inaccesibles.

## Frontend quality bar

- No duplicar grandes bloques de Tailwind sin razón clara.
- No introducir nuevas reglas visuales de página dentro de `theme/`.
- No mezclar demasiada responsabilidad visual y de negocio en un solo componente.
- No dar por bueno un cambio solo porque “se ve bien”; debe respetar estructura, consistencia y verificaciones.

## Testing and verification

- Agrega o ajusta pruebas cuando el cambio toque comportamiento relevante.
- Criterio de industria para decidir tests:
  - testea comportamiento observable, no detalles internos de implementación;
  - prioriza lógica de negocio, flujos críticos, transformaciones, validaciones, navegación, manejo de errores y contratos HTTP;
  - no escribas tests triviales para getters/setters, wiring obvio o passthrough sin lógica;
  - prefiere más unit tests y component tests que E2E pesados; usa E2E solo para flujos críticos cross-feature;
  - evita duplicar cobertura del mismo comportamiento en demasiadas capas.
- Criterio específico para servicios:
  - sí testear servicios si encapsulan reglas, estado, side effects, composición de requests, mapeo de respuestas o coordinación entre dependencias;
  - si un servicio solo delega sin lógica real, no fuerces tests extensos; cubre el comportamiento en una capa superior si aporta más valor.
- Cómo definir tests:
  - cada test debe responder una conducta concreta del sistema, con nombre específico y directo;
  - estructura preferida: `Arrange / Act / Assert`;
  - usa datos de prueba pequeños y semánticos;
  - valida outputs, estado visible, navegación, storage, requests y errores, no métodos privados;
  - mockea solo bordes externos: HTTP, router, storage, tiempo, servicios ajenos;
  - un test debe fallar por una sola razón clara.
- Prioriza:
  - pruebas de componentes para estados visibles clave;
  - pruebas de servicios para lógica de dominio, estado y contratos HTTP;
  - pruebas de rutas para navegación básica;
  - pruebas de validación de formularios.
- En Angular actual, preferir `TestBed` con providers funcionales y `provideHttpClientTesting()` para servicios HTTP.
- Evita tests demasiado acoplados al markup exacto si lo importante es el comportamiento.
- No marques una tarea como terminada si rompe build o si deja comportamiento crítico sin verificar.

## Definition of done

Un cambio está terminado cuando:

- respeta la estructura `core / features / shared / theme`;
- no introduce responsabilidad de dominio dentro de componentes de página;
- no duplica patrones visuales que ya debían salir a primitives o shared;
- usa correctamente la capa de estilos correspondiente (`preset`, `pt`, `styles.css`, template);
- deja validaciones y errores de forma consistente;
- mantiene accesibilidad razonable;
- pasa las verificaciones relevantes;
- compila con build.

## When instructions grow

- Mantén este archivo corto y operativo.
- Si una guía se vuelve larga o muy específica, muévela a un archivo dedicado en `docs/` y referencia ese archivo desde aquí.
- No conviertas `AGENTS.md` en documentación general del producto.
