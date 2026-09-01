# Pong Arena

Plataforma web de Pong multijugador en tiempo real para el proyecto
`ft_transcendence` de 42: partidas 1v1 y de arena a 4 jugadores, con
torneos, espectadores, IA y perfiles/estadísticas de usuario.

## Language

**Pong Arena**:
El producto/plataforma en su conjunto.
_Avoid_: "Pong" a secas cuando se habla de la app (usar solo para el tipo de juego).

**Match**:
Instancia temporal y persistible de una partida de Pong, con
participantes, reglas, estado y resultado.
_Avoid_: Game, Round, Session.

**Match Mode**:
La variante de reglas/topología de un Match: `DUEL_1V1` o `ARENA_4P`.

**Participant**:
Persona o perfil de IA que ocupa una plaza de juego en un Match concreto
(`participantType`: `HUMAN` | `AI`). Un Match tiene entre 2 (`DUEL_1V1`) y
4 (`ARENA_4P`) participants.

**Match Origin**:
El mecanismo que dio lugar a un Match: `DIRECT_CHALLENGE`, `MATCHMAKING`,
`TOURNAMENT_FIXTURE` o `AI_CHALLENGE`.

**Direct Challenge**:
Invitación entre dos usuarios para un Match `DUEL_1V1`. Existe antes de
que exista el Match; solo lo crea si se acepta.
_Avoid_: Lobby, Invite (usar como sinónimo genérico).

**Matchmaking Queue**:
Mecanismo de espera que reúne participants humanos compatibles antes de
crear un Match `ARENA_4P`. No es un Match ni un Lobby.

**Spectator**:
Persona que observa un Match en curso sin jugar. No es un
**Participant** ni ocupa una plaza de juego — su conexión es una
suscripción de solo lectura al **Match Runtime State**, sin capacidad de
emitir input de gameplay. En v1, solo observable si
`Match Origin = TOURNAMENT_FIXTURE`.

**Match Result**:
Registro persistido del desenlace de un Match: una colección de
**Participant Results** (uno por Participant), no un `winnerId` único. El
ganador se deriva del Participant Result con `finalRank = 1`. Válido tanto
para `DUEL_1V1` (2 resultados) como `ARENA_4P` (4 resultados).

**Participant Result**:
Resultado individual de un Participant al cierre de un Match:
`finalRank`, `outcome` (`WIN` | `LOSS` | `ELIMINATED` | `FORFEITED` |
`ABORTED`) y estadísticas de partida.

**Final Rank**:
Posición definitiva de un Participant al cerrar el Match (1 = ganador).
En todo Match `FINISHED`, único y continuo de 1 a `participantCount`, sin
huecos ni repeticiones.

**Match Finish Reason**:
Por qué un Match `FINISHED` produjo un resultado competitivo válido:
`NORMAL_COMPLETION` o `FORFEIT`. Solo existe en Matches `FINISHED` —
nunca en uno `ABORTED`.

**Match Abort Reason**:
Por qué un Match terminó en `ABORTED` **sin** producir un Match Result
competitivo: `DOUBLE_NO_SHOW`, `TECHNICAL_FAILURE` o
`ADMINISTRATIVE_CANCELLATION`.
_Avoid_: usar `TECHNICAL_ABORT` como cajón de sastre para todo lo que no
es `FINISHED` — un doble no-show no es un fallo técnico.

**Aborted Match Details**:
Lo que acompaña a un Match `ABORTED` en vez de un **Match Result**:
motivo (**Match Abort Reason**) e instante. Un Match `ABORTED` nunca
tiene Match Result.

**Slot**:
Posición fija que ocupa un Participant en `ARENA_4P` — `TOP`, `RIGHT`,
`BOTTOM` o `LEFT` — y el lado del cuadrado que defiende.

**Reconnect Window**:
Ventana de tiempo limitada, por Participant, durante la cual puede
recuperar el control de su pala tras una desconexión. La simulación del
Match **no se pausa** mientras está abierta; la pala del desconectado
queda congelada en su última posición.
_Avoid_: Pause, Timeout (como sinónimo genérico).

