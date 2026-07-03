import type Stripe from "stripe"
import config from "../../config"
import { prisma } from "../../lib/prisma"
import { stripe } from "../../lib/stripe"
import { SubscriptionStatus } from "../../../generated/prisma/enums"
import { handleChangeSubscription, handleCheckoutCompleted } from "./utils.subscription"

const createCheckOutSession = async (userId: string) => {
    const transactionResult = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            include: {
                subscription: true
            }
        })
        let stripeCustomerId = user.subscription?.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: userId }
            })
            stripeCustomerId = customer.id
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: config.stripe_product_id,
                quantity: 1

            }],
            mode: "subscription",
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            success_url: `${config.app_url}/premium?success=true`,
            cancel_url: `${config.app_url}/payment?success=false`,
            metadata: { userId: user.id }
        })

        return session.url
    })
    return {
        paymentUrl: transactionResult
    }
}
const handleWebHook = async (payload: Buffer, signature: string) => {
    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe_webhook_secret_key
    );
    switch (event.type) {
        case 'checkout.session.completed':
            // console.log(paymentIntent);
            await handleCheckoutCompleted(event.data.object)
            
            break;
        case 'customer.subscription.updated':
            // const paymentMethod = event.data.object;
            await handleChangeSubscription(event.data.object)
            break;
        case 'customer.subscription.deleted':
            // const paymentObject = event.data.object;
            await handleChangeSubscription(event.data.object)
            break;
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`);
            break;
    }
}

const getSubscriptionStatus = async(userId : string)=>{
    const isSubscriptionExists = await prisma.subscription.findUniqueOrThrow({
        where:{
            userId
        }
    })
    const isActive = isSubscriptionExists.status === "ACTIVE" && isSubscriptionExists.currentPeriodEnd && (new Date(isSubscriptionExists.currentPeriodEnd)> new Date())

    return {
        status : isSubscriptionExists.status,
        isSubscribed : isActive,
        currentPeriodEnd : isSubscriptionExists.currentPeriodEnd
    }
}

export const subscriptionService = {
    createCheckOutSession,
    handleWebHook,
    getSubscriptionStatus
}