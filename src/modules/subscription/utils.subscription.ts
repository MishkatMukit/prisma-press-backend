import type Stripe from "stripe";
import { SubscriptionStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const getPeriodEnd = async(payload : Stripe.Subscription)=>{
    const currentPeriodEndInMS = payload.items.data[0]?.current_period_end
            const currentPeriodEnd = new Date(currentPeriodEndInMS! * 1000);

    return currentPeriodEnd
}
export const handleCheckoutCompleted = async(session : Stripe.Checkout.Session)=>{
    const userId = session.metadata?.userId
            const stripeCustomerId = session.customer as string
            const stripeSubscriptionId = session.subscription as string

            if(!userId || !stripeCustomerId || !stripeSubscriptionId){
                console.log("Webhook : Missing value for creating checkout session");
                return
            }
            const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)

            // console.log("subinfo :", stripeSubscription.items.data[0]);
            const currentPeriodEnd = await getPeriodEnd(stripeSubscription)

            // console.log(currentPeriodEnd);

            await prisma.subscription.upsert({
                where:{
                    userId
                },

                create:{
                    userId,
                    stripeCustomerId,
                    stripeSubscriptionId,
                    status : "ACTIVE",
                    currentPeriodEnd
                },
                update:{
                    stripeCustomerId,
                    stripeSubscriptionId,
                    status : "ACTIVE",
                    currentPeriodEnd
                }
            })
}
export const handleChangeSubscription = async(payload : Stripe.Subscription)=>{
    const stripeSubscriptionId = payload.id;

    const status = (payload.status === "active"|| payload.status === "trialing" )? SubscriptionStatus.ACTIVE : payload.status === "canceled"? SubscriptionStatus.CANCELLED : SubscriptionStatus.EXPIRED

    const currentPeriodEnd = await getPeriodEnd(payload)

    const isSubscriptionExists = await prisma.subscription.findUnique({
        where:{
            stripeSubscriptionId
        }
    })
    if(!isSubscriptionExists){
        console.log("Webhook : No subscription found for id :", stripeSubscriptionId);
        return
    }
    await prisma.subscription.update({
        where:{
            stripeSubscriptionId
        },
        data:{
            status,
            currentPeriodEnd
        }
    })

}