"""
Stripe Webhook Handler
Processes Stripe webhook events to keep database in sync
"""

from fastapi import APIRouter, HTTPException, Request
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime
from stripe_service import stripe_service, map_stripe_status_to_db
import json

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

def get_db_connection():
    """Get database connection"""
    database_url = os.getenv("DATABASE_URL")
    return psycopg2.connect(database_url)

@router.post("/stripe")
async def stripe_webhook(request: Request):
    """
    Handle incoming Stripe webhook events
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        # Verify webhook signature
        event = stripe_service.construct_webhook_event(payload, sig_header)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook signature verification failed: {str(e)}")

    print(f"📥 Received Stripe webhook: {event['type']}")

    # Handle different event types
    event_type = event['type']
    event_data = event['data']['object']

    try:
        if event_type == 'checkout.session.completed':
            handle_checkout_session_completed(event_data)

        elif event_type == 'customer.subscription.created':
            handle_subscription_created(event_data)

        elif event_type == 'customer.subscription.updated':
            handle_subscription_updated(event_data)

        elif event_type == 'customer.subscription.deleted':
            handle_subscription_deleted(event_data)

        elif event_type == 'invoice.paid':
            handle_invoice_paid(event_data)

        elif event_type == 'invoice.payment_failed':
            handle_invoice_payment_failed(event_data)

        elif event_type == 'customer.subscription.trial_will_end':
            handle_trial_will_end(event_data)

        else:
            print(f"⚠️  Unhandled event type: {event_type}")

        return {'success': True, 'event_type': event_type}

    except Exception as e:
        print(f"❌ Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")


def handle_checkout_session_completed(session):
    """
    Handle successful checkout session
    Create or update subscription in database
    """
    print(f"✅ Checkout session completed: {session['id']}")

    user_id = session['metadata'].get('user_id')
    if not user_id:
        print("⚠️  No user_id in session metadata")
        return

    user_id = int(user_id)
    customer_id = session['customer']
    subscription_id = session['subscription']

    # Get subscription details from Stripe
    subscription = stripe_service.get_subscription(subscription_id)

    # Get plan from metadata
    plan_name = session['metadata'].get('plan_name', 'starter')

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Get plan_id from database
        cursor.execute("SELECT id FROM subscription_plans WHERE name = %s", (plan_name,))
        plan = cursor.fetchone()
        if not plan:
            print(f"⚠️  Plan not found: {plan_name}")
            return

        plan_id = plan['id']

        # Determine billing cycle
        billing_cycle = 'yearly' if subscription['items']['data'][0]['price']['recurring']['interval'] == 'year' else 'monthly'

        # Check if subscription already exists
        cursor.execute("""
            SELECT id FROM user_subscriptions
            WHERE stripe_subscription_id = %s
        """, (subscription_id,))

        existing = cursor.fetchone()

        if existing:
            # Update existing subscription
            cursor.execute("""
                UPDATE user_subscriptions
                SET
                    status = %s,
                    plan_id = %s,
                    billing_cycle = %s,
                    stripe_customer_id = %s,
                    current_period_start = %s,
                    current_period_end = %s,
                    trial_start_date = %s,
                    trial_end_date = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (
                map_stripe_status_to_db(subscription['status']),
                plan_id,
                billing_cycle,
                customer_id,
                datetime.fromtimestamp(subscription['current_period_start']),
                datetime.fromtimestamp(subscription['current_period_end']),
                datetime.fromtimestamp(subscription['trial_start']) if subscription.get('trial_start') else None,
                datetime.fromtimestamp(subscription['trial_end']) if subscription.get('trial_end') else None,
                existing['id']
            ))
        else:
            # Create new subscription
            cursor.execute("""
                INSERT INTO user_subscriptions (
                    user_id, plan_id, status, billing_cycle,
                    stripe_customer_id, stripe_subscription_id,
                    current_period_start, current_period_end,
                    trial_start_date, trial_end_date,
                    usage_reset_date
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id,
                plan_id,
                map_stripe_status_to_db(subscription['status']),
                billing_cycle,
                customer_id,
                subscription_id,
                datetime.fromtimestamp(subscription['current_period_start']),
                datetime.fromtimestamp(subscription['current_period_end']),
                datetime.fromtimestamp(subscription['trial_start']) if subscription.get('trial_start') else None,
                datetime.fromtimestamp(subscription['trial_end']) if subscription.get('trial_end') else None,
                datetime.fromtimestamp(subscription['current_period_start'])
            ))

        conn.commit()
        print(f"✅ Subscription created/updated for user {user_id}")

    finally:
        cursor.close()
        conn.close()


def handle_subscription_created(subscription):
    """Handle subscription.created event"""
    print(f"✅ Subscription created: {subscription['id']}")
    # Usually handled in checkout.session.completed
    # But can also create here for subscriptions created via API


def handle_subscription_updated(subscription):
    """Handle subscription.updated event"""
    print(f"🔄 Subscription updated: {subscription['id']}")

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
            UPDATE user_subscriptions
            SET
                status = %s,
                current_period_start = %s,
                current_period_end = %s,
                cancel_at_period_end = %s,
                canceled_at = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE stripe_subscription_id = %s
        """, (
            map_stripe_status_to_db(subscription['status']),
            datetime.fromtimestamp(subscription['current_period_start']),
            datetime.fromtimestamp(subscription['current_period_end']),
            subscription.get('cancel_at_period_end', False),
            datetime.fromtimestamp(subscription['canceled_at']) if subscription.get('canceled_at') else None,
            subscription['id']
        ))

        conn.commit()
        print(f"✅ Subscription updated in database")

    finally:
        cursor.close()
        conn.close()


