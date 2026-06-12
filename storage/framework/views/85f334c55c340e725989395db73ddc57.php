<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo e(__('study_goal_list_report.title')); ?></title>
    <?php echo $__env->make('reports.partials.styles', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
</head>
<body>
    <h1><?php echo e(__('study_goal_list_report.header')); ?></h1>
    <div class="meta">
        <?php echo e(__('study_goal_list_report.period')); ?>:
        <?php if(! empty($filters['date_from']) && ! empty($filters['date_to'])): ?>
            <?php echo e($filters['date_from']); ?> <?php echo e(__('study_goal_list_report.to')); ?> <?php echo e($filters['date_to']); ?>

        <?php else: ?>
            <?php echo e(__('study_goal_list_report.all_dates')); ?>

        <?php endif; ?>
        &nbsp;|&nbsp;
        <?php echo e(__('study_goal_list_report.generated')); ?>: <?php echo e($formatter->dateTime('Y-m-d H:i')); ?>

    </div>

    <table class="data">
        <thead>
            <tr>
                <th><?php echo e(__('study_goal_list_report.col_member')); ?></th>
                <th><?php echo e(__('study_goal_list_report.col_subject')); ?></th>
                <th><?php echo e(__('study_goal_list_report.col_topic')); ?></th>
                <th><?php echo e(__('study_goal_list_report.col_job_type')); ?></th>
                <th><?php echo e(__('study_goal_list_report.col_date_from')); ?></th>
                <th><?php echo e(__('study_goal_list_report.col_date_to')); ?></th>
                <th><?php echo e(__('study_goal_list_report.col_extended_date')); ?></th>
                <th><?php echo e(__('study_goal_list_report.col_study_goal_status')); ?></th>
                <th><?php echo e(__('study_goal_list_report.col_status')); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php $__currentLoopData = $rows; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($row['member_name']); ?></td>
                    <td><?php echo e($row['subject_name']); ?></td>
                    <td><?php echo e($row['topic_name']); ?></td>
                    <td><?php echo e($row['job_type_name']); ?></td>
                    <td><?php echo e($row['date_from']); ?></td>
                    <td><?php echo e($row['date_to']); ?></td>
                    <td><?php echo e($row['extended_date']); ?></td>
                    <td>
                        <?php
                            $statusKey = match ($row['study_goal_status'] ?? '') {
                                'doing' => 'goal_status_doing',
                                'completed' => 'goal_status_completed',
                                default => 'goal_status_pending',
                            };
                        ?>
                        <?php echo e(__("study_goal_list_report.{$statusKey}")); ?>

                    </td>
                    <td><?php echo e($row['status'] ? __('study_goal_list_report.status_active') : __('study_goal_list_report.status_inactive')); ?></td>
                </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="8"><?php echo e(__('study_goal_list_report.total_row')); ?></td>
                <td><?php echo e($formatter->integer($total_records)); ?></td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
<?php /**PATH C:\Drive D\Personal Project\Expense\expense-app\resources\views\reports\study-goal-list.blade.php ENDPATH**/ ?>