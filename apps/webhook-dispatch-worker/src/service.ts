import type { MessagePropertyHeaders } from '@webhook-orchestrator/queue';
import type { WebhookDispatchPayload } from '@webhook-orchestrator/queue/constants';

export const dispatchWebhook = async (
  data: WebhookDispatchPayload,
  headers: MessagePropertyHeaders | undefined,
) => {
  console.log('data', data);
};
