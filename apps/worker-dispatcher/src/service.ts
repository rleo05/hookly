import { InsertEventPayload } from '@webhook-orchestrator/queue/constants';
import { prisma } from '@webhook-orchestrator/database';

export const processWebhookMessage = async (data: InsertEventPayload) => {
    
    const endpoints = await prisma.endpoint.findMany({
        where: {
            applicationId: data.applicationId,
            isActive: true,
            eventTypes: {
                has: data.eventType,
            }
        },
        select: {
            url: true,
            method: true,
            headers: true,
            secret: true,
        }
    })

    console.log(endpoints);
}