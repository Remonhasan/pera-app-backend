<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $users = [
            [
                'email'        => 'admin@gmail.com',
                'name'         => 'Administrator',
                'role'         => 'administrator',
                'is_protected' => true,
            ],
            [
                'email' => 'member@gmail.com',
                'name'  => 'Sohel Rana',
                'role'  => 'member',
            ],
        ];

        foreach ($users as $user) {
            $applyUser = User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name'         => $user['name'],
                    'phone'        => null,
                    'password'     => Hash::make('Abc1234!'),
                    'status'       => 1,
                    'is_protected' => $user['is_protected'] ?? false,
                ]
            );

            $role = \App\Models\User::findRoleByName($user['role']);
            if ($role) {
                $applyUser->syncRoles($role);
            }
        }
    }
}
