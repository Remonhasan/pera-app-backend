<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $apiMember = Role::query()->updateOrCreate(
            ['name' => 'member', 'guard_name' => 'api'],
            ['label' => 'Member'],
        );

        $webMember = Role::query()
            ->where('name', 'member')
            ->where('guard_name', 'web')
            ->first();

        if ($webMember) {
            DB::table('model_has_roles')
                ->where('role_id', $webMember->id)
                ->update(['role_id' => $apiMember->id]);

            $webMember->delete();
        }
    }

    public function down(): void
    {
        // No rollback — member is intentionally api-only.
    }
};
