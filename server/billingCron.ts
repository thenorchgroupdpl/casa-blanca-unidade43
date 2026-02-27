import { schedule, type ScheduledTask } from "node-cron";
import { checkBillingNotifications } from "./routers/billing";

/**
 * Billing CRON Job — Régua de Cobrança Automática
 * 
 * Roda diariamente às 08:00 (America/Sao_Paulo, UTC-3 = 11:00 UTC)
 * Executa checkBillingNotifications para todos os tenants ativos.
 * 
 * Regras:
 * - Verifica tenants com nextBillingDate nos próximos 5 dias
 * - Envia máximo 1 notificação por dia por tenant (anti-spam)
 * - Atualiza status para 'warning' se ainda 'active'
 * - Loga resultado no console com timestamp
 * - Em caso de erro, loga sem derrubar o servidor
 */

let cronTask: ScheduledTask | null = null;

export function startBillingCron(): void {
  // Schedule: 08:00 every day in America/Sao_Paulo
  // node-cron v4 format: second minute hour dayOfMonth month dayOfWeek
  cronTask = schedule(
    "0 0 8 * * *",
    async () => {
      const startTime = new Date();
      const timestamp = startTime.toISOString();

      console.log(`[BillingCron] ${timestamp} — Iniciando verificação diária de billing...`);

      try {
        const result = await checkBillingNotifications();

        const duration = Date.now() - startTime.getTime();
        console.log(
          `[BillingCron] ${timestamp} — Concluído em ${duration}ms | ` +
          `Tenants verificados: ${result.processed} | ` +
          `Notificações geradas: ${result.notified} | ` +
          `Já notificados (skip): ${result.skipped} | ` +
          `Erros: ${result.errors.length}`
        );

        if (result.errors.length > 0) {
          console.warn(`[BillingCron] Erros encontrados:`, result.errors);
        }
      } catch (err) {
        console.error(`[BillingCron] ${timestamp} — ERRO FATAL (servidor não afetado):`, err);
      }
    },
    {
      timezone: "America/Sao_Paulo",
    }
  );

  console.log("[BillingCron] Job agendado: diariamente às 08:00 (America/Sao_Paulo)");
}

export function stopBillingCron(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log("[BillingCron] Job parado.");
  }
}