**AI Controller**:
Componente que decide el movimiento de pala de un Participant de tipo
`AI`. Vive dentro del mismo proceso de backend que el **Match Runtime
State** — no es un cliente WebSocket independiente, y no tiene acceso a
más información de la que tendría un humano a través del mismo contrato
de acción.

**AI Difficulty**:
Configuración de un AI Controller que introduce imperfección deliberada
y verificable (p. ej. margen de error, cadencia de reacción) para
cumplir el "not perfect play" del enunciado. El mecanismo concreto es
una decisión de diseño del equipo — el enunciado no prescribe ninguno.

**Participant Connection Status**:
Estado de presencia de un Participant (`PENDING_CONNECTION` |
`CONNECTED` | `DISCONNECTED` | `RECONNECTING` | `FORFEITED`),
independiente del `MatchStatus` del Match. `PENDING_CONNECTION` es el
estado inicial de todo Participant al crearse el Match, hasta su
primera conexión WebSocket válida — nunca se ha "desconectado", solo
no ha llegado todavía. Una desconexión (real, tras haber estado
`CONNECTED`) nunca pausa el Match.
_Avoid_: tratar "nunca ha conectado" (`PENDING_CONNECTION`) y "se
desconectó tras conectar" (`DISCONNECTED`) como el mismo estado —
comparten el mecanismo de Reconnect Window pero no el mensaje al rival
("esperando al rival…" vs "el rival se ha desconectado…") ni, en
pruebas, la misma precondición.

**Match Runtime State**:
Estado efímero en memoria de un Match en curso (balón, palas, tick,
participants activos) — calculado y controlado **exclusivamente por el
servidor** (ver [ADR 0001](./docs/adr/0001-server-authoritative-simulation.md)).
Nunca se afirma desde el cliente; se resuelve en un **Match Result**
persistido al finalizar.
_Avoid_: Game state, Client state.

**Tournament**:
Serie competitiva de formato `SINGLE_ELIMINATION` con capacidad fija de
**8 Tournament Entrants** e inscripción abierta hasta completar el cupo.
Organiza 6 Tournament Fixtures (4 cuartos + 2 semis + 1 final).

**Tournament Entrant**:
Persona autenticada registrada en un Tournament antes de que el bracket
se resuelva. Un Entrant se traduce en **Participant** de un Match solo
cuando el Fixture en el que le toca jugar tiene ambos lados resueltos.
_Avoid_: Participant (como sinónimo, antes de que exista el Match).

**Seed**:
Posición interna y estable dentro del bracket, asignada por sorteo
reproducible al cerrarse la inscripción. No es una clasificación
deportiva real todavía — solo determina el emparejamiento inicial.

**Fixture Slot**:
Lo que ocupa cada lado de un Tournament Fixture: un Entrant ya conocido,
o "el ganador de otro Fixture" (pendiente de resolverse).

**Tournament Fixture** (alias: Tournament Pairing):
La obligación/posición del bracket — quién debe enfrentarse, en qué fase
(`QUARTERFINAL` | `SEMIFINAL` | `FINAL`), y cómo avanza —, no la
ejecución jugable en sí. Tiene dos **Fixture Slots** y, como máximo, un
**Match** oficial asociado. Las 6 Fixtures de un Tournament se generan
todas a la vez al cerrar el registro, no ronda a ronda.

**Friend Request**:
Relación direccional temporal entre emisor y receptor
(`PENDING` | `ACCEPTED` | `DECLINED` | `CANCELLED`). Al aceptarse, crea
una **Friendship**; al rechazarse o cancelarse, no crea nada.

**Friendship**:
Relación simétrica única entre dos usuarios, creada al aceptar un
**Friend Request**. A–B y B–A son la misma relación — nunca dos.
_Avoid_: Follow, Follower (implican asimetría; aquí no la hay).

