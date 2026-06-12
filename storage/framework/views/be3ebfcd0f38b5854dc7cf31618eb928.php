<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo e(__('daily_expense_report.title')); ?></title>
    <?php echo $__env->make('reports.partials.styles', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
</head>
<body>
    <h1><?php echo e(__('daily_expense_report.header')); ?></h1>
    <div class="meta">
        <?php echo e(__('daily_expense_report.period')); ?>:
        <?php if(! empty($filters['date_from']) && ! empty($filters['date_to'])): ?>
            <?php echo e($filters['date_from']); ?> <?php echo e(__('daily_expense_report.to')); ?> <?php echo e($filters['date_to']); ?>

        <?php else: ?>
            <?php echo e(__('daily_expense_report.all_dates')); ?>

        <?php endif; ?>
        &nbsp;|&nbsp;
        <?php echo e(__('daily_expense_report.generated')); ?>: <?php echo e($formatter->dateTime('Y-m-d H:i')); ?>

    </div>

    <table class="data">
        <thead>
            <tr>
                <th style="width: 4%">#</th>
                <th style="width: 10%"><?php echo e(__('daily_expense_report.col_date')); ?></th>
                <th style="width: 14%"><?php echo e(__('daily_expense_report.col_member')); ?></th>
                <th style="width: 12%"><?php echo e(__('daily_expense_report.col_expense_type')); ?></th>
                <th style="width: 14%"><?php echo e(__('daily_expense_report.col_name')); ?></th>
                <th style="width: 10%" class="num"><?php echo e(__('daily_expense_report.col_amount')); ?></th>
                <th style="width: 36%"><?php echo e(__('daily_expense_report.col_description')); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php $__currentLoopData = $rows; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($formatter->integer($index + 1)); ?></td>
                    <td><?php echo e($row['date'] ?? '—'); ?></td>
                    <td><?php echo e($row['member_name']); ?></td>
                    <td><?php echo e($row['expense_type_name']); ?></td>
                    <td><?php echo e($row['name'] ?? '—'); ?></td>
                    <td class="num"><?php echo e($formatter->decimal($row['amount'])); ?></td>
                    <td><?php echo e($row['description'] ?? '—'); ?></td>
                </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5"><?php echo e(__('daily_expense_report.total_row')); ?></td>
                <td class="num"><?php echo e($formatter->decimal($total_amount)); ?></td>
                <td></td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
<?php /**PATH C:\Drive D\Personal Project\Expense\expense-app\resources\views\reports\daily-expense.blade.php ENDPATH**/ ?>