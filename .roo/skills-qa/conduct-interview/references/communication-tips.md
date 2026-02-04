# Communication Tips for Interviewing

Extended communication guidelines for the Q&A interview process.

## Tone and Pacing

### Progressive Disclosure
Don't ask all questions at once. Use this rhythm:
1. Ask question
2. Get answer
3. Acknowledge naturally
4. Ask next question

### Pause at Milestones
After completing a major topic, summarize:

**Example:**
"So we have the authentication method sorted out:
- JWT tokens with refresh
- Self-registration with email verification
- Rate limiting for security

Now let's talk about the user experience..."

### Allow Course Changes
Let users revisit earlier decisions:

**Example:**
"Actually, now that you mention it, we should reconsider the OAuth decision. Would you like to change that answer based on this new information?"

## Handling Uncertainty

### User Says "I'm Not Sure"

**Response Pattern:**
1. Acknowledge uncertainty is normal
2. Provide context about common choices
3. Ask about their constraints or priorities
4. Recommend based on their situation

**Example:**
```
User: "I'm not sure which authentication method to use."

Response: "That's a common question! Let me help you decide.

Most modern apps use either JWT or OAuth. Here's how to choose:
- If you need username/password login → JWT
- If you want 'Sign in with Google' → OAuth
- If you need both → OAuth with a JWT fallback

What kind of users will be logging in? Internal team members or external customers?"
```

### User Needs Clarification

**Response Pattern:**
1. Explain concept clearly without jargon
2. Give real-world example
3. Relate to their use case

**Example:**
```
User: "What's a refresh token?"

Response: "A refresh token is like a longer-lasting backstage pass.

Here's how it works:
- Access token: Short-lived (15 min) - used for each request
- Refresh token: Long-lived (7 days) - used to get new access tokens

When the access token expires, your app uses the refresh token to get a new one automatically, so users stay logged in without being interrupted.

Make sense?"
```

### Conflicting Requirements

**Response Pattern:**
1. Point out the potential conflict clearly
2. Explain why it's an issue
3. Ask which priority is more important

**Example:**
"I notice you want both immediate responsiveness (sync) and support for large datasets. These conflict because large exports take time to generate.

We could:
1. Set a size threshold (sync for small, async for large)
2. Always use async but make the UX feel faster with progress indicators
3. Limit export size to keep it always-sync

Which matters more: handling any size dataset, or instant downloads?"

## Recognizing User Feedback

### Satisfaction Signals
- "Perfect!"
- "Exactly what I needed"
- "That's exactly right"
- "Yes, let's move forward"

**Response:** Acknowledge concisely and proceed. Do not reciprocate with more praise (e.g., avoid "Great! I'm glad you like it!").

### Confusion Signals
- "I'm not sure what you mean"
- "Can you explain that?"
- Vague or tentative answers
- Questions about your question

**Response:** Rephrase, provide examples, explain context

### Scope Expansion Signals
- "Oh, and we also need..."
- "What about [new feature]?"
- "Can we also handle..."

**Response:**
"Should we include that in this feature, or plan it as a follow-up?"

## Anti-Patterns to Avoid

### False Encouragement / Simpering
❌ Using empty praise like "Great choice!" or "Excellent!" to acknowledge answers.
✅ Use professional, neutral acknowledgments like "Understood," "Moving on," or "That makes sense."

### Interviewing Too Long
❌ Asking so many questions that user gets fatigued
✅ Aim for 3-5 key questions, lead with recommendations, and delegating implementation details to the next phase.

### Technical Interrogation
❌ Feeling like a checklist instead of a peer consultation.
✅ Acknowledge answers professionally, explain why asking each question, and offer expert advice proactively.

### Implementation Creep
❌ Starting to implement during Q&A phase
✅ Remember: Your job is specs, not code. Focus on WHAT and WHY, not HOW
