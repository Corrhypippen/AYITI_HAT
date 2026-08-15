import { useState, useEffect, useRef } from 'react'
import {
  X, ArrowRight, ArrowLeft, ShieldCheck, Loader2,
  CheckCircle2, AlertTriangle, CreditCard, Package, Lock
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { useCheckout } from '../hooks/useCheckout'

// Initialize Stripe once outside the component
const STRIPE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_live_51LG8loJtRbusYdHrTspvO0SEGqfVKgLhaw89aswuYngUrPdfgatljbZsGLhIHoIC3oWQ8rmZutT9NApddxtIWdtZ005DzuAjjf'

const stripePromise = loadStripe(STRIPE_KEY)

// ── Country list ───────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'HT', name: 'Haiti' },
  { code: 'AU', name: 'Australia' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
]

// ── Individual input field ───────────────────────────────────────────────────
function Field({ label, id, error, className = '', ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
        {label}
      </label>
      <input
        id={id}
        className={`w-full border rounded-xl px-4 py-3 text-sm text-neutral-900 bg-white outline-none transition-all duration-200
          focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900
          ${error ? 'border-red-400 bg-red-50' : 'border-neutral-300 hover:border-neutral-400'}`}
        {...props}
      />
      {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

// ── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ['Shipping', 'Payment', 'Confirmed']
  return (
    <div className="flex items-center gap-0 justify-center mb-6">
      {steps.map((label, i) => {
        const idx = i + 1
        const isActive = idx === step
        const isDone   = idx < step
        return (
          <div key={label} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-300
              ${isActive ? 'bg-neutral-900 text-white' : isDone ? 'bg-neutral-200 text-neutral-600' : 'bg-transparent text-neutral-400'}`}>
              {isDone
                ? <CheckCircle2 className="w-3.5 h-3.5" />
                : <span className="text-[10px] font-black">{idx}</span>}
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 mx-0.5 ${isDone ? 'bg-neutral-400' : 'bg-neutral-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Main CheckoutModal Component
// ──────────────────────────────────────────────────────────────────────────────
export default function CheckoutModal({ cart, cartTotal, onClose, onSuccess }) {
  const { submitCheckout, status, orderId, error: checkoutError, reset } = useCheckout()

  // Step 1 = Shipping, Step 2 = Payment, Step 3 = Confirmed
  const [step, setStep] = useState(1)

  // Stripe card element state
  const [stripeReady, setStripeReady] = useState(false)
  const [stripeError, setStripeError] = useState(null)
  const cardElementRef = useRef(null)
  const stripeRef = useRef(null)
  const cardRef = useRef(null)

  // Shipping form state
  const [shipping, setShipping] = useState({
    name: '', email: '', address1: '', address2: '',
    city: '', stateCode: '', countryCode: 'US', zip: '',
  })
  const [shippingErrors, setShippingErrors] = useState({})

  const shippingCost = cartTotal >= 75 ? 0 : 4.99
  const grandTotal   = cartTotal + shippingCost

  // ── Load & Mount Stripe Elements ──────────────────────────────────────────
  useEffect(() => {
    if (step !== 2) return
    let isMounted = true

    async function initStripe() {
      try {
        const stripe = await stripePromise
        if (!stripe || !isMounted) return
        stripeRef.current = stripe

        const elements = stripe.elements()
        const card = elements.create('card', {
          style: {
            base: {
              fontFamily: '"Inter", sans-serif',
              fontSize: '14px',
              color: '#111827',
              '::placeholder': { color: '#9ca3af' },
            },
            invalid: { color: '#ef4444' },
          },
          hidePostalCode: true,
        })
        cardRef.current = card

        setTimeout(() => {
          if (cardElementRef.current && isMounted) {
            card.mount(cardElementRef.current)
            card.on('ready', () => {
              if (isMounted) setStripeReady(true)
            })
            card.on('change', (e) => {
              if (isMounted) setStripeError(e.error ? e.error.message : null)
            })
          }
        }, 50)
      } catch (err) {
        if (isMounted) setStripeError('Failed to initialize payment form.')
      }
    }

    initStripe()

    return () => {
      isMounted = false
      if (cardRef.current) {
        try { cardRef.current.unmount() } catch (_) {}
      }
      setStripeReady(false)
    }
  }, [step])

  // ── Navigate to step 3 on success ───────────────────────────────────────
  useEffect(() => {
    if (status === 'success') setStep(3)
  }, [status])

  // ── Shipping validation ──────────────────────────────────────────────────
  function validateShipping() {
    const errs = {}
    if (!shipping.name.trim())        errs.name     = 'Full name is required'
    if (!shipping.email.trim())       errs.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(shipping.email)) errs.email = 'Valid email is required'
    if (!shipping.address1.trim())    errs.address1 = 'Street address is required'
    if (!shipping.city.trim())        errs.city     = 'City is required'
    if (!shipping.countryCode.trim()) errs.countryCode = 'Country is required'
    if (!shipping.zip.trim())         errs.zip      = 'Postal / ZIP code is required'
    setShippingErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleShippingContinue() {
    if (validateShipping()) setStep(2)
  }

  // ── Stripe submit ────────────────────────────────────────────────────────
  async function handleStripeSubmit(e) {
    e.preventDefault()
    if (!stripeRef.current || !cardRef.current) return
    setStripeError(null)

    const { paymentMethod, error } = await stripeRef.current.createPaymentMethod({
      type: 'card',
      card: cardRef.current,
      billing_details: {
        name:  shipping.name,
        email: shipping.email,
        address: {
          line1:       shipping.address1,
          line2:       shipping.address2 || undefined,
          city:        shipping.city,
          state:       shipping.stateCode || undefined,
          postal_code: shipping.zip,
          country:     shipping.countryCode,
        }
      },
    })

    if (error) {
      setStripeError(error.message)
      return
    }

    await submitCheckout({
      paymentMethod:   'stripe',
      paymentMethodId: paymentMethod.id,
      cart: cart.map(item => ({
        sku:      item.sku,
        name:     item.name,
        colorway: item.colorway,
        quantity: item.quantity,
        price:    item.price,
      })),
      shipping,
    })
  }

  const isSubmitting = status === 'loading'

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Secure Checkout"
    >
      {/* Backdrop */}
      <div
        onClick={status === 'success' ? undefined : onClose}
        className="fixed inset-0 bg-neutral-950/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] border border-neutral-100 animate-scale-up">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-7 pb-4 border-b border-neutral-100 shrink-0">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-0.5">
              AYITI Heritage
            </p>
            <h2 className="font-display font-black text-xl uppercase text-neutral-900 tracking-tight flex items-center gap-2">
              Secure Checkout <Lock className="w-4 h-4 text-green-600" />
            </h2>
          </div>
          {status !== 'success' && (
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-900 transition-colors p-2 rounded-full hover:bg-neutral-100"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6">

          <StepIndicator step={step} />

          {/* ── STEP 1: Shipping ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full Name *"
                  id="checkout-name"
                  type="text"
                  placeholder="Jean-Baptiste Dessalines"
                  value={shipping.name}
                  onChange={e => setShipping(s => ({ ...s, name: e.target.value }))}
                  error={shippingErrors.name}
                  autoComplete="name"
                  className="sm:col-span-2"
                />
                <Field
                  label="Email Address *"
                  id="checkout-email"
                  type="email"
                  placeholder="you@example.com"
                  value={shipping.email}
                  onChange={e => setShipping(s => ({ ...s, email: e.target.value }))}
                  error={shippingErrors.email}
                  autoComplete="email"
                  className="sm:col-span-2"
                />
                <Field
                  label="Address Line 1 *"
                  id="checkout-address1"
                  type="text"
                  placeholder="123 Heritage Blvd"
                  value={shipping.address1}
                  onChange={e => setShipping(s => ({ ...s, address1: e.target.value }))}
                  error={shippingErrors.address1}
                  autoComplete="address-line1"
                  className="sm:col-span-2"
                />
                <Field
                  label="Apt / Suite (optional)"
                  id="checkout-address2"
                  type="text"
                  placeholder="Apt 4B"
                  value={shipping.address2}
                  onChange={e => setShipping(s => ({ ...s, address2: e.target.value }))}
                  autoComplete="address-line2"
                />
                <Field
                  label="City *"
                  id="checkout-city"
                  type="text"
                  placeholder="Miami"
                  value={shipping.city}
                  onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                  error={shippingErrors.city}
                  autoComplete="address-level2"
                />
                <Field
                  label="State / Province"
                  id="checkout-state"
                  type="text"
                  placeholder="FL"
                  value={shipping.stateCode}
                  onChange={e => setShipping(s => ({ ...s, stateCode: e.target.value }))}
                  autoComplete="address-level1"
                />
                <Field
                  label="ZIP / Postal Code *"
                  id="checkout-zip"
                  type="text"
                  placeholder="33101"
                  value={shipping.zip}
                  onChange={e => setShipping(s => ({ ...s, zip: e.target.value }))}
                  error={shippingErrors.zip}
                  autoComplete="postal-code"
                />
                <div className="space-y-1">
                  <label htmlFor="checkout-country" className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                    Country *
                  </label>
                  <select
                    id="checkout-country"
                    value={shipping.countryCode}
                    onChange={e => setShipping(s => ({ ...s, countryCode: e.target.value }))}
                    className="w-full border border-neutral-300 hover:border-neutral-400 rounded-xl px-4 py-3 text-sm text-neutral-900 bg-white outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all duration-200"
                    autoComplete="country"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  {shippingErrors.countryCode && (
                    <p className="text-[10px] text-red-500 font-medium">{shippingErrors.countryCode}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Payment ──────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">

              {/* Order summary recap */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Order Summary</p>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-xs text-neutral-700">
                    <span>{item.name} — {item.colorway} <span className="text-neutral-400">×{item.quantity}</span></span>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-neutral-200 pt-2 flex justify-between text-xs text-neutral-500">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-display font-black text-sm text-neutral-900 pt-1">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                  Credit or Debit Card
                </p>

                <form onSubmit={handleStripeSubmit} id="stripe-form" className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                      Card Details
                    </label>
                    <div
                      ref={cardElementRef}
                      className="border border-neutral-300 rounded-xl px-4 py-3.5 min-h-[46px] bg-white focus-within:ring-2 focus-within:ring-neutral-900 focus-within:border-neutral-900 transition-all duration-200"
                    />
                    {stripeError && (
                      <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" /> {stripeError}
                      </p>
                    )}
                  </div>

                  {!stripeReady && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading secure payment form…</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Checkout error banner */}
              {checkoutError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold mb-0.5">Order Could Not Be Placed</p>
                    <p className="text-xs font-light leading-relaxed">{checkoutError}</p>
                    <button
                      onClick={reset}
                      className="mt-2 text-xs font-bold underline hover:no-underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Confirmed ────────────────────────────────────────── */}
          {step === 3 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-black text-2xl uppercase text-neutral-900">
                  Order Confirmed!
                </h3>
                <p className="text-neutral-500 text-sm font-light leading-relaxed max-w-sm mx-auto">
                  Your hat is heading to the Printful embroidery hub for production.
                  You'll receive a tracking email once it ships.
                </p>
              </div>

              {orderId && (
                <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-5 py-2.5 rounded-full">
                  <Package className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-widest">
                    Order #{orderId.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3 text-left">
                    <div className="w-10 h-10 bg-white rounded-lg border border-neutral-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <img src={item.views?.front || ''} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">{item.name} — {item.colorway}</p>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider">×{item.quantity} · SKU: {item.sku}</p>
                    </div>
                    <span className="text-xs font-bold text-neutral-900 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-neutral-400 font-light">
                A confirmation email has been sent to <strong className="text-neutral-600">{shipping.email}</strong>
              </p>

              <button
                onClick={() => { onSuccess?.(); onClose() }}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs tracking-widest uppercase py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Back to Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Footer / CTA ───────────────────────────────────────────────── */}
        {step !== 3 && (
          <div className="px-6 sm:px-8 pb-7 pt-4 border-t border-neutral-100 shrink-0 space-y-3">

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-3.5 border border-neutral-300 hover:border-neutral-400 text-neutral-700 font-bold text-xs tracking-widest uppercase rounded-xl transition-all disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              {step === 1 && (
                <button
                  onClick={handleShippingContinue}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs tracking-widest uppercase py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="submit"
                  form="stripe-form"
                  disabled={isSubmitting || !stripeReady}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs tracking-widest uppercase py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing…</span></>
                  ) : (
                    <><CreditCard className="w-4 h-4" /><span>Pay ${grandTotal.toFixed(2)}</span></>
                  )}
                </button>
              )}
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                256-bit SSL Encrypted
              </span>
              <span className="text-neutral-200">|</span>
              <span>Direct Printful Production</span>
              <span className="text-neutral-200">|</span>
              <span>All Major Cards Accepted</span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
