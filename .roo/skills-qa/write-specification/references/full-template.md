# Complete Specification Template

This is the complete template for writing comprehensive feature specifications. Use sections as needed - not every spec requires every section.

## Header

```markdown
# Feature Specification: [Feature Name]

**Status:** Draft | Review | Approved  
**Target Mode:** Code | Architect | Debug  
**Created:** [Date]  
**Interview Date:** [Date]
```

## Overview

```markdown
## Overview

**What:** One-sentence description of the feature

**Why:** The problem this solves or value it provides

**Who:** Primary users or stakeholders

**Success Criteria:**
- Measurable outcome 1
- Measurable outcome 2
```

## Architectural Decisions

```markdown
## Architectural Decisions

### [Decision Category 1: e.g., Authentication]

**Decision:** JWT-based authentication

**Rationale:** Stateless, works with mobile apps, allows microservices

**Alternatives Considered:**
- Session-based: Rejected due to scaling concerns
- OAuth only: Rejected as we need username/password for internal users

**Tradeoffs Accepted:**
- Token refresh complexity
- Need secure token storage on client

### [Decision Category 2: e.g., Data Storage]

[Repeat same structure for each major architectural decision]
```

## Functional Requirements

```markdown
## Functional Requirements

### User Actions

1. **User Registration**
   - User can register with email and password
   - Email verification required before login
   - Password must meet: 8+ chars, 1 uppercase, 1 number

2. **User Login**
   - User can log in with email/password
   - Receives JWT access token (15 min expiry)
   - Receives refresh token (7 day expiry)

### System Behaviors

1. **Token Refresh**
   - System automatically refreshes tokens when access token expires
   - If refresh fails, redirects to login

2. **Session Management**
   - System tracks active sessions per user
   - User can view and revoke sessions
```

## Edge Cases and Error Handling

```markdown
## Edge Cases and Error Handling

### Error Scenarios

**Email Already Exists**
- Response: 409 Conflict
- Message: "An account with this email already exists"
- Action: Show link to password reset

**Token Expired During Request**
- Response: 401 Unauthorized
- Action: Attempt token refresh, retry request once
- If refresh fails: Redirect to login

**Rate Limiting**
- Limit: 5 failed login attempts per 15 minutes
- Response: 429 Too Many Requests
- Include Retry-After header

### Edge Cases

**User Registers But Never Verifies Email**
- Behavior: Account created but cannot log in
- Action: Allow re-sending verification email
- Cleanup: Delete unverified accounts after 30 days

**User Has Multiple Active Sessions**
- Behavior: All sessions remain valid
- Action: User can revoke individual sessions or "log out everywhere"
```

## Data Models

```markdown
## Data Models

### User
\`\`\`
{
  id: string (UUID)
  email: string (unique)
  passwordHash: string
  emailVerified: boolean
  createdAt: timestamp
  lastLoginAt: timestamp
}
\`\`\`

### Session
\`\`\`
{
  id: string (UUID)
  userId: string (foreign key)
  refreshToken: string (hashed)
  deviceInfo: string
  ipAddress: string
  createdAt: timestamp
  expiresAt: timestamp
}
\`\`\`
```

## API Endpoints

```markdown
## API Endpoints

### POST /api/auth/register

**Request:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
\`\`\`

**Success Response:** 201 Created
\`\`\`json
{
  "message": "Registration successful. Please verify your email.",
  "userId": "uuid"
}
\`\`\`

**Error Responses:**
- 400: Invalid email or password format
- 409: Email already exists

### POST /api/auth/login

[Repeat structure for each endpoint]
```

## UI Flows

```markdown
## UI Flows

### Registration Flow

1. User lands on /register
2. Form shows: email, password, confirm password
3. On submit:
   - Validate password match
   - Show loading spinner
   - On success: Show "Check your email" message
   - On error: Show error inline below field

### Login Flow

1. User lands on /login
2. Form shows: email, password, "Remember me" checkbox
3. On submit:
   - Show loading spinner
   - On success: Redirect to /dashboard
   - On error: Show error message, increment attempt counter
   - After 3 failures: Show CAPTCHA
```

## Out of Scope

```markdown
## Out of Scope

The following are explicitly NOT part of this feature:

- Social login (OAuth) - May be added in future iteration
- Two-factor authentication - Security audit required first
- Account deletion - Needs GDPR compliance review
- Password history tracking - Not required by current security policy
- Single sign-on (SSO) - Enterprise feature for later
```

## Acceptance Criteria

```markdown
## Acceptance Criteria

This feature is complete when:

- [ ] Users can register with email/password
- [ ] Email verification is sent and validated
- [ ] Users can log in and receive JWT tokens
- [ ] Tokens automatically refresh before expiry
- [ ] Rate limiting prevents brute force attacks
- [ ] Error messages are clear and actionable
- [ ] All edge cases are handled as specified
- [ ] API endpoints match specification
- [ ] Unit tests cover all core logic
- [ ] Integration tests cover happy path + errors
```

## Implementation Notes

```markdown
## Implementation Notes

**For the Implementation Team:**

- Use bcrypt for password hashing (cost factor 12)
- Store refresh tokens hashed (SHA-256)
- Use jsonwebtoken library for JWT handling
- Email verification tokens expire in 24 hours
- Consider using existing auth library (Passport.js, Auth.js) if available

**Testing Considerations:**

- Mock email sending in tests
- Test token expiry with time manipulation
- Test concurrent session handling
- Test rate limiting with multiple requests

**Security Reminders:**

- Never log passwords or tokens
- Use HTTPS in production
- Set secure cookie flags for tokens
- Implement CSRF protection
```

## Writing Guidelines

### Be Specific, Not Prescriptive

**Good:** "Email verification required before login"  
**Bad:** "Create a verifyEmail() function in the auth service"

**Reason:** Define WHAT, let implementation decide HOW

### Document Decisions with Context

**Good:** "JWT-based auth (stateless, scales horizontally, works with mobile)"  
**Bad:** "Use JWT"

**Reason:** Future maintainers need to understand WHY

### Make Tradeoffs Explicit

**Good:** "Chose eventual consistency to improve performance. Data may be stale for up to 30s."  
**Bad:** "Use eventual consistency"

**Reason:** Tradeoffs help implementers make aligned decisions

### Be Concrete About Errors

**Good:** "On 409 Conflict: Show 'Email already exists' with link to password reset"  
**Bad:** "Handle duplicate email error appropriately"

**Reason:** Error handling is often overlooked; be explicit

### Include Examples

**Good:** "Password validation: minimum 8 characters, at least 1 uppercase, 1 number. Example: 'SecurePass123'"  
**Bad:** "Validate password strength"

**Reason:** Examples eliminate ambiguity
