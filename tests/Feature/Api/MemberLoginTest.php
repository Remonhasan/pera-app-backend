<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function createMemberUser(array $overrides = []): User
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

test('member can login with phone number', function () {
    createMemberUser();

    $response = $this->postJson('/api/login', [
        'phone' => '01712345678',
        'password' => 'Abc1234!',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('message', 'Login successful.')
        ->assertJsonStructure([
            'data' => [
                'token',
                'token_type',
                'expires_in',
                'user' => ['id', 'name', 'phone', 'email'],
            ],
        ]);
});

test('member login returns full image url', function () {
    createMemberUser(['image' => 'uploads/test-member.jpg']);

    $response = $this->postJson('/api/login', [
        'phone' => '01712345678',
        'password' => 'Abc1234!',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.user.image', url('uploads/test-member.jpg'));
});

test('member can login with phone number including country code', function () {
    createMemberUser(['phone' => '01798765432']);

    $response = $this->postJson('/api/login', [
        'phone' => '+8801798765432',
        'password' => 'Abc1234!',
    ]);

    $response->assertOk()->assertJsonPath('data.user.phone', '01798765432');
});

test('member cannot login with invalid password', function () {
    createMemberUser();

    $response = $this->postJson('/api/login', [
        'phone' => '01712345678',
        'password' => 'WrongPass1!',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['phone']);
});

test('inactive member cannot login', function () {
    createMemberUser(['status' => 0]);

    $response = $this->postJson('/api/login', [
        'phone' => '01712345678',
        'password' => 'Abc1234!',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['phone']);
});

test('member can logout', function () {
    createMemberUser();

    $loginResponse = $this->postJson('/api/login', [
        'phone' => '01712345678',
        'password' => 'Abc1234!',
    ]);

    $token = $loginResponse->json('data.token');

    $this->postJson('/api/logout', [], [
        'Authorization' => 'Bearer ' . $token,
    ])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('message', 'Logout successful.');
});

test('logout requires authentication', function () {
    $this->postJson('/api/logout')
        ->assertUnauthorized();
});

test('administrator cannot login through member api', function () {
    $user = User::factory()->create([
        'phone' => '01711111111',
        'password' => Hash::make('Abc1234!'),
        'status' => 1,
    ]);

    $role = User::findRoleByName('administrator');
    if ($role) {
        $user->syncRoles($role);
    }

    $response = $this->postJson('/api/login', [
        'phone' => '01711111111',
        'password' => 'Abc1234!',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['phone']);
});
