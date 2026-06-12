<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo e(__('topicwise_study_goal_report.title')); ?></title>
    <?php echo $__env->make('reports.partials.styles', ['reportFontSize' => '9px'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
    <style>
        .section-title {
            font-family: 'noto sans bengali', 'DejaVu Sans', sans-serif;
            font-size: 11px;
            font-weight: bold;
            margin: 12px 0 6px;
            color: #1e3a5f;
        }
        .sub-table { margin-bottom: 10px; }
        .sub-table th { background: #4a6fa5; font-size: 8px; }
    </style>
</head>
<body>
    <h1><?php echo e(__('topicwise_study_goal_report.header')); ?></h1>
    <div class="meta">
        <?php echo e(__('topicwise_study_goal_report.period')); ?>:
        <?php if(! empty($filters['date_from']) && ! empty($filters['date_to'])): ?>
            <?php echo e($filters['date_from']); ?> <?php echo e(__('topicwise_study_goal_report.to')); ?> <?php echo e($filters['date_to']); ?>

        <?php else: ?>
            <?php echo e(__('topicwise_study_goal_report.all_dates')); ?>

        <?php endif; ?>
        &nbsp;|&nbsp;
        <?php echo e(__('topicwise_study_goal_report.generated')); ?>: <?php echo e($formatter->dateTime('Y-m-d H:i')); ?>

    </div>

    <table class="data">
        <thead>
            <tr>
                <th><?php echo e(__('topicwise_study_goal_report.col_subject')); ?></th>
                <th><?php echo e(__('topicwise_study_goal_report.col_topic')); ?></th>
                <th><?php echo e(__('topicwise_study_goal_report.col_total')); ?></th>
                <th><?php echo e(__('topicwise_study_goal_report.col_pending')); ?></th>
                <th><?php echo e(__('topicwise_study_goal_report.col_doing')); ?></th>
                <th><?php echo e(__('topicwise_study_goal_report.col_completed')); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php $__currentLoopData = $rows; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($row['subject_name']); ?></td>
                    <td><?php echo e($row['topic_name']); ?></td>
                    <td><?php echo e($formatter->integer($row['total'])); ?></td>
                    <td><?php echo e($formatter->integer($row['pending'])); ?></td>
                    <td><?php echo e($formatter->integer($row['doing'])); ?></td>
                    <td><?php echo e($formatter->integer($row['completed'])); ?></td>
                </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2"><?php echo e(__('topicwise_study_goal_report.total_row')); ?></td>
                <td colspan="4"><?php echo e($formatter->integer($total_records)); ?></td>
            </tr>
        </tfoot>
    </table>

    <?php $__currentLoopData = $rows; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <?php if(! empty($row['goals'])): ?>
            <div class="section-title"><?php echo e($row['subject_name']); ?> — <?php echo e($row['topic_name']); ?></div>
            <table class="data sub-table">
                <thead>
                    <tr>
                        <th><?php echo e(__('topicwise_study_goal_report.col_member')); ?></th>
                        <th><?php echo e(__('topicwise_study_goal_report.col_job_type')); ?></th>
                        <th><?php echo e(__('topicwise_study_goal_report.col_date_from')); ?></th>
                        <th><?php echo e(__('topicwise_study_goal_report.col_date_to')); ?></th>
                        <th><?php echo e(__('topicwise_study_goal_report.col_extended_date')); ?></th>
                        <th><?php echo e(__('topicwise_study_goal_report.col_status')); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php $__currentLoopData = $row['goals']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $goal): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <tr>
                            <td><?php echo e($goal['member_name']); ?></td>
                            <td><?php echo e($goal['job_type_name']); ?></td>
                            <td><?php echo e($goal['date_from'] ?? '—'); ?></td>
                            <td><?php echo e($goal['date_to'] ?? '—'); ?></td>
                            <td><?php echo e($goal['extended_date'] ?? '—'); ?></td>
                            <td>
                                <?php
                                    $statusKey = match ($goal['study_goal_status'] ?? '') {
                                        'doing' => 'status_doing',
                                        'completed' => 'status_completed',
                                        default => 'status_pending',
                                    };
                                ?>
                                <?php echo e(__("topicwise_study_goal_report.{$statusKey}")); ?>

                            </td>
                        </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </tbody>
            </table>
        <?php endif; ?>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
</body>
</html>
<?php /**PATH C:\Drive D\Personal Project\Expense\expense-app\resources\views\reports\topicwise-study-goal.blade.php ENDPATH**/ ?>