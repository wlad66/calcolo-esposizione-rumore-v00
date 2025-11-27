"""
Subscription Management API Endpoints
Handles subscription-related routes and business logic
"""

from __future__ import annotations
from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime
from stripe_service import stripe_service, map_stripe_status_to_db
from auth import decode_access_token

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

# ==================== MODELS ====================

class SubscriptionPlanResponse(BaseModel):
    id: int
    name: str
    display_name: str
    description: Optional[str]
    price_monthly: float
    price_yearly: Optional[float]
    currency: str
    max_valutazioni_esposizione_month: Optional[int]
    max_valutazioni_dpi_month: Optional[int]
    max_aziende: Optional[int]
    storage_mb: Optional[int]
    feature_archivio_documenti: bool
    feature_export_data: bool
    feature_multi_user: bool
    max_users: int
    feature_api_access: bool
    feature_white_label: bool
    feature_priority_support: bool
    is_popular: bool

class CreateCheckoutSessionRequest(BaseModel):
    plan_id: int
    billing_cycle: str  # 'monthly' or 'yearly'

class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str

class UserSubscriptionResponse(BaseModel):
    id: int
    plan_name: str
    plan_display_name: str
    status: str
    billing_cycle: str
    current_period_end: datetime
    cancel_at_period_end: bool
    trial_end_date: Optional[datetime]
    usage_valutazioni_esposizione_current: int
    usage_valutazioni_dpi_current: int
    max_valutazioni_esposizione_month: Optional[int]
    max_valutazioni_dpi_month: Optional[int]

class CancelSubscriptionRequest(BaseModel):
    cancel_at_period_end: bool = True

# ==================== HELPER FUNCTIONS ====================

def get_db_connection():
    """Get database connection"""
    database_url = os.getenv("DATABASE_URL")
    return psycopg2.connect(database_url)

