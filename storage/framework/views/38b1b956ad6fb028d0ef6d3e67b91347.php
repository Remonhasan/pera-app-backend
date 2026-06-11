<?php
    $reportFontSize = $reportFontSize ?? '10px';
?>
<style>
    * { box-sizing: border-box; }
    html, body, table, th, td, h1, div, span {
        font-family: 'noto sans bengali', 'DejaVu Sans', sans-serif;
    }
    html, body {
        font-size: <?php echo e($reportFontSize); ?>;
        color: #1e3a5f;
        margin: 0;
        padding: 24px;
        background: #ffffff;
    }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .meta { color: #555; margin-bottom: 16px; }
    table.data {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }
    table.data th,
    table.data td {
        border: 1px solid #d9d9d9;
        padding: 5px 6px;
        text-align: left;
        word-wrap: break-word;
    }
    table.data th {
        background: #1e3a5f;
        color: #fff;
        font-weight: bold;
    }
    table.data tr:nth-child(even) td { background: #fafafa; }
    table.data tfoot td {
        background: #f5f7fa;
        font-weight: bold;
    }
    .num { text-align: right; }
</style>
<?php /**PATH C:\Drive D\Personal Project\Expense\expense-app\resources\views/reports/partials/styles.blade.php ENDPATH**/ ?>