**Notification**:
Registro persistido (`UNREAD` | `READ`) de un evento de dominio relevante
para un usuario, entregado también por WebSocket en tiempo real si está
`ONLINE`. La persistencia es la fuente de verdad; el WebSocket solo
acelera la entrega. Marcar como leída o eliminarla nunca genera otra
Notification.
_Avoid_: Alert, Toast (esos son la representación visual momentánea, no
la entidad persistida).

**Presence**:
Estado binario de un usuario: `ONLINE` (al menos una conexión WebSocket
autenticada activa, sin importar cuántas pestañas/dispositivos) u
`OFFLINE` (ninguna). Independiente del estado del usuario dentro de un
Match — se puede estar `ONLINE` sin estar jugando.
_Avoid_: Away, Last seen, estados de inactividad (fuera de alcance v1).

**User**:
Identidad de producto única. Todo lo demás en este dominio
(`Participant`, `Friendship`, `User Game Stats`, historial) referencia
siempre `User.id` — nunca un método de login concreto.

**Auth Identity**:
Método de acceso vinculado a un `User` (`LOCAL_PASSWORD` | `FORTY_TWO`).
La identidad OAuth se guarda por el identificador estable del proveedor
(`provider` + `providerSubject`, equivalente a `iss`+`sub` de OIDC) —
**nunca por email**, que es una claim mutable y no fiable como
identificador. Vincular una segunda Auth Identity a un `User` existente
exige prueba de posesión (estar autenticado en esa cuenta, o iniciar
sesión en ella explícitamente) — nunca se auto-vincula solo porque el
email coincida (ver
[ADR 0002](./docs/adr/0002-account-linking-requires-proof-of-possession.md)).

**User Game Stats**:
Agregado incremental por usuario (partidas jugadas, victorias, derrotas,
victorias/derrotas por forfeit, primeros puestos en arena, puntos de
ranking, nivel), actualizado en la misma transacción que cierra cada
**Match Result** `FINISHED` — nunca recalculado recorriendo el
historial. Solo Matches `FINISHED` lo modifican; un `ABORTED` nunca
cuenta como partida jugada.

**Ruleset**:
Configuración de personalización de un Match (mapa, power-ups
habilitados, multiplicadores, puntuación objetivo), versionada como
entidad propia — no un caso especial en código. Existe exactamente un
Ruleset activo marcado `isDefault`. Un Match guarda una referencia
inmutable a su Ruleset una vez creado; no puede cambiar en `WAITING` ni
`IN_PROGRESS`.

## Relationships

- Un **Match** tiene entre 2 y 4 **Participants**, según su **Match Mode**.
- Un **Match** puede tener cero o más **Spectators**.
- Un **Match** `FINISHED` produce exactamente un **Match Result**; un
  **Match** `ABORTED` produce **Aborted Match Details** en su lugar —
  nunca ambos, nunca ninguno.
- Un **Tournament** organiza varios **Tournament Fixtures**.
- Un **Tournament Fixture** genera como máximo un **Match** oficial (por
  defecto).
- Un **Match** se origina de exactamente un **Match Origin**: **Direct
  Challenge** (si se acepta), **Matchmaking Queue** (al reunir los
  participants necesarios), **Tournament Fixture** (al quedar resuelto y
  habilitado), o `AI_CHALLENGE` (inmediato, al elegir modo/dificultad).
- En `ARENA_4P`, cada **Participant** ocupa un **Slot** fijo y defiende su
  lado; si el balón cruza su línea, queda eliminado y su **Final Rank**
  queda determinado por el orden efectivo de salida (el último activo
  obtiene rango 1).
- Un **Match Result** (cuando existe) siempre contiene un **Participant
  Result** por cada **Participant** del Match — nunca un `winnerId`
  suelto.
