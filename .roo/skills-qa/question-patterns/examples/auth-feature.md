# Authentication Feature Interview Example

End-to-end example showing the full interview process from vague request to detailed specification.

## User Request

"I want to add user authentication to my app. Interview me to build a spec."

## Interview Progression

### Question 1: Authentication Method

**Asked:** "What authentication method do you prefer for your application?"

**Options:**
- OAuth 2.0 with external providers (Google, GitHub) - Users log in with existing accounts
- JWT tokens with username/password - Traditional auth with email/password
- Session-based with cookies - Server-side session management
- Magic link authentication - Passwordless email-based login

**User Answer:** JWT tokens with username/password

---

### Question 2: User Registration

**Asked:** "Do you need user registration, or will accounts be created by admins?"

**Options:**
- Self-registration - Users can sign up themselves
- Admin-only creation - Accounts created through admin panel
- Both - Users can register, admins can also create accounts
- Invitation-based - Users can only register with an invitation code

**User Answer:** Self-registration

---

### Question 3: Email Verification

**Asked:** "Should email verification be required before users can log in?"

**Options:**
- Yes, verify email before allowing login (more secure, prevents spam)
- No, allow immediate login (better UX, but less secure)
- Optional verification with account limitations until verified

**User Answer:** Yes, verify email before allowing login

---

### Question 4: Token Expiry

**Asked:** "What should happen when a JWT access token expires during a user's session?"

**Options:**
- Automatic refresh - Use refresh token to get new access token silently
- Prompt re-authentication - Ask user to log in again
- Hybrid - Auto-refresh if refresh token valid, otherwise prompt login

**User Answer:** Automatic refresh using refresh tokens

---

### Question 5: Brute Force Prevention

**Asked:** "How should the system handle brute force login attempts?"

**Options:**
- Rate limiting - 5 attempts per 15 minutes, then temporary lockout
- Progressive delays - Increasing delay between attempts (1s, 2s, 4s, 8s...)
- CAPTCHA after failures - Show CAPTCHA after 3 failed attempts
- Combination - Rate limiting + CAPTCHA after 3 failures

**User Answer:** Combination - Rate limiting + CAPTCHA after 3 failures

---

### Question 6: Password Requirements

**Asked:** "What password requirements should be enforced?"

**Options:**
- Basic - Minimum 8 characters, at least 1 uppercase, 1 number
- Moderate - Minimum 10 characters, uppercase, lowercase, number, special char
- Strong - Minimum 12 characters, all character types, no common passwords
- Passphrase - Minimum 16 characters, no other requirements (encourages passphrases)

**User Answer:** Basic - Minimum 8 characters, at least 1 uppercase, 1 number

---

## Specification Produced

**File:** `memory/planning/active/authentication-spec.md`

**Key Sections:**
- **Overview:** JWT-based authentication with self-registration and email verification
- **Architecture:** JWT access tokens (15min) + refresh tokens (7 days)
- **Requirements:** Registration, email verification, login, token refresh, session management
- **Security:** Bcrypt hashing, rate limiting, CAPTCHA, password requirements
- **Edge Cases:** Token expiry, unverified accounts, rate limiting, refresh token invalidation
- **Acceptance Criteria:** 10 testable criteria covering all functionality

## Handoff

**Recommendation:** Code mode - Implementation is straightforward with clear requirements

**Instructions:**
"Start a new session in Code mode with this prompt:
'Implement the authentication feature specified in memory/planning/active/authentication-spec.md'"

## Key Patterns Demonstrated

1. **Progressive Narrowing:** Started with auth method, then registration, then security details
2. **Building on Answers:** Each question naturally followed from previous answer
3. **Context in Options:** Explained tradeoffs (security vs UX, cost vs benefit)
4. **Sensible Defaults:** Presented recommended options first when applicable
5. **Reasonable Scope:** 6 questions covered major decisions without fatigue
