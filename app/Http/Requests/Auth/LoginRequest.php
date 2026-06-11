<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Maximum number of login attempts allowed.
     */
    public const MAX_ATTEMPTS = 5;

    /**
     * Number of seconds to lockout after max attempts.
     */
    public const LOCKOUT_DURATION = 60; // 1 minute

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:255',
            ],
        ];
    }

    /**
     * Prepare the data for validation.
     * Sanitize input to prevent SQL injection and XSS attacks.
     */
    protected function prepareForValidation(): void
    {
        $email = $this->input('email');
        $password = $this->input('password');

        // Sanitize email (remove null bytes and trim, but keep valid email format)
        if ($email !== null) {
            $email = str_replace("\0", '', $email); // Remove null bytes
            $email = trim($email); // Trim whitespace
            $email = filter_var($email, FILTER_SANITIZE_EMAIL); // Sanitize email
        }

        // Ensure password is preserved even if empty string (don't convert to null)
        // This prevents validation from running when password is intentionally empty
        $this->merge([
            'email' => $email,
            'password' => $password ?? '', // Preserve empty string, don't convert to null
        ]);
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            // Always show authentication error on email field for consistency
            // This ensures "These credentials do not match our records" is shown
            // instead of "password required" after multiple failed attempts
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        
        // Check if user is active (status must be 1/true)
        if ($user) {
            // Get raw attribute value to check actual database value (before casting)
            // This ensures we check the actual database value regardless of how it's cast
            $rawStatus = $user->getRawOriginal('status');
            
            // If raw status is available, use it; otherwise use the cast value
            $status = $rawStatus !== null ? $rawStatus : $user->status;
            
            // Check if status is not active
            // Accept only: 1 (int), true (bool), or '1' (string)
            // Reject: 0, false, null, or any other value
            $isActive = ($status === 1 || $status === true || $status === '1');
            
            if (!$isActive) {
                Auth::logout();
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'email' => 'Your account is inactive.',
                ]);
            }
        }

        // Members authenticate via API only — block web admin login.
        if ($user && $user->hasRole(User::MEMBER_ROLE, User::MEMBER_GUARD)) {
            Auth::logout();
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'You do not have permission to access this panel.',
            ]);
        }

        // Check if user has 'user' role and prevent login to administrative panel
        if ($user && $user->hasRole('user')) {
            Auth::logout();
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'You do not have permission to access this panel.',
            ]);
        }

        // Update last login timestamp
        if ($user) {
            $user->update(['last_login_at' => now()]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), self::MAX_ATTEMPTS)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     * Uses both email and IP address to prevent brute force attacks.
     */
    public function throttleKey(): string
    {
        $email = Str::transliterate(Str::lower($this->string('email')));
        $ip = $this->ip();

        // Create a unique key combining email and IP
        return Str::lower($email) . '|' . $ip . '|login';
    }
}