def get_current_user_id(authorization: str = Header(None)) -> int:
    """Extract user ID from authorization token"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.replace('Bearer ', '')
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return payload.get('user_id')

# ==================== ENDPOINTS ====================

@router.get("/plans", response_model=List[SubscriptionPlanResponse])
def get_subscription_plans():
    """
    Get all available subscription plans
    Public endpoint - no authentication required
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
            SELECT
                id, name, display_name, description,
                price_monthly, price_yearly, currency,
                max_valutazioni_esposizione_month,
                max_valutazioni_dpi_month,
                max_aziende,
                storage_mb,
                feature_archivio_documenti,
                feature_export_data,
                feature_multi_user,
                max_users,
                feature_api_access,
                feature_white_label,
                feature_priority_support,
                is_popular
            FROM subscription_plans
            WHERE is_active = TRUE
            ORDER BY sort_order, price_monthly
        """)

        plans = cursor.fetchall()
        return plans

    finally:
        cursor.close()
        conn.close()

@router.get("/my-subscription", response_model=Optional[UserSubscriptionResponse])
def get_my_subscription(user_id: int = Depends(get_current_user_id)):
    """
    Get current user's active subscription
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
            SELECT
                us.id,
                sp.name as plan_name,
                sp.display_name as plan_display_name,
                us.status,
                us.billing_cycle,
                us.current_period_end,
                us.cancel_at_period_end,
                us.trial_end_date,
                us.usage_valutazioni_esposizione_current,
                us.usage_valutazioni_dpi_current,
                sp.max_valutazioni_esposizione_month,
                sp.max_valutazioni_dpi_month
            FROM user_subscriptions us
            JOIN subscription_plans sp ON us.plan_id = sp.id
            WHERE us.user_id = %s
              AND us.status IN ('active', 'trial', 'past_due')
            ORDER BY us.created_at DESC
            LIMIT 1
        """, (user_id,))

        subscription = cursor.fetchone()
        return subscription

    finally:
        cursor.close()
        conn.close()

@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
def create_checkout_session(
    request: CreateCheckoutSessionRequest,
    user_id: int = Depends(get_current_user_id)
):
    """
    Create a Stripe Checkout session for subscription
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Get user details
        cursor.execute("SELECT email, nome FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get plan details
        cursor.execute("""
            SELECT
                id, name, display_name,
                stripe_price_id_monthly,
                stripe_price_id_yearly,
                stripe_product_id
            FROM subscription_plans
            WHERE id = %s AND is_active = TRUE
        """, (request.plan_id,))

        plan = cursor.fetchone()
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")

        # Determine which price ID to use
        if request.billing_cycle == 'monthly':
            price_id = plan['stripe_price_id_monthly']
        elif request.billing_cycle == 'yearly':
            price_id = plan['stripe_price_id_yearly']
        else:
            raise HTTPException(status_code=400, detail="Invalid billing cycle")

        if not price_id:
            raise HTTPException(
                status_code=400,
                detail=f"Stripe price not configured for {request.billing_cycle} billing"
            )

        # Check if user already has a Stripe customer ID
        cursor.execute("""
            SELECT stripe_customer_id
            FROM user_subscriptions
            WHERE user_id = %s AND stripe_customer_id IS NOT NULL
            LIMIT 1
        """, (user_id,))

        result = cursor.fetchone()
        stripe_customer_id = result['stripe_customer_id'] if result else None

        # Create Stripe customer if doesn't exist
        if not stripe_customer_id:
            customer = stripe_service.create_customer(
                email=user['email'],
                name=user['nome'],
                metadata={'user_id': user_id}
            )
            stripe_customer_id = customer.id

        # Create checkout session
        frontend_url = os.getenv('FRONTEND_URL', 'https://rumore.safetyprosuite.com')
        session = stripe_service.create_checkout_session(
            customer_id=stripe_customer_id,
            price_id=price_id,
            success_url=f"{frontend_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/pricing",
            user_id=user_id,
            plan_name=plan['name']
        )

        return {
            'checkout_url': session.url,
            'session_id': session.id
        }

    finally:
        cursor.close()
        conn.close()

@router.post("/portal-session")
def create_portal_session(user_id: int = Depends(get_current_user_id)):
    """
    Create a Stripe Customer Portal session for managing subscription
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Get user's Stripe customer ID
        cursor.execute("""
            SELECT stripe_customer_id
            FROM user_subscriptions
            WHERE user_id = %s AND stripe_customer_id IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 1
        """, (user_id,))

        result = cursor.fetchone()
        if not result or not result['stripe_customer_id']:
            raise HTTPException(status_code=404, detail="No active subscription found")

        stripe_customer_id = result['stripe_customer_id']

        # Create portal session
        frontend_url = os.getenv('FRONTEND_URL', 'https://rumore.safetyprosuite.com')
        session = stripe_service.create_portal_session(
            customer_id=stripe_customer_id,
            return_url=f"{frontend_url}/subscription"
        )

        return {'portal_url': session.url}

    finally:
        cursor.close()
        conn.close()

@router.post("/cancel")
def cancel_subscription(
    request: CancelSubscriptionRequest,
    user_id: int = Depends(get_current_user_id)
):
    """
    Cancel user's active subscription
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Get active subscription
        cursor.execute("""
            SELECT id, stripe_subscription_id
            FROM user_subscriptions
            WHERE user_id = %s AND status = 'active'
            LIMIT 1
        """, (user_id,))

        subscription = cursor.fetchone()
        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")

        if not subscription['stripe_subscription_id']:
            raise HTTPException(status_code=400, detail="Subscription not linked to Stripe")

        # Cancel in Stripe
        stripe_subscription = stripe_service.cancel_subscription(
            subscription_id=subscription['stripe_subscription_id'],
            at_period_end=request.cancel_at_period_end
        )

        # Update database
        if request.cancel_at_period_end:
            cursor.execute("""
                UPDATE user_subscriptions
                SET cancel_at_period_end = TRUE,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (subscription['id'],))
        else:
            cursor.execute("""
                UPDATE user_subscriptions
                SET status = 'canceled',
                    canceled_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (subscription['id'],))

        conn.commit()

        return {
            'success': True,
            'message': 'Subscription canceled successfully',
            'cancel_at_period_end': request.cancel_at_period_end
        }

    finally:
        cursor.close()
        conn.close()

@router.get("/usage")
def get_subscription_usage(user_id: int = Depends(get_current_user_id)):
    """
    Get current subscription usage statistics
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
            SELECT
                us.usage_valutazioni_esposizione_current,
                us.usage_valutazioni_dpi_current,
                us.usage_storage_mb_current,
                sp.max_valutazioni_esposizione_month,
                sp.max_valutazioni_dpi_month,
                sp.storage_mb as max_storage_mb,
                us.current_period_start,
                us.current_period_end
            FROM user_subscriptions us
            JOIN subscription_plans sp ON us.plan_id = sp.id
            WHERE us.user_id = %s
              AND us.status IN ('active', 'trial')
            LIMIT 1
        """, (user_id,))

        usage = cursor.fetchone()
        if not usage:
            # Return free plan limits if no subscription
            return {
                'usage_valutazioni_esposizione_current': 0,
                'usage_valutazioni_dpi_current': 0,
                'usage_storage_mb_current': 0,
                'max_valutazioni_esposizione_month': 3,
                'max_valutazioni_dpi_month': 3,
                'max_storage_mb': 0,
                'period_start': None,
                'period_end': None
            }

        return usage

    finally:
        cursor.close()
        conn.close()

# Export router
__all__ = ['router']
