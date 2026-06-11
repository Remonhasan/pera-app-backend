<?php

$base = dirname(__DIR__);
$outputFile = $base.'/app/OpenApi/Paths/ResourcePaths.php';

$resources = [
    ['budget-types', 'budget_type', 'Budget Types', 'Finance', 'budget_type'],
    ['budgets', 'budget', 'Budgets', 'Finance', 'budget'],
    ['expense-targets', 'expense_target', 'Expense Targets', 'Finance', 'expense_target'],
    ['expense-types', 'expense_type', 'Expense Types', 'Finance', 'expense_type'],
    ['expenses', 'expense', 'Expenses', 'Finance', 'expense'],
    ['banks', 'bank', 'Banks', 'Finance', 'bank'],
    ['saving-types', 'saving_type', 'Saving Types', 'Finance', 'saving_type'],
    ['savings', 'saving', 'Savings', 'Finance', 'saving'],
    ['withdraws', 'withdraw', 'Withdraws', 'Finance', 'withdraw'],
    ['goals', 'goal', 'Goals', 'Finance', 'goal'],
    ['job-types', 'job_type', 'Job Types', 'Study', 'job_type'],
    ['subjects', 'subject', 'Subjects', 'Study', 'subject'],
    ['topics', 'topic', 'Topics', 'Study', 'topic'],
    ['notes', 'note', 'Notes', 'Study', 'note'],
    ['study-goals', 'study_goal', 'Study Goals', 'Study', 'study_goal'],
    ['exams', 'exam', 'Exams', 'Study', 'exam'],
    ['task-types', 'task_type', 'Task Types', 'Tasks & Habits', 'task_type'],
    ['tasks', 'task', 'Tasks', 'Tasks & Habits', 'task'],
    ['habit-types', 'habit_type', 'Habit Types', 'Tasks & Habits', 'habit_type'],
    ['habits', 'habit', 'Habits', 'Tasks & Habits', 'habit'],
    ['admin-notices', 'notice', 'Admin Notices', 'Notices', 'notice'],
];

$extraPaths = <<<'PHP'

#[OA\Get(path: '/expenses/{expense}/image', operationId: 'expenseImage', summary: 'Get expense image', tags: ['Finance'], parameters: [new OA\Parameter(name: 'expense', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Image file', content: new OA\MediaType(mediaType: 'image/*', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/savings/{saving}/image', operationId: 'savingImage', summary: 'Get saving image', tags: ['Finance'], parameters: [new OA\Parameter(name: 'saving', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Image file', content: new OA\MediaType(mediaType: 'image/*', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/withdraws/{withdraw}/image', operationId: 'withdrawImage', summary: 'Get withdraw image', tags: ['Finance'], parameters: [new OA\Parameter(name: 'withdraw', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Image file', content: new OA\MediaType(mediaType: 'image/*', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/notes/{note}/file', operationId: 'noteFile', summary: 'Get note file', tags: ['Study'], parameters: [
    new OA\Parameter(name: 'note', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'path', in: 'query', required: true, schema: new OA\Schema(type: 'string')),
], responses: [new OA\Response(response: 200, description: 'File', content: new OA\MediaType(mediaType: 'application/octet-stream', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/exams/{exam}/file', operationId: 'examFile', summary: 'Get exam file', tags: ['Study'], parameters: [
    new OA\Parameter(name: 'exam', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'path', in: 'query', required: true, schema: new OA\Schema(type: 'string')),
], responses: [new OA\Response(response: 200, description: 'File', content: new OA\MediaType(mediaType: 'application/octet-stream', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/study-goals/export-pdf', operationId: 'studyGoalsExportPdf', summary: 'Export study goals as PDF', tags: ['Study'], parameters: [
    new OA\Parameter(name: 'date_from', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
    new OA\Parameter(name: 'date_to', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
    new OA\Parameter(name: 'user_id', in: 'query', schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'subject_id', in: 'query', schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'topic_id', in: 'query', schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'job_id', in: 'query', schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'goal_status', in: 'query', schema: new OA\Schema(type: 'string', enum: ['pending', 'doing', 'completed'])),
], responses: [new OA\Response(response: 200, description: 'PDF file', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary')))])]
#[OA\Get(path: '/exams/export-pdf', operationId: 'examsExportPdf', summary: 'Export exams as PDF', tags: ['Study'], parameters: [
    new OA\Parameter(name: 'date_from', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
    new OA\Parameter(name: 'date_to', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
    new OA\Parameter(name: 'job_type_id', in: 'query', schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'exam_status', in: 'query', schema: new OA\Schema(type: 'string')),
], responses: [new OA\Response(response: 200, description: 'PDF file', content: new OA\MediaType(mediaType: 'application/pdf', schema: new OA\Schema(type: 'string', format: 'binary')))])]

PHP;

$lines = ["<?php\n", "namespace App\\OpenApi\\Paths;\n\n", "use OpenApi\\Attributes as OA;\n\n"];

foreach ($resources as [$uri, $param, $title, $tag, $permission]) {
    $opPrefix = str_replace(['-', '/'], '_', $uri);
    $lines[] = "#[OA\\Get(path: '/{$uri}', operationId: 'list_{$opPrefix}', summary: 'List {$title}', description: 'Requires {$permission}_list permission.', tags: ['{$tag}'], responses: [new OA\\Response(response: 200, description: 'List retrieved', content: new OA\\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')), new OA\\Response(response: 403, description: 'Forbidden')])]\n";
    $lines[] = "#[OA\\Post(path: '/{$uri}', operationId: 'create_{$opPrefix}', summary: 'Create {$title}', description: 'Requires {$permission}_create permission.', tags: ['{$tag}'], requestBody: new OA\\RequestBody(content: new OA\\JsonContent(type: 'object')), responses: [new OA\\Response(response: 201, description: 'Created', content: new OA\\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')), new OA\\Response(response: 403, description: 'Forbidden')])]\n";
    $lines[] = "#[OA\\Put(path: '/{$uri}/{{$param}}', operationId: 'update_{$opPrefix}', summary: 'Update {$title}', description: 'Requires {$permission}_edit permission.', tags: ['{$tag}'], parameters: [new OA\\Parameter(name: '{$param}', in: 'path', required: true, schema: new OA\\Schema(type: 'integer'))], requestBody: new OA\\RequestBody(content: new OA\\JsonContent(type: 'object')), responses: [new OA\\Response(response: 200, description: 'Updated', content: new OA\\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')), new OA\\Response(response: 403, description: 'Forbidden')])]\n";
    $lines[] = "#[OA\\Delete(path: '/{$uri}/{{$param}}', operationId: 'delete_{$opPrefix}', summary: 'Delete {$title}', description: 'Requires {$permission}_delete permission.', tags: ['{$tag}'], parameters: [new OA\\Parameter(name: '{$param}', in: 'path', required: true, schema: new OA\\Schema(type: 'integer'))], responses: [new OA\\Response(response: 200, description: 'Deleted', content: new OA\\JsonContent(ref: '#/components/schemas/ApiSuccessResponse')), new OA\\Response(response: 403, description: 'Forbidden')])]\n";
}

$lines[] = $extraPaths;
$lines[] = "class ResourcePaths\n{\n}\n";

file_put_contents($outputFile, implode('', $lines));
echo "Generated {$outputFile}\n";