- Correspondencia canónica de estados terminales de Match:

  | MatchStatus | Qué registra | ¿Clasificación válida? | ¿Cuenta para historial/stats? |
  |---|---|---|---|
  | `FINISHED` | Match Result (`finishReason: NORMAL_COMPLETION`) | Sí | Sí |
  | `FINISHED` | Match Result (`finishReason: FORFEIT`) | Sí | Sí (distinguiendo abandonos) |
  | `ABORTED` | Aborted Match Details (`abortReason: DOUBLE_NO_SHOW \| TECHNICAL_FAILURE \| ADMINISTRATIVE_CANCELLATION`) | No | No |

- Un Match nace `WAITING` con todos sus Participants en
  `PENDING_CONNECTION`. La simulación puede emitir snapshots desde ese
  instante, pero el movimiento competitivo (marcador, saque) no arranca
  hasta que **todos** los Participants hayan estado `CONNECTED` al menos
  una vez; solo entonces el Match pasa a `IN_PROGRESS`. Si la Reconnect
  Window de algún Participant en `PENDING_CONNECTION` vence antes de esa
  primera conexión conjunta, se resuelve como `FORFEIT` (si el resto sí
  llegó a conectar) o `DOUBLE_NO_SHOW` (si nadie lo hizo) — sin haberse
  jugado un solo tick competitivo.
- Dentro de cada tick del bucle de simulación, el orden de resolución es
  fijo y determinista: (1) aplicar las intenciones de movimiento ya
  recibidas, (2) avanzar física y detectar puntos, (3) si alguien alcanza
  el `targetScore`, cerrar `NORMAL_COMPLETION` antes que cualquier otra
  cosa, (4) solo si no hubo victoria normal en ese tick, evaluar
  expiraciones de Reconnect Window pendientes. Así, punto ganador y
  vencimiento de ventana en el mismo tick resuelven siempre a
  `NORMAL_COMPLETION`, nunca a `FORFEIT`.
- El cierre de un Match (cualquier estado terminal) pasa por un único
  punto de escritura (p. ej. `finalizeMatch`), dentro de una transacción
  con guarda de estado terminal: un Match ya cerrado no vuelve a
  cambiar de estado, sin importar qué otro evento llegue después.
- Si vence una **Reconnect Window** sin reconexión, el Participant pasa a
  `outcome = FORFEITED`. En `ARENA_4P`, si tras eso queda un único
  Participant activo, ese recibe `finalRank = 1` y el Match cierra
  `FINISHED` / `FORFEIT`. Un Participant con `outcome = ELIMINATED` nunca
  pasa a `FORFEITED` por una desconexión posterior.
- Si el rival completa la condición ordinaria de victoria (marcador
  objetivo, en `DUEL_1V1`) antes de que venza una Reconnect Window
  abierta, el Match cierra `NORMAL_COMPLETION`, no `FORFEIT`.
- Toda decisión competitiva (colisión, punto, eliminación, cierre del
  Match) la toma el servidor sobre el **Match Runtime State**; el
  cliente nunca la afirma (ver
  [ADR 0001](./docs/adr/0001-server-authoritative-simulation.md)).
- Requisito del enunciado (`IV.4`, textual): si un Match tiene opciones
  de personalización activas (power-ups, mapa), el **Participant** de
  tipo `AI` debe poder utilizarlas igual que un humano — no puede
  ignorarlas ni jugar en un subconjunto reducido de reglas.
- Toda instrucción de movimiento de pala —de origen humano o de un **AI
  Controller**— entra por el mismo punto de validación de dominio; no
  hay una vía de input distinta ni con reglas distintas según el origen.
- **Alcance inicial**: el AI Opponent se limita a `DUEL_1V1`. No se
  reclama compatibilidad con `ARENA_4P` en el README salvo que se
  implemente y pruebe explícitamente — el enunciado no exige que la IA
  cubra todas las modalidades, solo que juegue competentemente al juego
  implementado.
- La IA **no participa en el bracket oficial de un Tournament** — solo
  en Matches `DUEL_1V1` fuera de contexto de torneo. Los Tournament
  Entrants son siempre humanos autenticados.
