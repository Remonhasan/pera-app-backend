<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('administrator can login through admin api', function () {
    $user = User::factory()->create([
        'email' => 'admin-test@example.com',
        'password' => Hash::make('Abc1234!'),
        'status' => 1,
    ]);

    $role = User::findRoleByName('administrator');
    if ($role) {
        $user->syncRoles($role);
    }

    $response = $this->postJson('/api/admin/login', [
        'email' => 'admin-test@example.com',
        'password' => 'Abc1234!',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.account_type', 'admin')
        ->assertJsonStructure([
            'data' => [
                'token',
                'user' => ['id', 'name', 'email', 'roles', 'permissions'],
            ],
        ]);
});

test('authenticated admin can access me endpoint with permissions', function () {
    $user = User::factory()->create([
        'email' => 'admin-me@example.com',
        'password' => Hash::make('Abc1234!'),
        'status' => 1,
    ]);

    $role = User::findRoleByName('administrator');
    if ($role) {
        $user->syncRoles($role);
    }

    $loginResponse = $this->postJson('/api/admin/login', [
        'email' => 'admin-me@example.com',
        'password' => 'Abc1234!',
    ]);

    $token = $loginResponse->json('data.token');

    $this->getJson('/api/me', [
        'Authorization' => 'Bearer '.$token,
    ])
        ->assertOk()
        ->assertJsonPath('data.account_type', 'admin')
        ->assertJsonPath('success', true);
});

test('admin with budget permission can list budgets', function () {
    $user = User::factory()->create([
        'email' => 'budget-admin@example.com',
        'password' => Hash::make('Abc1234!'),
        'status' => 1,
    ]);

    $role = User::findRoleByName('administrator');
    if ($role) {
        $user->syncRoles($role);
    }

    $loginResponse = $this->postJson('/api/admin/login', [
        'email' => 'budget-admin@example.com',
        'password' => 'Abc1234!',
    ]);

    $token = $loginResponse->json('data.token');

    $this->getJson('/api/budgets', [
        'Authorization' => 'Bearer '.$token,
    ])
        ->assertOk()
        ->assertJsonPath('success', true);
});

test('member cannot access admin budget api', function () {
    $user = User::factory()->create([
        'phone' => '01755555555',
        'password' => Hash::make('Abc1234!'),
        'status' => 1,
    ]);

    $role = User::findRoleByName(User::MEMBER_ROLE);
    if ($role) {
        $user->syncRoles($role);
    }

    $loginResponse = $this->postJson('/api/login', [
        'phone' => '01755555555',
        'password' => 'Abc1234!',
    ]);

    $token = $loginResponse->json('data.token');

    $this->getJson('/api/budgets', [
        'Authorization' => 'Bearer '.$token,
    ])->assertForbidden();
});
