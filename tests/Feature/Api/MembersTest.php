<?php

use App\Models\User;
use App\Support\PublicStorageUrl;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function createMemberForMembersApi(array $overrides = []): User
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

test('member can fetch members list', function () {
    $memberA = createMemberForMembersApi([
        'name' => 'Alice Member',
        'phone' => '01711111111',
        'image' => 'uploads/alice.jpg',
    ]);
    $memberB = createMemberForMembersApi([
        'name' => 'Bob Member',
        'phone' => '01722222222',
    ]);

    $admin = User::factory()->create(['status' => 1]);
    $adminRole = User::findRoleByName('administrator');
    if ($adminRole) {
        $admin->syncRoles($adminRole);
    }

    $response = $this->getJson('/api/members', [
        'Authorization' => 'Bearer ' . JWTAuth::fromUser($memberA),
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(2, 'data.members');

    $members = collect($response->json('data.members'));

    expect($members->pluck('name')->all())->toBe(['Alice Member', 'Bob Member']);
    expect($members->firstWhere('id', $memberA->id))->toMatchArray([
        'id' => $memberA->id,
        'name' => 'Alice Member',
        'phone' => '01711111111',
        'image' => PublicStorageUrl::fromPath('uploads/alice.jpg'),
    ]);
    expect($members->firstWhere('id', $memberB->id))->toMatchArray([
        'id' => $memberB->id,
        'name' => 'Bob Member',
        'phone' => '01722222222',
        'image' => null,
    ]);
});

test('members requires authentication', function () {
    $this->getJson('/api/members')->assertUnauthorized();
});

test('administrator cannot access members list', function () {
    $admin = User::factory()->create(['status' => 1]);
    $role = User::findRoleByName('administrator');
    if ($role) {
        $admin->syncRoles($role);
    }

    $this->getJson('/api/members', [
        'Authorization' => 'Bearer ' . JWTAuth::fromUser($admin),
    ])->assertForbidden();
});
