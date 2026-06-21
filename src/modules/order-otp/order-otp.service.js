import crypto from 'node:crypto'
import { query } from '../../config/database.js'

/**
 * Service to manage pickup and delivery OTPs using the order_otps table.
 */
export class OrderOtpService {
  /**
   * Generate a 6-digit numeric OTP and store its hash in the database.
   * Also updates the plaintext columns in the orders table so the customer can view it.
   */
  async generateOtp(orderId, purpose) {
    const rawOtp = crypto.randomInt(100000, 999999).toString()
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiry

    // 1. Insert/Replace in order_otps table
    // Mark any existing active OTP for this order/purpose as consumed/cancelled
    await query(
      `UPDATE order_otps 
       SET consumed_at = NOW() 
       WHERE order_id = $1 AND purpose = $2 AND consumed_at IS NULL`,
      [orderId, purpose]
    )

    await query(
      `INSERT INTO order_otps (order_id, otp_hash, purpose, attempt_count, expires_at)
       VALUES ($1, $2, $3, 0, $4)`,
      [orderId, otpHash, purpose, expiresAt]
    )

    // 2. Sync plaintext OTP to the orders table so it can be displayed to the customer
    const orderColumn = purpose === 'PICKUP' ? 'pickup_otp' : 'delivery_otp'
    await query(
      `UPDATE orders SET ${orderColumn} = $1, updated_at = NOW() WHERE id = $2`,
      [rawOtp, orderId]
    )

    return rawOtp
  }

  /**
   * Verify the raw OTP code submitted by the employee.
   * Tracks and increments attempt count, locking after 5 failures.
   */
  async verifyOtp(orderId, purpose, rawOtp) {
    // 1. Fetch active OTP
    const { rows } = await query(
      `SELECT * FROM order_otps 
       WHERE order_id = $1 AND purpose = $2 AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [orderId, purpose]
    )

    const activeOtp = rows[0]
    if (!activeOtp) {
      throw { statusCode: 400, message: 'No active OTP found. Please request a new code.', code: 'OTP_NOT_FOUND' }
    }

    if (new Date(activeOtp.expires_at) < new Date()) {
      throw { statusCode: 400, message: 'OTP has expired. Please request a new code.', code: 'OTP_EXPIRED' }
    }

    if (activeOtp.attempt_count >= 5) {
      throw { statusCode: 400, message: 'Verification locked. Too many failed attempts.', code: 'OTP_LOCKED' }
    }

    const hashedInput = crypto.createHash('sha256').update(rawOtp).digest('hex')

    if (activeOtp.otp_hash === hashedInput) {
      // Correct OTP: Mark as consumed
      await query(
        `UPDATE order_otps SET consumed_at = NOW() WHERE id = $1`,
        [activeOtp.id]
      )

      // Clear plaintext OTP from orders table
      const orderColumn = purpose === 'PICKUP' ? 'pickup_otp' : 'delivery_otp'
      await query(
        `UPDATE orders SET ${orderColumn} = NULL, updated_at = NOW() WHERE id = $2`,
        [orderId]
      )

      return { success: true }
    } else {
      // Incorrect OTP: Increment attempts
      const newAttempts = activeOtp.attempt_count + 1
      await query(
        `UPDATE order_otps SET attempt_count = $1 WHERE id = $2`,
        [newAttempts, activeOtp.id]
      )

      if (newAttempts >= 5) {
        throw { statusCode: 400, message: 'Verification locked. Too many failed attempts.', code: 'OTP_LOCKED' }
      }

      const remaining = 5 - newAttempts
      throw {
        statusCode: 400,
        message: `Invalid OTP. ${remaining} attempts remaining.`,
        code: 'INVALID_OTP',
        attemptsRemaining: remaining
      }
    }
  }
}
