# Wompi Sandbox

Este proyecto usa exclusivamente el ambiente de pruebas de Wompi. El checkout rechaza llaves que no tengan los prefijos de Sandbox (`pub_test_`, `test_integrity_` y `test_events_`). No acepta pagos reales.

## Preparación

1. Copia las tres credenciales de Sandbox de Wompi a las variables `WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET` y `WOMPI_EVENTS_SECRET` en `.env` para desarrollo. En Vercel, agrégalas como variables de entorno privadas para Preview; no uses nombres `NEXT_PUBLIC_*`.
2. Aplica las tablas de pedidos a la base de datos con `npx prisma migrate deploy`.
3. En la configuración de eventos del ambiente Sandbox de Wompi, registra `https://<dominio-de-pruebas>/api/wompi/webhook`.
4. Prueba una compra aprobada y una declinada usando los datos de prueba oficiales de Wompi.

La página de regreso solo consulta el estado del pedido. El pedido pasa a pagado únicamente cuando el servidor recibe y valida la firma del evento de Wompi.

## Límites de esta demostración

- El valor de envío es COP $0.
- El stock se verifica al iniciar el pedido, pero todavía no se reserva ni se descuenta.
- Antes de habilitar una tienda real hay que configurar logística y tarifas de envío, manejo de inventario, políticas comerciales y una cuenta de comercio Wompi en producción. Las llaves productivas se habilitarán como una etapa separada.