- Un **Tournament**, al cerrar su registro (8 Entrants), genera sus 6
  **Tournament Fixtures** de una vez mediante sorteo reproducible
  (**Seed**). Los 4 de cuartos nacen con ambos Fixture Slots resueltos
  (`ENTRANT`); los de semifinal y final nacen con slots
  `WINNER_OF_FIXTURE`, sin resolver.
- El **Participant Result** con `finalRank = 1` de un Match oficial
  resuelve el Fixture Slot `WINNER_OF_FIXTURE` del Fixture dependiente
  siguiente — nunca se "inventa" un ganador fuera del Match Result.
- Un no-show de un solo Tournament Entrant reutiliza el mecanismo de
  **Forfeit** ya definido para Match (el Match oficial existe en
  `WAITING` con ambos lados asignados; al vencer el plazo de
  presentación, cierra `FINISHED` / `FORFEIT` sin necesidad de simular).
  El **Tournament Fixture** correspondiente pasa a `COMPLETED` (no a un
  estado "forfeited" separado — el forfeit es la causa de cierre del
  Match, no un estado propio del Fixture).
- **Resuelto**: si **ningún** Tournament Entrant de un Fixture se
  presenta, el Match asociado cierra `ABORTED`
  (`abortReason: DOUBLE_NO_SHOW`), el Fixture pasa a `CANCELLED` y el
  **Tournament completo** pasa a `CANCELLED` — sin campeón, sin bye
  artificial, sin intervención administrativa. Los Matches de Fixtures
  anteriores ya `FINISHED` conservan su Match Result y su lugar en el
  historial de sus Participants; el Tournament cancelado no los revierte.
- Un **Tournament** ejecuta sus 6 Fixtures **secuencialmente**, nunca en
  paralelo: `QF-1 → QF-2 → QF-3 → QF-4 → SF-1 → SF-2 → FINAL`. Solo un
  Fixture está habilitado como Match jugable a la vez — así un doble
  no-show nunca deja otro Match del mismo Tournament en curso que haya
  que abortar aparte.
- Un usuario no puede enviarse un **Friend Request** a sí mismo, ni a
  alguien con quien ya tiene **Friendship**, ni duplicar una solicitud
  ya `PENDING`.
- Eventos que generan **Notification** en v1 (alcance cerrado, deriva
  del enunciado "for all creation, update, and deletion actions" leído
  como: creación/actualización/cancelación *relevante para el usuario*
  de estas entidades, no cada mutación técnica):
  `FRIEND_REQUEST_RECEIVED`, `FRIEND_REQUEST_ACCEPTED`,
  `DIRECT_CHALLENGE_RECEIVED`, `DIRECT_CHALLENGE_ACCEPTED`,
  `DIRECT_CHALLENGE_CANCELLED` / `DIRECT_CHALLENGE_EXPIRED`,
  `TOURNAMENT_FIXTURE_READY`, `TOURNAMENT_CANCELLED`,
  `MATCH_RESULT_AVAILABLE`.
- **Nunca** generan Notification: snapshots de Match Runtime State,
  movimiento de pala, eventos de colisión, cambios de **Presence**,
  actualizaciones internas del bracket que no sean `FIXTURE_READY`.
- Elección de **Ruleset** según **Match Origin**: en `DIRECT_CHALLENGE`
  y `AI_CHALLENGE`, quien inicia el reto elige (o se usa el default si
  no elige); en `MATCHMAKING` y `TOURNAMENT_FIXTURE`, **siempre** el
  Ruleset por defecto — nadie elige, para garantizar condiciones
  iguales entre desconocidos en cola y entre Fixtures del bracket.
- Un **AI Controller** recibe el Ruleset efectivo del Match y debe
  poder jugar con sus mapas y power-ups habilitados (requisito ya
  registrado del enunciado, `IV.4`).
