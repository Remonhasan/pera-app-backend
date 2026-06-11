<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function createMemberForDashboard(array $overrides = []): User
{
    $user = User::factory()->create(array_merge([
        'phone' => '01712345678',
        'password' => Hash::make('Abc1234!'),
        'status' => 1,
    ], $overrides));

    $role = User::findRoleByName(User::MEMBER_ROLE);
    if ($role) {
        $user->syncRoles($role);
    }

    return $user;
}

function memberToken(User $user): string
{
    return JWTAuth::fromUser($user);
}

test('member can fetch dashboard data', function () {
    $member = createMemberForDashboard();
    $today = now()->toDateString();

    $response = $this->getJson('/api/dashboard?date_from=' . $today . '&date_to=' . $today, [
        'Authorization' => 'Bearer ' . memberToken($member),
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.filters.date_from', $today)
        ->assertJsonPath('data.filters.date_to', $today);
});

test('dashboard defaults to current month date range', function () {
    $member = createMemberForDashboard();

    $response = $this->getJson('/api/dashboard', [
        'Authorization' => 'Bearer ' . memberToken($member),
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.filters.date_from', now()->startOfMonth()->toDateString())
        ->assertJsonPath('data.filters.date_to', now()->endOfMonth()->toDateString());
});

test('dashboard requires authentication', function () {
    $this->getJson('/api/dashboard')->assertUnauthorized();
});

test('administrator cannot access member dashboard', function () {
    $admin = User::factory()->create(['status' => 1]);
    $role = User::findRoleByName('administrator');
    if ($role) {
        $admin->syncRoles($role);
    }

    $this->getJson('/api/dashboard', [
        'Authorization' => 'Bearer ' . memberToken($admin),
    ])->assertForbidden();
});