def handle_subscription_deleted(subscription):
    """Handle subscription.deleted event"""
    print(f"❌ Subscription deleted: {subscription['id']}")

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
            UPDATE user_subscriptions
            SET
                status = 'canceled',
                canceled_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE stripe_subscription_id = %s
        """, (subscription['id'],))

        conn.commit()
        print(f"✅ Subscription marked as canceled")

    finally:
        cursor.close()
        conn.close()


def handle_invoice_paid(invoice):
    """Handle invoice.paid event"""
    print(f"💰 Invoice paid: {invoice['id']}")

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Get subscription
        subscription_id = invoice.get('subscription')
        if not subscription_id:
            return

        # Find user subscription
        cursor.execute("""
            SELECT id, user_id
            FROM user_subscriptions
            WHERE stripe_subscription_id = %s
        """, (subscription_id,))

        subscription = cursor.fetchone()
        if not subscription:
            print(f"⚠️  Subscription not found: {subscription_id}")
            return

        # Create invoice record
        cursor.execute("""
            INSERT INTO subscription_invoices (
                subscription_id, user_id,
                invoice_number, stripe_invoice_id, stripe_charge_id,
                amount, currency, tax_amount, total_amount,
                status, paid, invoice_date, paid_date,
                invoice_pdf_url, hosted_invoice_url
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (stripe_invoice_id) DO UPDATE SET
                paid = TRUE,
                paid_date = EXCLUDED.paid_date,
                status = 'paid'
        """, (
            subscription['id'],
            subscription['user_id'],
            invoice['number'],
            invoice['id'],
            invoice.get('charge'),
            invoice['subtotal'] / 100,  # Convert cents to dollars
            invoice['currency'].upper(),
            invoice.get('tax', 0) / 100,
            invoice['total'] / 100,
            'paid',
            True,
            datetime.fromtimestamp(invoice['created']),
            datetime.fromtimestamp(invoice.get('status_transitions', {}).get('paid_at', invoice['created'])),
            invoice.get('invoice_pdf'),
            invoice.get('hosted_invoice_url')
        ))

        # Update subscription last payment info
        cursor.execute("""
            UPDATE user_subscriptions
            SET
                last_payment_date = %s,
                last_payment_amount = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (
            datetime.fromtimestamp(invoice['created']),
            invoice['total'] / 100,
            subscription['id']
        ))

        conn.commit()
        print(f"✅ Invoice recorded")

    finally:
        cursor.close()
        conn.close()


def handle_invoice_payment_failed(invoice):
    """Handle invoice.payment_failed event"""
    print(f"❌ Invoice payment failed: {invoice['id']}")

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        subscription_id = invoice.get('subscription')
        if not subscription_id:
            return

        # Update subscription status to past_due
        cursor.execute("""
            UPDATE user_subscriptions
            SET
                status = 'past_due',
                updated_at = CURRENT_TIMESTAMP
            WHERE stripe_subscription_id = %s
        """, (subscription_id,))

        conn.commit()
        print(f"✅ Subscription marked as past_due")

    finally:
        cursor.close()
        conn.close()


def handle_trial_will_end(subscription):
    """Handle customer.subscription.trial_will_end event"""
    print(f"⏰ Trial ending soon: {subscription['id']}")
    # TODO: Send email notification to user
    pass


# Export router
__all__ = ['router']
