# Functions

Cloud Functions de Firebase. Hay dos codebases: `apps/functions` (push de mensajes) y `functions` (mails).

## Que hace

| Función                       | Se dispara cuando                                    | Qué hace                                                                                                        |
| ----------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `notifyTournamentComment`     | se crea un doc en `tournaments/{id}/comments`        | Avisa por push a todos los miembros menos al autor y borra los tokens que FCM marca como inválidos              |
| `queuePlayerLinkAcceptedMail` | se borra un doc en `tournaments/{id}/playerRequests` | Si la solicitud estaba pendiente y el miembro quedó vinculado, encola el mail de vinculación aceptada en `mail` |
| `sendQueuedMail`              | se crea un doc en `mail`                             | Arma el mail desde su plantilla, lo manda por SMTP y guarda el resultado en `delivery`                          |

Quién recibe: los miembros de `tournaments/{id}/members`, sin el autor. Los tokens salen de `users/{uid}/devices`, que la app mobile guarda en `apps/mobile/lib/notifications/push-token.ts`.

La colección `mail` solo la escriben las funciones (Admin SDK): las reglas la cierran para los clientes, así nadie puede mandar mails con contenido propio desde el remitente de la app.

## Por qué una función y no reglas

`firestore.rules` y `storage.rules` sirven para decidir si un pedido se permite o se rechaza. Son declarativas: no ejecutan código después de una escritura, no hacen llamadas de red y no pueden disparar otra acción. Mandar un push necesita justo eso.

| Hace falta                                     | Reglas | Función |
| ---------------------------------------------- | ------ | ------- |
| Reaccionar después de que se guarda un mensaje | No     | Sí      |
| Leer los tokens de otros usuarios              | No     | Sí      |
| Llamar a FCM con credenciales de servidor      | No     | Sí      |
| Borrar tokens inválidos                        | No     | Sí      |

Las reglas siguen cumpliendo su parte: impiden falsificar el autor de un mensaje (`authorUid == request.auth.uid`) y que escriba quien no es miembro. La función confía en eso y no lo vuelve a validar.

### Por qué es mejor que las alternativas

- **Que la app del que escribe llame a FCM.** Las credenciales de servidor de FCM no pueden viajar en la app. Además tendría que leer los tokens de otros usuarios, y las reglas de `devices` solo dejan leer al dueño. Y si el teléfono pierde conexión justo después de enviar, nadie recibe el aviso.
- **Un servidor propio** (Cloud Run o un servicio Node escuchando Firestore). Funciona, pero hay que desplegarlo, monitorearlo y mantenerlo. La función es un solo archivo, sin infraestructura aparte.
- **La función.** Corre del lado del servidor, con credenciales administradas por Firebase, y se dispara sola con cada mensaje sin depender de ningún cliente.

## Levantarla

Requiere que el proyecto de Firebase esté en el plan Blaze.

```bash
pnpm --filter @fulbito/functions build    # compila a apps/functions/lib
firebase deploy --only functions          # desde la raíz; compila antes (predeploy en firebase.json)
firebase functions:log                    # ver los logs
```

## Variables de entorno

Solo para `functions` (mails): `MAIL_FROM` y `APP_URL` en `functions/.env` (ver `functions/.env.example`) y el secreto `SMTP_URL` (`firebase functions:secrets:set SMTP_URL`).

## Dónde está cada cosa

| Para tocar…                                   | Archivo                                                           |
| --------------------------------------------- | ----------------------------------------------------------------- |
| La función y el texto de la notificación      | `apps/functions/src/index.ts`                                     |
| Encolar y enviar mails                        | `functions/src/index.ts`                                          |
| El texto y el diseño de los mails             | `functions/src/mail-templates.ts`, `functions/src/mail-layout.ts` |
| El despliegue                                 | bloque `functions` de `firebase.json`                             |
| Guardar el token del dispositivo              | `apps/mobile/lib/notifications/push-token.ts`                     |
| No mostrar el push de chat con la app abierta | `apps/mobile/lib/notifications/push-notification-display.ts`      |

## Para tener en cuenta

- Con la app abierta no se muestra el push de chat (`data.type === 'chat'`); con la app en segundo plano o cerrada lo muestra el sistema.
- El emulador corre el trigger, pero el envío real a FCM necesita credenciales y tokens reales: para probar, desplegar y escribir un comentario con otro `authorUid` desde la consola.
- Tocar la notificación todavía no abre la pestaña de mensajes.
