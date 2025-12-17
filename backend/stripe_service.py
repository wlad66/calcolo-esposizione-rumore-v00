"""
Stripe Integration Service
Handles all Stripe-related operations for subscription management
"""

from __future__ import annotations
import stripe
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv(override=False)  # Don't override system env vars from Dokploy

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

class StripeService:
    """Service class for Stripe operations"""

    @staticmethod
    def create_customer(email: str, name: str, metadata: Optional[Dict[str, Any]] = None) -> stripe.Customer:
        """
        Create a new Stripe customer

        Args:
            email: Customer email
            name: Customer name
            metadata: Additional metadata

        Returns:
            Stripe Customer object
        """
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata=metadata or {}
            )
            return customer
        except stripe.error.StripeError as e:
            print(f"Stripe error creating customer: {e}")
            raise

    @staticmethod
    def create_checkout_session(
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        user_id: int,
        plan_name: str
    ) -> stripe.checkout.Session:
        """
        Create a Stripe Checkout Session for subscription

        Args:
            customer_id: Stripe customer ID
            price_id: Stripe Price ID
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect if user cancels
            user_id: Internal user ID
            plan_name: Plan name for metadata

        Returns:
            Stripe Checkout Session
        """
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    'user_id': user_id,
                    'plan_name': plan_name
                },
                subscription_data={
                    'trial_period_days': 14,  # 14 giorni di prova gratuita
                    'metadata': {
                        'user_id': user_id,
                        'plan_name': plan_name
                    }
                }
            )
            return session
        except stripe.error.StripeError as e:
            print(f"Stripe error creating checkout session: {e}")
            raise

    @staticmethod
    def create_portal_session(customer_id: str, return_url: str) -> stripe.billing_portal.Session:
        """
        Create a Stripe Customer Portal session for managing subscription

        Args:
            customer_id: Stripe customer ID
            return_url: URL to return to after portal session

        Returns:
            Stripe Portal Session
        """
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            return session
        except stripe.error.StripeError as e:
            print(f"Stripe error creating portal session: {e}")
            raise

    @staticmethod
    def get_subscription(subscription_id: str) -> stripe.Subscription:
        """
        Retrieve a subscription from Stripe

        Args:
            subscription_id: Stripe subscription ID

        Returns:
            Stripe Subscription object
        """
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription
        except stripe.error.StripeError as e:
            print(f"Stripe error retrieving subscription: {e}")
            raise

    @staticmethod
    def cancel_subscription(subscription_id: str, at_period_end: bool = True) -> stripe.Subscription:
        """
        Cancel a subscription

        Args:
            subscription_id: Stripe subscription ID
            at_period_end: If True, cancel at end of billing period. If False, cancel immediately.

        Returns:
            Updated Stripe Subscription object
        """
        try:
            if at_period_end:
                subscription = stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True
                )
            else:
                subscription = stripe.Subscription.delete(subscription_id)
            return subscription
        except stripe.error.StripeError as e:
            print(f"Stripe error canceling subscription: {e}")
            raise

    @staticmethod
    def update_subscription(subscription_id: str, new_price_id: str) -> stripe.Subscription:
        """
        Update subscription to a different plan

        Args:
            subscription_id: Stripe subscription ID
            new_price_id: New Stripe Price ID

        Returns:
            Updated Stripe Subscription object
        """
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            subscription = stripe.Subscription.modify(
                subscription_id,
                items=[{
                    'id': subscription['items']['data'][0].id,
                    'price': new_price_id,
                }],
                proration_behavior='create_prorations'  # Calcola proration
            )
            return subscription
        except stripe.error.StripeError as e:
            print(f"Stripe error updating subscription: {e}")
            raise

    @staticmethod
    def construct_webhook_event(payload: bytes, sig_header: str):
        """
        Verify and construct a webhook event from Stripe

        Args:
            payload: Raw request body
            sig_header: Stripe-Signature header

        Returns:
            Stripe Event object
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
            return event
        except ValueError as e:
            print(f"Invalid payload: {e}")
            raise
        except stripe.error.SignatureVerificationError as e:
            print(f"Invalid signature: {e}")
            raise

    @staticmethod
    def list_prices_for_product(product_id: str) -> list:
        """
        List all prices for a product

        Args:
            product_id: Stripe Product ID

        Returns:
            List of Stripe Price objects
        """
        try:
            prices = stripe.Price.list(product=product_id, active=True)
            return prices.data
        except stripe.error.StripeError as e:
            print(f"Stripe error listing prices: {e}")
            raise

    @staticmethod
    def get_upcoming_invoice(customer_id: str, subscription_id: str) -> Optional[stripe.Invoice]:
        """
        Get the upcoming invoice for a subscription

        Args:
            customer_id: Stripe customer ID
            subscription_id: Stripe subscription ID

        Returns:
            Stripe Invoice object or None
        """
        try:
            invoice = stripe.Invoice.upcoming(
                customer=customer_id,
                subscription=subscription_id
            )
            return invoice
        except stripe.error.StripeError as e:
            print(f"Stripe error getting upcoming invoice: {e}")
            return None

    @staticmethod
    def list_invoices(customer_id: str, limit: int = 10) -> list:
        """
        List invoices for a customer

        Args:
            customer_id: Stripe customer ID
            limit: Maximum number of invoices to return

        Returns:
            List of Stripe Invoice objects
        """
        try:
            invoices = stripe.Invoice.list(customer=customer_id, limit=limit)
            return invoices.data
        except stripe.error.StripeError as e:
            print(f"Stripe error listing invoices: {e}")
            raise


# Helper function to map Stripe status to our database status
def map_stripe_status_to_db(stripe_status: str) -> str:
    """
    Map Stripe subscription status to database status

    Args:
        stripe_status: Stripe subscription status

    Returns:
        Database status string
    """
    status_map = {
        'active': 'active',
        'trialing': 'trial',
        'past_due': 'past_due',
        'canceled': 'canceled',
        'unpaid': 'past_due',
        'incomplete': 'pending',
        'incomplete_expired': 'expired'
    }
    return status_map.get(stripe_status, 'unknown')


# Initialize Stripe service
stripe_service = StripeService()
