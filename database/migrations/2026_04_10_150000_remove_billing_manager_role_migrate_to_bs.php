<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $tables = config('permission.table_names');

        $billingManager = Role::query()
            ->where('name', 'billing_manager')
            ->where('guard_name', 'web')
            ->first();

        if (! $billingManager) {
            return;
        }

        $bs = Role::query()
            ->where('name', 'bs')
            ->where('guard_name', 'web')
            ->first();

        $userClass = config('auth.providers.users.model');

        if ($bs && $userClass) {
            $rows = DB::table($tables['model_has_roles'])
                ->where('role_id', $billingManager->id)
                ->where('model_type', $userClass)
                ->get();

            foreach ($rows as $row) {
                $exists = DB::table($tables['model_has_roles'])
                    ->where('role_id', $bs->id)
                    ->where('model_type', $userClass)
                    ->where('model_id', $row->model_id)
                    ->exists();

                if (! $exists) {
                    DB::table($tables['model_has_roles'])->insert([
                        'role_id' => $bs->id,
                        'model_type' => $userClass,
                        'model_id' => $row->model_id,
                    ]);
                }
            }
        }

        DB::table($tables['model_has_roles'])->where('role_id', $billingManager->id)->delete();
        DB::table($tables['role_has_permissions'])->where('role_id', $billingManager->id)->delete();

        $billingManager->delete();
    }

    public function down(): void
    {
        Role::query()->updateOrCreate(
            ['name' => 'billing_manager', 'guard_name' => 'web'],
            ['label' => 'Billing Manager']
        );
    }
};
