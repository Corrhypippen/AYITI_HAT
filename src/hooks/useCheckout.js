import { useState, useCallback } from 'react'

/**
 * useCheckout — encapsulates the POST /api/checkout fetch logic.
 *
 * Consumers get:
 *   - submitCheckout(payload)  → triggers the request
 *   - status: 'idle' | 'loading' | 'success' | 'error'
 *   - orderId: string | null   → set on success
 *   - error:   string | null   → user-facing error message on failure
 *   - reset()                  → reset state back to 'idle'
 */
export function useCheckout() {
  const [status, setStatus]   = useState('idle')    // 'idle' | 'loading' | 'success' | 'error'
  const [orderId, setOrderId] = useState(null)
  const [error, setError]     = useState(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setOrderId(null)
    setError(null)
  }, [])

  /**
   * Submit a checkout payload to the backend.
   *
   * @param {Object} payload
   * @param {'stripe'|'paypal'} payload.paymentMethod
   * @param {string}  [payload.paymentMethodId]       - Stripe pm_xxx
   * @param {string}  [payload.paypalAuthorizationId] - PayPal auth ID
   * @param {Array}   payload.cart                    - [{ sku, name, colorway, quantity, price }]
   * @param {Object}  payload.shipping                - { name, email, address1, city, stateCode, countryCode, zip }
   */
  const submitCheckout = useCallback(async (payload) => {
    setStatus('loading')
    setError(null)
    setOrderId(null)

    try {
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        // Use the backend's userMessage (customer-friendly) if available,
        // otherwise fall back to the technical error message.
        throw new Error(data.userMessage || data.message || 'Checkout failed. Please try again.')
      }

      setOrderId(data.orderId)
      setStatus('success')
      return { success: true, orderId: data.orderId }

    } catch (err) {
      const message = err.message || 'An unexpected error occurred.'
      setError(message)
      setStatus('error')
      return { success: false, error: message }
    }
  }, [])

  return { submitCheckout, status, orderId, error, reset }
}
