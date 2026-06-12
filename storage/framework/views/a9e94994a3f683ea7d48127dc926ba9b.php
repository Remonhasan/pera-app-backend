<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo e(__('study_report.title')); ?></title>
    <?php echo $__env->make('reports.partials.styles', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
</head>
<body>
    <h1><?php echo e(__('study_report.header')); ?></h1>
    <div class="meta">
        <?php echo e(__('study_report.period')); ?>:
        <?php if(! empty($filters['date_from']) && ! empty($filters['date_to'])): ?>
            <?php echo e($filters['date_from']); ?> <?php echo e(__('study_report.to')); ?> <?php echo e($filters['date_to']); ?>

        <?php else: ?>
            <?php echo e(__('study_report.all_dates')); ?>

        <?php endif; ?>
        &nbsp;|&nbsp;
        <?php echo e(__('study_report.generated')); ?>: <?php echo e($formatter->dateTime('Y-m-d H:i')); ?>

    </div>

    <table class="data">
        <thead>
            <tr>
                <th style="width: 4%">#</th>
                <th style="width: 10%"><?php echo e(__('study_report.col_date')); ?></th>
                <th style="width: 14%"><?php echo e(__('study_report.col_member')); ?></th>
                <th style="width: 14%"><?php echo e(__('study_report.col_subject')); ?></th>
                <th style="width: 14%"><?php echo e(__('study_report.col_topic')); ?></th>
                <th style="width: 16%"><?php echo e(__('study_report.col_job_type')); ?></th>
                <th style="width: 28%"><?php echo e(__('study_report.col_drive_link')); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php $__currentLoopData = $rows; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($formatter->integer($index + 1)); ?></td>
                    <td><?php echo e($row['date'] ?? '—'); ?></td>
                    <td><?php echo e($row['member_name']); ?></td>
                    <td><?php echo e($row['subject_name']); ?></td>
                    <td><?php echo e($row['topic_name']); ?></td>
                    <td><?php echo e($row['job_type_names']); ?></td>
                    <td><?php echo e($row['drive_link'] ?? '—'); ?></td>
                </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="6"><?php echo e(__('study_report.total_row')); ?></td>
                <td><?php echo e($formatter->integer($total_records)); ?></td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
<?php /**PATH C:\Drive D\Personal Project\Expense\expense-app\resources\views\reports\study.blade.php ENDPATH**/ ?>