- Un **Match** solo admite **Spectators** cuando su **Match Origin** es
  `TOURNAMENT_FIXTURE` **y** tanto el Match como su Tournament están
  `IN_PROGRESS`. `DIRECT_CHALLENGE`, `AI_CHALLENGE` y `MATCHMAKING`
  nunca son observables en v1 (privacidad del reto directo/IA;
  complejidad innecesaria en arena rápida).
- Descubrimiento de Matches observables: listado público (para
  cualquier usuario autenticado) de Tournament Fixtures en
  `MATCH_IN_PROGRESS` — sin invitación ni aprobación de los jugadores.
- Un Match `FINISHED` (`NORMAL_COMPLETION` o `FORFEIT`) siempre
  actualiza **User Game Stats**; un `FORFEIT` cuenta igual que una
  victoria/derrota normal, pero el historial visible conserva el
  `Match Finish Reason` para mostrar "por abandono"/"por no-show". Un
  Match `ABORTED` nunca aparece en el historial competitivo ni altera
  estadísticas.

## Example dialogue

> **Dev:** "¿Un Match de torneo es una entidad distinta a un Match normal?"
> **Domain expert:** "No — sigue siendo un Match. Lo distintivo es que fue
> creado por un Tournament Fixture y tiene un vínculo a esa fase del
> bracket."

> **Dev:** "Si aún faltan jugadores en la arena de 4, ¿el Match ya
> existe, en `WAITING`, con huecos vacíos?"
> **Domain expert:** "No. Mientras se buscan jugadores compatibles eso es
> una **Matchmaking Queue**, no un Match. El Match nace ya con sus 4
> Participants asignados, y solo entonces puede estar en `WAITING`."

> **Dev:** "Un Participant que nunca ha abierto WebSocket, ¿está
> `DISCONNECTED`?"
> **Domain expert:** "No — `DISCONNECTED` implica que estuvo
> `CONNECTED` y se cayó. Alguien que aún no ha llegado está
> `PENDING_CONNECTION`. Comparten el mismo mecanismo de Reconnect
> Window (ventana, pala congelada, forfeit al vencer), pero son estados
> distintos porque la UI y las pruebas necesitan distinguir 'esperando
> al rival' de 'el rival se ha desconectado'."

## Flagged ambiguities

- "Lobby" queda **descartado explícitamente** como entidad de dominio,
  estado de Match o nombre de tabla. Si en el futuro se construye una
  funcionalidad social distinta (sala pública con chat, descubrimiento,
  configuración compartida), podrá introducirse un **Lobby** con
  responsabilidades propias — nunca como sinónimo de Match, Matchmaking
  Queue, Tournament Fixture o `MatchStatus.WAITING`.
- `MatchStatus` **no incluye `PAUSED`**: una desconexión es un estado de
  presencia del Participant (`ParticipantConnectionStatus`), no un
  estado global del Match. El Match sigue `IN_PROGRESS` durante toda la
  Reconnect Window.
- Un **User** puede tener cero, una o dos **Auth Identities**
  (`LOCAL_PASSWORD`, `FORTY_TWO`). Una identidad `FORTY_TWO` pertenece
  exactamente a un `User`; la pareja (`provider`, `providerSubject`) es
  única. Ver [ADR 0002](./docs/adr/0002-account-linking-requires-proof-of-possession.md)
  para la política de vinculación.
- Fórmula de `rankingPoints` → `level` en **User Game Stats**:
  deliberadamente **no decidida** todavía (ni Elo, ni MMR, ni escala
  fija) — solo se fijó que deriva de puntos, que solo Matches
  `FINISHED` los modifican, y que un forfeit puede otorgar puntos pero
  debe quedar indicado en el historial.
- Parámetros de configuración pendientes (no son ambigüedades de
  dominio, son valores por decidir en implementación): duración de la
  Reconnect Window; si se permite una sola ventana por Participant o
  varias; qué ocurre si los 4 participants de arena se desconectan a la
  vez; si un Match de torneo usa un plazo distinto al casual; qué se
  comunica a rivales/espectadores durante la desconexión.
