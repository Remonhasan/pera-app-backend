<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $administrator = Role::updateOrCreate(
            ['name' => 'administrator', 'guard_name' => 'web'],
            ['label' => 'Administrator']
        );

        Role::updateOrCreate(
            ['name' => 'member', 'guard_name' => 'api'],
            ['label' => 'Member']
        );

        Role::query()
            ->where('name', 'member')
            ->where('guard_name', 'web')
            ->delete();

        $permissions = [
            ['user_list', 'User Management'],
            ['user_create', 'User Management'],
            ['user_edit', 'User Management'],
            ['user_delete', 'User Management'],

            ['permission_list', 'Permission Management'],
            ['permission_create', 'Permission Management'],
            ['permission_edit', 'Permission Management'],
            ['permission_delete', 'Permission Management'],

            ['role_list', 'Role Management'],
            ['role_create', 'Role Management'],
            ['role_edit', 'Role Management'],
            ['role_delete', 'Role Management'],
            ['notification_list', 'Notification'],

            ['budget_type_list', 'Budget Type Management'],
            ['budget_type_create', 'Budget Type Management'],
            ['budget_type_edit', 'Budget Type Management'],
            ['budget_type_delete', 'Budget Type Management'],

            ['budget_list', 'Budget Management'],
            ['budget_create', 'Budget Management'],
            ['budget_edit', 'Budget Management'],
            ['budget_delete', 'Budget Management'],

            ['expense_target_list', 'Expense Target Management'],
            ['expense_target_create', 'Expense Target Management'],
            ['expense_target_edit', 'Expense Target Management'],
            ['expense_target_delete', 'Expense Target Management'],

            ['expense_type_list', 'Expense Type Management'],
            ['expense_type_create', 'Expense Type Management'],
            ['expense_type_edit', 'Expense Type Management'],
            ['expense_type_delete', 'Expense Type Management'],

            ['expense_list', 'Expense Management'],
            ['expense_create', 'Expense Management'],
            ['expense_edit', 'Expense Management'],
            ['expense_delete', 'Expense Management'],

            ['bank_list', 'Bank Management'],
            ['bank_create', 'Bank Management'],
            ['bank_edit', 'Bank Management'],
            ['bank_delete', 'Bank Management'],

            ['saving_type_list', 'Savings Type Management'],
            ['saving_type_create', 'Savings Type Management'],
            ['saving_type_edit', 'Savings Type Management'],
            ['saving_type_delete', 'Savings Type Management'],

            ['saving_list', 'Savings Management'],
            ['saving_create', 'Savings Management'],
            ['saving_edit', 'Savings Management'],
            ['saving_delete', 'Savings Management'],

            ['withdraw_list', 'Withdraw Management'],
            ['withdraw_create', 'Withdraw Management'],
            ['withdraw_edit', 'Withdraw Management'],
            ['withdraw_delete', 'Withdraw Management'],

            ['goal_list', 'Goal Management'],
            ['goal_create', 'Goal Management'],
            ['goal_edit', 'Goal Management'],
            ['goal_delete', 'Goal Management'],

            ['job_type_list', 'Job Type Management'],
            ['job_type_create', 'Job Type Management'],
            ['job_type_edit', 'Job Type Management'],
            ['job_type_delete', 'Job Type Management'],

            ['subject_list', 'Subject Management'],
            ['subject_create', 'Subject Management'],
            ['subject_edit', 'Subject Management'],
            ['subject_delete', 'Subject Management'],

            ['topic_list', 'Topic Management'],
            ['topic_create', 'Topic Management'],
            ['topic_edit', 'Topic Management'],
            ['topic_delete', 'Topic Management'],

            ['note_list', 'Note Management'],
            ['note_create', 'Note Management'],
            ['note_edit', 'Note Management'],
            ['note_delete', 'Note Management'],

            ['study_goal_list', 'Study Goal Management'],
            ['study_goal_create', 'Study Goal Management'],
            ['study_goal_edit', 'Study Goal Management'],
            ['study_goal_delete', 'Study Goal Management'],

            ['exam_list', 'Exam Management'],
            ['exam_create', 'Exam Management'],
            ['exam_edit', 'Exam Management'],
            ['exam_delete', 'Exam Management'],

            ['task_type_list', 'Task Type Management'],
            ['task_type_create', 'Task Type Management'],
            ['task_type_edit', 'Task Type Management'],
            ['task_type_delete', 'Task Type Management'],

            ['task_list', 'Task Management'],
            ['task_create', 'Task Management'],
            ['task_edit', 'Task Management'],
            ['task_delete', 'Task Management'],

            ['habit_type_list', 'Habit Type Management'],
            ['habit_type_create', 'Habit Type Management'],
            ['habit_type_edit', 'Habit Type Management'],
            ['habit_type_delete', 'Habit Type Management'],

            ['habit_list', 'Habit Management'],
            ['habit_create', 'Habit Management'],
            ['habit_edit', 'Habit Management'],
            ['habit_delete', 'Habit Management'],

            ['report_list', 'Report Management'],

            ['notice_list', 'Notice Management'],
            ['notice_create', 'Notice Management'],
            ['notice_edit', 'Notice Management'],
            ['notice_delete', 'Notice Management'],
        ];

        foreach ($permissions as $permission) {
            if (! empty($permission)) {
                Permission::updateOrCreate(
                    ['name' => $permission[0], 'guard_name' => 'web'],
                    ['label' => $permission[1]]
                );
            }
        }

        Permission::query()
            ->where('guard_name', 'web')
            ->whereIn('name', [
                'deposit_list', 'deposit_create', 'deposit_edit', 'deposit_delete',
                'meal_list', 'meal_create', 'meal_edit', 'meal_delete',
                'grocery_list', 'grocery_create', 'grocery_edit', 'grocery_delete',
                'rent_list', 'rent_create', 'rent_edit', 'rent_delete',
                'clean_type_list', 'clean_type_create', 'clean_type_edit', 'clean_type_delete',
                'shopper_list', 'shopper_create', 'shopper_edit', 'shopper_delete',
                'cleaner_list', 'cleaner_create', 'cleaner_edit', 'cleaner_delete',
                'fine_type_list', 'fine_type_create', 'fine_type_edit', 'fine_type_delete',
                'fine_list', 'fine_create', 'fine_edit', 'fine_delete',
                'district_list', 'district_create', 'district_edit', 'district_delete',
                'organization_list', 'organization_create', 'organization_edit', 'organization_delete',
                'organogram_list', 'organogram_create', 'organogram_edit', 'organogram_delete',
                'top_navbar_list', 'top_navbar_create', 'top_navbar_edit', 'top_navbar_delete',
                'slider_list', 'slider_create', 'slider_edit', 'slider_delete',
                'footer_list', 'footer_create', 'footer_edit', 'footer_delete',
                'feedback_list', 'feedback_create', 'feedback_edit', 'feedback_delete',
                'blog_list', 'blog_create', 'blog_edit', 'blog_delete',
                'introduction_list', 'introduction_create', 'introduction_edit', 'introduction_delete',
                'publication_list', 'publication_create', 'publication_edit', 'publication_delete',
                'event_list', 'event_create', 'event_edit', 'event_delete',
                'upazila_list', 'upazila_create', 'upazila_edit', 'upazila_delete',
                'union_list', 'union_create', 'union_edit', 'union_delete',
                'village_list', 'village_create', 'village_edit', 'village_delete',
                'application_list', 'application_create', 'application_edit', 'application_delete', 'application_workflow',
                'reconnection_application_list', 'reconnection_application_create', 'reconnection_application_delete', 'reconnection_application_workflow',
            ])
            ->delete();

        $administrator->syncPermissions(
            Permission::query()->where('guard_name', 'web')->pluck('name')
        );
    }
}
