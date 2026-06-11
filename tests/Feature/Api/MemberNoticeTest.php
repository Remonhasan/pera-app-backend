<?php

use App\Models\Notice;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function createMemberForNotices(array $overrides = []): User
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

test('member can fetch active notices', function () {
    $member = createMemberForNotices();

    $activeNotice = Notice::query()->create([
        'title' => 'Mess Meeting',
        'description' => 'Monthly meeting on Sunday.',
        'status' => true,
    ]);

    Notice::query()->create([
        'title' => 'Old Notice',
        'description' => 'Inactive notice.',
        'status' => false,
    ]);

    $response = $this->getJson('/api/notices', [
        'Authorization' => 'Bearer ' . JWTAuth::fromUser($member),
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.total_notices', 1)
        ->assertJsonCount(1, 'data.notices')
        ->assertJsonPath('data.notices.0.id', $activeNotice->id)
        ->assertJsonPath('data.notices.0.title', 'Mess Meeting')
        ->assertJsonPath('data.notices.0.description', 'Monthly meeting on Sunday.');
});

test('notices requires authentication', function () {
    $this->getJson('/api/notices')->assertUnauthorized();
});

test('administrator cannot access member notices', function () {
    $admin = User::factory()->create(['status' => 1]);
    $role = User::findRoleByName('administrator');
    if ($role) {
        $admin->syncRoles($role);
    }

    $this->getJson('/api/notices', [
        'Authorization' => 'Bearer ' . JWTAuth::fromUser($admin),
    ])->assertForbidden();
});
