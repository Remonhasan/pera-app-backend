<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo e(__('expense_target_report.title')); ?></title>
    <?php echo $__env->make('reports.partials.styles', ['reportFontSize' => '8px'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
</head>
<body>
    <h1><?php echo e(__('expense_target_report.header')); ?></h1>
    <div class="meta">
        <?php echo e(__('expense_target_report.period')); ?>:
        <?php if(! empty($filters['date_from']) && ! empty($filters['date_to'])): ?>
            <?php echo e($filters['date_from']); ?> <?php echo e(__('expense_target_report.to')); ?> <?php echo e($filters['date_to']); ?>

        <?php elseif(! empty($filters['month']) && ! empty($filters['year'])): ?>
            <?php echo e($filters['month']); ?>/<?php echo e($filters['year']); ?>

        <?php elseif(! empty($filters['month_from']) || ! empty($filters['month_to']) || ! empty($filters['year_from']) || ! empty($filters['year_to'])): ?>
            <?php echo e($filters['month_from'] ?? '…'); ?>/<?php echo e($filters['year_from'] ?? '…'); ?>

            <?php echo e(__('expense_target_report.to')); ?>

            <?php echo e($filters['month_to'] ?? '…'); ?>/<?php echo e($filters['year_to'] ?? '…'); ?>

        <?php else: ?>
            <?php echo e(__('expense_target_report.all_periods')); ?>

        <?php endif; ?>
        &nbsp;|&nbsp;
        <?php echo e(__('expense_target_report.generated')); ?>: <?php echo e($formatter->dateTime('Y-m-d H:i')); ?>

    </div>

    <table class="data">
        <thead>
            <tr>
                <th style="width: 3%">#</th>
                <th style="width: 9%"><?php echo e(__('expense_target_report.col_member')); ?></th>
                <th style="width: 9%"><?php echo e(__('expense_target_report.col_budget_type')); ?></th>
                <th style="width: 6%"><?php echo e(__('expense_target_report.col_month')); ?></th>
                <th style="width: 5%"><?php echo e(__('expense_target_report.col_year')); ?></th>
                <th style="width: 8%" class="num"><?php echo e(__('expense_target_report.col_amount_per_day')); ?></th>
                <th style="width: 9%" class="num"><?php echo e(__('expense_target_report.col_target_budget')); ?></th>
                <th style="width: 9%" class="num"><?php echo e(__('expense_target_report.col_total_expense')); ?></th>
                <th style="width: 9%"><?php echo e(__('expense_target_report.col_mission_status')); ?></th>
                <th style="width: 7%" class="num"><?php echo e(__('expense_target_report.col_extra_cost')); ?></th>
                <th style="width: 9%" class="num"><?php echo e(__('expense_target_report.col_remaining_per_month')); ?></th>
                <th style="width: 9%" class="num"><?php echo e(__('expense_target_report.col_remaining_per_day')); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php $__currentLoopData = $rows; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($formatter->integer($index + 1)); ?></td>
                    <td><?php echo e($row['member_name']); ?></td>
                    <td><?php echo e($row['budget_type_name']); ?></td>
                    <td><?php echo e($row['month'] ?? '—'); ?></td>
                    <td><?php echo e($row['year'] ?? '—'); ?></td>
                    <td class="num"><?php echo e($formatter->decimal($row['amount_per_day'])); ?></td>
                    <td class="num"><?php echo e($formatter->decimal($row['budget_amount'])); ?></td>
                    <td class="num"><?php echo e($formatter->decimal($row['total_expense'])); ?></td>
                    <td>
                        <?php echo e($row['mission_completed']
                            ? __('expense_target_report.mission_completed')
                            : __('expense_target_report.mission_in_progress')); ?>

                    </td>
                    <td class="num">
                        <?php echo e(($row['extra_cost'] ?? 0) > 0 ? $formatter->decimal($row['extra_cost']) : '—'); ?>

                    </td>
                    <td class="num">
                        <?php echo e(($row['remaining_to_spend'] ?? 0) > 0 ? $formatter->decimal($row['remaining_to_spend']) : '—'); ?>

                    </td>
                    <td class="num">
                        <?php echo e(($row['extra_cost'] ?? 0) > 0 ? '—' : $formatter->decimal($row['remaining_per_day'] ?? 0)); ?>

                    </td>
                </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="6"><?php echo e(__('expense_target_report.total_row')); ?></td>
                <td class="num"><?php echo e($formatter->decimal($summary['total_budget'] ?? 0)); ?></td>
                <td class="num"><?php echo e($formatter->decimal($summary['total_expense'] ?? 0)); ?></td>
                <td></td>
                <td class="num"><?php echo e($formatter->decimal($summary['total_extra_cost'] ?? 0)); ?></td>
                <td class="num"><?php echo e($formatter->decimal($summary['total_remaining_to_spend'] ?? 0)); ?></td>
                <td class="num"><?php echo e($formatter->decimal($summary['total_remaining_per_day'] ?? 0)); ?></td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
<?php /**PATH C:\Drive D\Personal Project\Expense\expense-app\resources\views/reports/expense-target.blade.php ENDPATH**/ ?>